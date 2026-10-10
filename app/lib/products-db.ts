import { getDb } from "../../db";
import { PRODUCTS, type StoreProduct } from "./catalog";

type ProductRow = {
  id: string;
  slug: string;
  nameEn: string;
  nameUr: string;
  shortNameEn: string;
  shortNameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  categoryEn: string;
  categoryUr: string;
  size: string;
  unitPrice: number;
  stockQuantity: number;
  imagesJson: string;
  featured: number;
  isActive: number;
  sortOrder: number;
};

const PRODUCT_SELECT = `SELECT id, slug, name_en AS nameEn, name_ur AS nameUr,
  short_name_en AS shortNameEn, short_name_ur AS shortNameUr,
  description_en AS descriptionEn, description_ur AS descriptionUr,
  category_en AS categoryEn, category_ur AS categoryUr, size,
  unit_price AS unitPrice, stock_quantity AS stockQuantity, images_json AS imagesJson,
  featured, is_active AS isActive, sort_order AS sortOrder FROM products`;

function parseImages(value: string) {
  try {
    const images = JSON.parse(value);
    return Array.isArray(images) ? images.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function fromRow(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: { en: row.nameEn, ur: row.nameUr || row.nameEn },
    shortName: { en: row.shortNameEn || row.nameEn, ur: row.shortNameUr || row.nameUr || row.nameEn },
    description: { en: row.descriptionEn, ur: row.descriptionUr || row.descriptionEn },
    category: { en: row.categoryEn, ur: row.categoryUr || row.categoryEn },
    size: row.size,
    unitPrice: Number(row.unitPrice),
    images: parseImages(row.imagesJson),
    featured: Boolean(row.featured),
    stockQuantity: Number(row.stockQuantity),
    isActive: Boolean(row.isActive),
    sortOrder: Number(row.sortOrder),
  };
}

export async function listStoreProducts(includeInactive = false): Promise<StoreProduct[]> {
  const db = getDb();
  const result = await db.prepare(`${PRODUCT_SELECT} ORDER BY sort_order, name_en`).all<ProductRow>();
  const databaseProducts = (result.results ?? []).map(fromRow);
  const databaseById = new Map(databaseProducts.map((product) => [product.id, product]));
  const merged = [
    ...PRODUCTS.map((product) => databaseById.get(product.id) ?? product),
    ...databaseProducts.filter((product) => !PRODUCTS.some((fallback) => fallback.id === product.id)),
  ];
  return merged
    .filter((product) => includeInactive || product.isActive)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder || a.name.en.localeCompare(b.name.en));
}

export async function getStoreProduct(productId: string) {
  const db = getDb();
  const row = await db.prepare(`${PRODUCT_SELECT} WHERE id = ?`).bind(productId).first<ProductRow>();
  return row ? fromRow(row) : PRODUCTS.find((product) => product.id === productId) ?? null;
}

export async function saveStoreProduct(product: StoreProduct) {
  const db = getDb();
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO products (
      id, slug, name_en, name_ur, short_name_en, short_name_ur, description_en, description_ur,
      category_en, category_ur, size, unit_price, stock_quantity, images_json,
      featured, is_active, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug, name_en = excluded.name_en, name_ur = excluded.name_ur,
      short_name_en = excluded.short_name_en, short_name_ur = excluded.short_name_ur,
      description_en = excluded.description_en, description_ur = excluded.description_ur,
      category_en = excluded.category_en, category_ur = excluded.category_ur, size = excluded.size,
      unit_price = excluded.unit_price, stock_quantity = excluded.stock_quantity,
      images_json = excluded.images_json, featured = excluded.featured, is_active = excluded.is_active,
      sort_order = excluded.sort_order, updated_at = excluded.updated_at`
  ).bind(
    product.id, product.slug, product.name.en, product.name.ur, product.shortName.en, product.shortName.ur,
    product.description.en, product.description.ur, product.category.en, product.category.ur,
    product.size, product.unitPrice, product.stockQuantity, JSON.stringify(product.images),
    product.featured ? 1 : 0, product.isActive ? 1 : 0, product.sortOrder, now, now
  ).run();

  if (product.featured) {
    await db.prepare("UPDATE products SET featured = 0, updated_at = ? WHERE id != ? AND featured = 1")
      .bind(now, product.id).run();
    const mergedProducts = await listStoreProducts(true);
    for (const otherProduct of mergedProducts) {
      if (otherProduct.id !== product.id && otherProduct.featured) {
        await saveStoreProduct({ ...otherProduct, featured: false });
      }
    }
  }
  return getStoreProduct(product.id);
}

export async function archiveStoreProduct(productId: string) {
  const product = await getStoreProduct(productId);
  if (!product) return false;
  await saveStoreProduct({ ...product, isActive: false, featured: false });
  return true;
}
