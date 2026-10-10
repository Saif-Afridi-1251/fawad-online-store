import {
  CURRENCY,
  MAX_ITEM_QUANTITY,
  PAKISTAN_DELIVERY_FEE,
} from "./catalog";
import { getStoreProduct } from "./products-db";

export type PaymentMethod = "cod" | "card" | "jazzcash" | "easypaisa";

export type CartItemInput = { productId: string; quantity: number };

export type PricedOrderItem = CartItemInput & {
  productName: string;
  unitPrice: number;
  lineTotal: number;
};

export type CheckoutCustomer = {
  customer: string;
  phone: string;
  customerEmail: string;
  city: string;
  country: "Pakistan";
  address: string;
};

export type CheckoutOrder = CheckoutCustomer & {
  items: PricedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: typeof CURRENCY;
};

type ParseResult =
  | { ok: true; order: CheckoutOrder }
  | { ok: false; error: string };

export function clean(value: unknown, maxLength = 300) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function parseCheckoutOrder(value: unknown): Promise<ParseResult> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid checkout information." };
  }

  const input = value as Record<string, unknown>;
  const customer = clean(input.customer, 100);
  const phone = clean(input.phone, 40);
  const customerEmail = clean(input.customerEmail, 160);
  const city = clean(input.city, 100);
  const address = clean(input.address, 500);
  const rawItems = Array.isArray(input.items) ? input.items : [];

  if (!customer || !phone || !city || !address) {
    return { ok: false, error: "Required checkout information is missing." };
  }
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return { ok: false, error: "A valid customer email address is required for order confirmation." };
  }
  if (rawItems.length < 1 || rawItems.length > 30) {
    return { ok: false, error: "Your cart is empty or invalid." };
  }

  const quantities = new Map<string, number>();
  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== "object") {
      return { ok: false, error: "A cart item is invalid." };
    }
    const item = rawItem as Record<string, unknown>;
    const productId = clean(item.productId, 80);
    const quantity = Number(item.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, error: "A cart item is invalid." };
    }
    const combined = (quantities.get(productId) ?? 0) + quantity;
    if (combined > MAX_ITEM_QUANTITY) {
      return { ok: false, error: "The maximum quantity per product is 20." };
    }
    quantities.set(productId, combined);
  }

  const items: PricedOrderItem[] = [];
  for (const [productId, quantity] of quantities) {
    const product = await getStoreProduct(productId);
    if (!product || !product.isActive || product.stockQuantity < quantity) {
      return { ok: false, error: "A product is unavailable or does not have enough stock." };
    }
    items.push({
      productId,
      quantity,
      productName: `${product.name.en} — ${product.size}`,
      unitPrice: product.unitPrice,
      lineTotal: product.unitPrice * quantity,
    });
  }
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = PAKISTAN_DELIVERY_FEE;

  return {
    ok: true,
    order: {
      customer,
      phone,
      customerEmail,
      city,
      country: "Pakistan",
      address,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      currency: CURRENCY,
    },
  };
}

export function createOrderId() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `FOS-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export function createPaymentMetadata(orderId: string, order: CheckoutOrder) {
  return {
    source: "fawad-online-store",
    order_id: orderId,
    expected_amount: String(order.total * 100),
  };
}

export function parsePaymentMetadata(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const metadata = value as Record<string, unknown>;
  if (clean(metadata.source, 40) !== "fawad-online-store") return null;
  const orderId = clean(metadata.order_id, 50);
  const expectedAmount = Number(metadata.expected_amount);
  if (!orderId.startsWith("FOS-") || !Number.isInteger(expectedAmount) || expectedAmount < 1) return null;
  return { orderId, expectedAmount };
}
