import { notifyOrderParties } from "../../../lib/order-email";
import { parsePaymentMetadata } from "../../../lib/order";
import { getOrder, markOrderPaid } from "../../../lib/orders-db";
import { getSafepayConfig } from "../../../lib/safepay";

export async function GET(request: Request) {
  const trackerToken = new URL(request.url).searchParams.get("tracker")?.trim() ?? "";
  if (!/^track_[a-zA-Z0-9-]{10,100}$/.test(trackerToken)) {
    return Response.json({ ok: false, error: "Invalid payment reference." }, { status: 400 });
  }
  const config = getSafepayConfig();
  if (!config) {
    return Response.json({ ok: false, error: "Payment verification is not configured." }, { status: 503 });
  }

  try {
    const payment = await config.client.reporter.payments.fetch(trackerToken);
    const tracker = payment?.data?.tracker;
    const parsed = parsePaymentMetadata(tracker?.metadata ?? payment?.data?.metadata);
    const state = String(tracker?.state ?? "");
    const amount = Number(tracker?.purchase_totals?.quote_amount?.amount);
    const currency = String(tracker?.purchase_totals?.quote_amount?.currency ?? "");
    if (!parsed) return Response.json({ ok: false, error: "Order details could not be verified." }, { status: 409 });

    const stored = await getOrder(parsed.orderId);
    if (!stored || stored.paymentReference !== trackerToken) {
      return Response.json({ ok: false, error: "Order record could not be verified." }, { status: 409 });
    }
    if (state !== "TRACKER_ENDED") return Response.json({ ok: true, paid: false, state });
    if (currency !== "PKR" || amount !== stored.total * 100 || amount !== parsed.expectedAmount) {
      return Response.json({ ok: false, error: "Payment amount could not be verified." }, { status: 409 });
    }

    const paid = stored.status === "paid" ? stored : await markOrderPaid(stored.id, "safepay", trackerToken);
    if (!paid) throw new Error("Paid order could not be read.");
    await notifyOrderParties(paid);
    return Response.json({ ok: true, paid: true, orderId: paid.id });
  } catch (error) {
    console.error("Safepay payment verification failed", {
      trackerToken,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ ok: false, error: "Payment is still being verified." }, { status: 502 });
  }
}
