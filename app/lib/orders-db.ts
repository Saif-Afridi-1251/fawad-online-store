import { getDb } from "../../db";
import type { CheckoutOrder, PaymentMethod } from "./order";

export type StoredOrderItem = {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type StoredOrder = {
  id: string;
  status: string;
  paymentMethod: string;
  paymentProvider: string;
  paymentReference: string | null;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  address: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  notificationStatus: string;
  ownerEmailStatus: string;
  customerEmailStatus: string;
  emailLastError: string;
  createdAt: string;
  updatedAt: string;
  items: StoredOrderItem[];
};

type OrderRow = Omit<StoredOrder, "items">;

export type AdminOrderSummary = {
  id: string;
  status: string;
  paymentMethod: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  address: string;
  total: number;
  currency: string;
  ownerEmailStatus: string;
  customerEmailStatus: string;
  createdAt: string;
  itemCount: number;
  itemsSummary: string;
};

export async function createOrderRecord({
  id,
  status,
  paymentMethod,
  paymentProvider,
  paymentReference,
  order,
}: {
  id: string;
  status: string;
  paymentMethod: PaymentMethod;
  paymentProvider: string;
  paymentReference?: string;
  order: CheckoutOrder;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const statements = [
    db
      .prepare(
        `INSERT INTO orders (
          id, status, payment_method, payment_provider, payment_reference,
          customer_name, phone, email, city, country, address,
          subtotal, delivery_fee, total, currency, notification_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
      )
      .bind(
        id, status, paymentMethod, paymentProvider, paymentReference ?? null,
        order.customer, order.phone, order.customerEmail, order.city, order.country, order.address,
        order.subtotal, order.deliveryFee, order.total, order.currency, now, now
      ),
    ...order.items.map((item) =>
      db
        .prepare(
          `INSERT INTO order_items (
            order_id, product_id, product_name, unit_price, quantity, line_total
          ) VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(id, item.productId, item.productName, item.unitPrice, item.quantity, item.lineTotal)
    ),
  ];
  await db.batch(statements);
}

export async function getOrder(orderId: string): Promise<StoredOrder | null> {
  const db = getDb();
  const row = await db
    .prepare(
      `SELECT
        id, status, payment_method AS paymentMethod, payment_provider AS paymentProvider,
        payment_reference AS paymentReference, customer_name AS customerName, phone, email,
        city, country, address, subtotal, delivery_fee AS deliveryFee, total, currency,
        notification_status AS notificationStatus, owner_email_status AS ownerEmailStatus,
        customer_email_status AS customerEmailStatus, email_last_error AS emailLastError,
        created_at AS createdAt, updated_at AS updatedAt
      FROM orders WHERE id = ?`
    )
    .bind(orderId)
    .first<OrderRow>();
  if (!row) return null;
  const itemResult = await db
    .prepare(
      `SELECT product_id AS productId, product_name AS productName, unit_price AS unitPrice,
        quantity, line_total AS lineTotal FROM order_items WHERE order_id = ? ORDER BY id`
    )
    .bind(orderId)
    .all<StoredOrderItem>();
  return { ...row, items: itemResult.results ?? [] };
}

export async function markOrderPaid(orderId: string, provider: string, reference: string) {
  const db = getDb();
  await db
    .prepare(
      `UPDATE orders SET status = 'paid', payment_provider = ?, payment_reference = ?, updated_at = ?
       WHERE id = ? AND status = 'pending_payment'`
    )
    .bind(provider, reference, new Date().toISOString(), orderId)
    .run();
  return getOrder(orderId);
}

export async function setEmailDeliveryStatuses({
  orderId,
  ownerStatus,
  customerStatus,
  error,
}: {
  orderId: string;
  ownerStatus: string;
  customerStatus: string;
  error?: string;
}) {
  const db = getDb();
  const notificationStatus = ownerStatus === "sent" && customerStatus === "sent" ? "sent" : "failed";
  await db
    .prepare(
      `UPDATE orders SET notification_status = ?, owner_email_status = ?, customer_email_status = ?,
       email_last_error = ?, updated_at = ? WHERE id = ?`
    )
    .bind(
      notificationStatus,
      ownerStatus,
      customerStatus,
      (error ?? "").slice(0, 500),
      new Date().toISOString(),
      orderId
    )
    .run();
}

export async function listRecentOrders(limit = 100): Promise<AdminOrderSummary[]> {
  const result = await getDb().prepare(
    `SELECT o.id, o.status, o.payment_method AS paymentMethod,
      o.customer_name AS customerName, o.phone, o.email, o.city, o.country, o.address,
      o.total, o.currency, o.owner_email_status AS ownerEmailStatus,
      o.customer_email_status AS customerEmailStatus, o.created_at AS createdAt,
      COALESCE(SUM(oi.quantity), 0) AS itemCount,
      COALESCE(GROUP_CONCAT(oi.product_name || ' × ' || oi.quantity, ', '), '') AS itemsSummary
     FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id ORDER BY o.created_at DESC LIMIT ?`
  ).bind(Math.max(1, Math.min(limit, 200))).all<AdminOrderSummary>();
  return (result.results ?? []).map((order) => ({
    ...order,
    total: Number(order.total),
    itemCount: Number(order.itemCount),
  }));
}

export async function updateOrderStatus(orderId: string, status: string) {
  await getDb().prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), orderId).run();
  return getOrder(orderId);
}
