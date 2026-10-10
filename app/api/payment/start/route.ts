import { createOrderId, createPaymentMetadata, parseCheckoutOrder } from "../../../lib/order";
import { createOrderRecord } from "../../../lib/orders-db";
import { getSafepayConfig } from "../../../lib/safepay";

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid checkout information." }, { status: 400 });
  }

  const body = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const paymentMethod = String(body.paymentMethod ?? "");
  if (paymentMethod === "jazzcash" || paymentMethod === "easypaisa") {
    return Response.json(
      {
        ok: false,
        code: "MERCHANT_GATEWAY_REQUIRED",
        error: `${paymentMethod === "jazzcash" ? "JazzCash" : "Easypaisa"} online checkout is awaiting merchant gateway activation.`,
      },
      { status: 503 }
    );
  }
  if (paymentMethod !== "card") {
    return Response.json({ ok: false, error: "Select a valid online payment method." }, { status: 400 });
  }

  const parsed = await parseCheckoutOrder(body);
  if (!parsed.ok) {
    return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const config = getSafepayConfig();
  if (!config) {
    return Response.json(
      { ok: false, code: "SAFEPAY_NOT_CONFIGURED", error: "Card payment is awaiting Safepay merchant activation." },
      { status: 503 }
    );
  }

  const orderId = createOrderId();
  try {
    const session = await config.client.payments.session.setup({
      merchant_api_key: config.apiKey,
      intent: config.intent,
      mode: "payment",
      entry_mode: "raw",
      currency: "PKR",
      amount: parsed.order.total * 100,
      metadata: createPaymentMetadata(orderId, parsed.order),
      include_fees: false,
    });
    const tracker = String(session?.data?.tracker?.token ?? "");
    const passport = await config.client.client.passport.create();
    const authenticationToken = String(passport?.data ?? "");
    if (!tracker.startsWith("track_") || !authenticationToken) {
      throw new Error("Safepay did not return a valid checkout session.");
    }

    await createOrderRecord({
      id: orderId,
      status: "pending_payment",
      paymentMethod: "card",
      paymentProvider: "safepay",
      paymentReference: tracker,
      order: parsed.order,
    });

    const origin = new URL(request.url).origin;
    const checkoutUrl = config.client.checkout.createCheckoutUrl({
      env: config.environment,
      tbt: authenticationToken,
      tracker,
      source: "hosted",
      order_id: orderId,
      redirect_url: `${origin}/payment/complete`,
      cancel_url: `${origin}/payment/cancel`,
    });
    return Response.json({ ok: true, checkoutUrl });
  } catch (error) {
    console.error("Safepay checkout could not be created", {
      orderId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ ok: false, error: "Secure payment could not be started. Please try again." }, { status: 502 });
  }
}
