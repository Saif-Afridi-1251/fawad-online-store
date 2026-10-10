import type { StoreProduct } from "../../../lib/catalog";
import { verifyAdminRequest } from "../../../lib/admin-auth";
import { archiveStoreProduct, listStoreProducts, saveStoreProduct } from "../../../lib/products-db";

export const dynamic = "force-dynamic";

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function cleanSlug(value: unknown) {
  return clean(value, 100).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseProduct(value: unknown): StoreProduct | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const name = input.name && typeof input.name === "object" ? input.name as Record<string, unknown> : {};
  const shortName = input.shortName && typeof input.shortName === "object" ? input.shortName as Record<string, unknown> : {};
  const description = input.description && typeof input.description === "object" ? input.description as Record<string, unknown> : {};
  const category = input.category && typeof input.category === "object" ? input.category as Record<string, unknown> : {};
  const id = cleanSlug(input.id) || crypto.randomUUID();
  const nameEn = clean(name.en, 120);
  const nameUr = clean(name.ur, 120);
  const slug = cleanSlug(input.slug) || cleanSlug(nameEn);
  const unitPrice = Number(input.unitPrice);
  const stockQuantity = Number(input.stockQuantity);
  const sortOrder = Number(input.sortOrder);
  const images = Array.isArray(input.images)
    ? input.images.map((item) => clean(item, 500)).filter((item) => item.startsWith("/") || item.startsWith("https://")).slice(0, 8)
    : [];
  if (!nameEn || !slug || !Number.isInteger(unitPrice) || unitPrice < 1 || unitPrice > 100000000) return null;
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 1000000) return null;
  return {
    id,
    slug,
    name: { en: nameEn, ur: nameUr || nameEn },
    shortName: { en: clean(shortName.en, 80) || nameEn, ur: clean(shortName.ur, 80) || nameUr || nameEn },
    description: { en: clean(description.en, 1000), ur: clean(description.ur, 1000) },
    category: { en: clean(category.en, 80) || "General", ur: clean(category.ur, 80) || "عمومی" },
    size: clean(input.size, 50),
    unitPrice,
    stockQuantity,
    images,
    featured: Boolean(input.featured),
    isActive: input.isActive !== false,
    sortOrder: Number.isInteger(sortOrder) ? Math.max(-1000, Math.min(sortOrder, 1000)) : 0,
  };
}

export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  return Response.json({ ok: true, products: await listStoreProducts(true) });
}

export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ ok: false, error: "Invalid product information." }, { status: 400 }); }
  const product = parseProduct(input);
  if (!product) return Response.json({ ok: false, error: "Enter a valid product name, price and stock quantity." }, { status: 400 });
  try {
    const currentProducts = await listStoreProducts(true);
    const existing = currentProducts.find((item) => item.id === product.id);
    if (existing?.isActive && !product.isActive && currentProducts.filter((item) => item.isActive).length <= 1) {
      return Response.json({ ok: false, error: "Keep at least one product visible in the store." }, { status: 400 });
    }
    const saved = await saveStoreProduct(product);
    return Response.json({ ok: true, product: saved, products: await listStoreProducts(true) });
  } catch (error) {
    console.error("Product could not be saved", error);
    return Response.json({ ok: false, error: "The product could not be saved. Check that its link name is unique." }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const id = cleanSlug(new URL(request.url).searchParams.get("id"));
  const currentProducts = await listStoreProducts(true);
  const currentProduct = currentProducts.find((item) => item.id === id);
  if (currentProduct?.isActive && currentProducts.filter((item) => item.isActive).length <= 1) {
    return Response.json({ ok: false, error: "Keep at least one product visible in the store." }, { status: 400 });
  }
  if (!id || !(await archiveStoreProduct(id))) return Response.json({ ok: false, error: "Product not found." }, { status: 404 });
  return Response.json({ ok: true, products: await listStoreProducts(true) });
}
