import { verifyAdminRequest } from "../../../lib/admin-auth";
import { listRecentOrders, updateOrderStatus } from "../../../lib/orders-db";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set(["cash_on_delivery", "pending_payment", "paid", "processing", "shipped", "completed", "cancelled"]);

export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  return Response.json({ ok: true, orders: await listRecentOrders() });
}

export async function PATCH(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  let input: Record<string, unknown>;
  try { input = await request.json() as Record<string, unknown>; } catch { return Response.json({ ok: false, error: "Invalid order update." }, { status: 400 }); }
  const id = String(input.id ?? "").trim().slice(0, 60);
  const status = String(input.status ?? "").trim();
  if (!id.startsWith("FOS-") || !ALLOWED_STATUSES.has(status)) return Response.json({ ok: false, error: "Invalid order update." }, { status: 400 });
  const order = await updateOrderStatus(id, status);
  if (!order) return Response.json({ ok: false, error: "Order not found." }, { status: 404 });
  return Response.json({ ok: true, orders: await listRecentOrders() });
}
