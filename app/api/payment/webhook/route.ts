import { notifyOrderParties } from "../../../lib/order-email";
import { parsePaymentMetadata } from "../../../lib/order";
import { getOrder, markOrderPaid } from "../../../lib/orders-db";

type SafepayWebhook = {
  type?: unknown;
  merchant_api_key?: unknown;
  data?: { tracker?: unknown; state?: unknown; amount?: unknown; currency?: unknown; metadata?: unknown };
};

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function createHmac(payload: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET?.trim();
  const apiKey = process.env.SAFEPAY_API_KEY?.trim();
  const providedSignature = request.headers.get("X-SFPY-SIGNATURE")?.trim().toLowerCase() ?? "";
  if (!webhookSecret || !apiKey) return Response.json({ ok: false, error: "Webhook is not configured." }, { status: 503 });

  const rawBody = await request.text();
  const expectedSignature = await createHmac(rawBody, webhookSecret);
  if (!providedSignature || !safeEqual(providedSignature, expectedSignature)) {
    return Response.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: SafepayWebhook;
  try { event = JSON.parse(rawBody) as SafepayWebhook; }
  catch { return Response.json({ ok: false, error: "Invalid webhook payload." }, { status: 400 }); }
  if (event.type !== "payment.succeeded") return Response.json({ ok: true, ignored: true });
  if (event.merchant_api_key !== apiKey) return Response.json({ ok: false, error: "Merchant could not be verified." }, { status: 401 });

  const tracker = String(event.data?.tracker ?? "");
  const parsed = parsePaymentMetadata(event.data?.metadata);
  if (!tracker.startsWith("track_") || String(event.data?.state ?? "") !== "TRACKER_ENDED" || !parsed) {
    return Response.json({ ok: false, error: "Paid order data is incomplete." }, { status: 400 });
  }

  const stored = await getOrder(parsed.orderId);
  const amount = Number(event.data?.amount);
  if (!stored || stored.paymentReference !== tracker || String(event.data?.currency ?? "") !== "PKR" || amount !== stored.total * 100 || amount !== parsed.expectedAmount) {
    return Response.json({ ok: false, error: "Paid amount or order record does not match." }, { status: 409 });
  }

  const paid = stored.status === "paid" ? stored : await markOrderPaid(stored.id, "safepay", tracker);
  if (!paid) return Response.json({ ok: false, error: "Paid order could not be updated." }, { status: 500 });
  const emailDelivery = await notifyOrderParties(paid);
  return Response.json({ ok: true, emailDelivery });
}
