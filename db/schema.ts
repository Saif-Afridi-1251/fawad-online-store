import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    status: text("status").notNull(),
    paymentMethod: text("payment_method").notNull(),
    paymentProvider: text("payment_provider").notNull(),
    paymentReference: text("payment_reference"),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().default(""),
    city: text("city").notNull(),
    country: text("country").notNull().default("Pakistan"),
    address: text("address").notNull(),
    subtotal: integer("subtotal").notNull(),
    deliveryFee: integer("delivery_fee").notNull(),
    total: integer("total").notNull(),
    currency: text("currency").notNull().default("PKR"),
    notificationStatus: text("notification_status").notNull().default("pending"),
    ownerEmailStatus: text("owner_email_status").notNull().default("pending"),
    customerEmailStatus: text("customer_email_status").notNull().default("pending"),
    emailLastError: text("email_last_error").notNull().default(""),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_orders_status_created_at").on(table.status, table.createdAt),
    index("idx_orders_phone").on(table.phone),
  ]
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (table) => [index("idx_order_items_order_id").on(table.orderId)]
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    nameEn: text("name_en").notNull(),
    nameUr: text("name_ur").notNull().default(""),
    shortNameEn: text("short_name_en").notNull().default(""),
    shortNameUr: text("short_name_ur").notNull().default(""),
    descriptionEn: text("description_en").notNull().default(""),
    descriptionUr: text("description_ur").notNull().default(""),
    categoryEn: text("category_en").notNull().default("General"),
    categoryUr: text("category_ur").notNull().default("عمومی"),
    size: text("size").notNull().default(""),
    unitPrice: integer("unit_price").notNull(),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    imagesJson: text("images_json").notNull().default("[]"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_products_slug").on(table.slug),
    index("idx_products_active_sort").on(table.isActive, table.sortOrder),
  ]
);

export const storeSettings = sqliteTable("store_settings", {
  id: text("id").primaryKey(),
  facebookUrl: text("facebook_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  xUrl: text("x_url").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});
