import { notifyOrderParties } from "../../../lib/order-email";
import { createOrderId, parseCheckoutOrder } from "../../../lib/order";
import { createOrderRecord, getOrder } from "../../../lib/orders-db";

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid checkout information." }, { status: 400 });
  }

  const parsed = await parseCheckoutOrder(input);
  if (!parsed.ok) {
    return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const orderId = createOrderId();
  try {
    await createOrderRecord({
      id: orderId,
      status: "cash_on_delivery",
      paymentMethod: "cod",
      paymentProvider: "cash_on_delivery",
      order: parsed.order,
    });
    const saved = await getOrder(orderId);
    if (!saved) throw new Error("Saved order could not be read.");
    const emailDelivery = await notifyOrderParties(saved);
    return Response.json({
      ok: true,
      orderId,
      emailDelivery,
      notified: emailDelivery.owner === "sent" && emailDelivery.customer === "sent",
    });
  } catch (error) {
    console.error("COD order could not be created", {
      orderId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ ok: false, error: "Your order could not be placed. Please try again." }, { status: 500 });
  }
}
