import { clean } from "../../../lib/order";
import { notifyOrderParties } from "../../../lib/order-email";
import { getOrder } from "../../../lib/orders-db";

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function POST(request: Request) {
  const adminToken = process.env.ORDER_ADMIN_TOKEN?.trim() ?? "";
  const providedToken = request.headers.get("X-Order-Admin-Token")?.trim() ?? "";
  if (!adminToken || !providedToken || !safeEqual(adminToken, providedToken)) {
    return Response.json({ ok: false, error: "Not authorized." }, { status: 403 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const orderId = clean((input as Record<string, unknown>)?.orderId, 50);
  if (!/^FOS-[A-Z0-9-]{8,40}$/.test(orderId)) {
    return Response.json({ ok: false, error: "Invalid order number." }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) return Response.json({ ok: false, error: "Order not found." }, { status: 404 });

  const emailDelivery = await notifyOrderParties(order);
  return Response.json({ ok: true, orderId, emailDelivery });
}
