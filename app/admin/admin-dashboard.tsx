"use client";

import {
  Archive,
  ArrowLeft,
  Boxes,
  Check,
  ExternalLink,
  ImagePlus,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  PackagePlus,
  Save,
  Settings,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import type { StoreProduct } from "../lib/catalog";
import type { AdminOrderSummary } from "../lib/orders-db";
import type { SocialLinks } from "../lib/store-settings-db";
import styles from "./admin-dashboard.module.css";

type Tab = "products" | "orders" | "social";

type Props = {
  initialProducts: StoreProduct[];
  initialSocialLinks: SocialLinks;
  initialOrders: AdminOrderSummary[];
  ownerName: string;
  signOutUrl: string;
};

const emptyProduct: StoreProduct = {
  id: "",
  slug: "",
  name: { en: "", ur: "" },
  shortName: { en: "", ur: "" },
  description: { en: "", ur: "" },
  category: { en: "General", ur: "عمومی" },
  size: "",
  unitPrice: 0,
  images: [],
  featured: false,
  stockQuantity: 0,
  isActive: true,
  sortOrder: 0,
};

const ORDER_STATUSES = [
  ["cash_on_delivery", "Cash on Delivery"],
  ["pending_payment", "Awaiting payment"],
  ["paid", "Paid"],
  ["processing", "Processing"],
  ["shipped", "Shipped"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
] as const;

export default function AdminDashboard({ initialProducts, initialSocialLinks, initialOrders, ownerName, signOutUrl }: Props) {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const [draft, setDraft] = useState<StoreProduct>(initialProducts[0] ?? emptyProduct);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeProducts = products.filter((product) => product.isActive).length;
  const pendingOrders = orders.filter((order) => !["completed", "cancelled"].includes(order.status)).length;
  const salesTotal = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const selectedIsExisting = useMemo(() => Boolean(draft.id && products.some((product) => product.id === draft.id)), [draft.id, products]);

  function clearStatus() {
    setMessage("");
    setError("");
  }

  function updateDraft(path: string, value: string | number | boolean) {
    clearStatus();
    setDraft((current) => {
      if (!path.includes(".")) return { ...current, [path]: value };
      const [group, key] = path.split(".") as ["name" | "shortName" | "description" | "category", "en" | "ur"];
      return { ...current, [group]: { ...current[group], [key]: value } };
    });
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    clearStatus();
    setBusy(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json() as { ok?: boolean; error?: string; product?: StoreProduct; products?: StoreProduct[] };
      if (!response.ok || !result.ok || !result.product || !result.products) throw new Error(result.error || "Product could not be saved.");
      setProducts(result.products);
      setDraft(result.product);
      setMessage("Product saved and the storefront catalog has been updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Product could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function archiveProduct() {
    if (!draft.id || !window.confirm(`Archive ${draft.name.en}? Customers will no longer see it.`)) return;
    clearStatus();
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(draft.id)}`, { method: "DELETE" });
      const result = await response.json() as { ok?: boolean; error?: string; products?: StoreProduct[] };
      if (!response.ok || !result.ok || !result.products) throw new Error(result.error || "Product could not be archived.");
      setProducts(result.products);
      setDraft(result.products.find((product) => product.id === draft.id) ?? emptyProduct);
      setMessage("Product archived. It is no longer visible to customers.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Product could not be archived.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, 8 - draft.images.length));
    event.target.value = "";
    if (!files.length) return;
    clearStatus();
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const result = await response.json() as { ok?: boolean; error?: string; url?: string };
        if (!response.ok || !result.ok || !result.url) throw new Error(result.error || "An image could not be uploaded.");
        uploaded.push(result.url);
      }
      setDraft((current) => ({ ...current, images: [...current.images, ...uploaded].slice(0, 8) }));
      setMessage(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded. Save the product to publish the change.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Images could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function saveSocial(event: FormEvent) {
    event.preventDefault();
    clearStatus();
    setBusy(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialLinks),
      });
      const result = await response.json() as { ok?: boolean; error?: string; socialLinks?: SocialLinks };
      if (!response.ok || !result.ok || !result.socialLinks) throw new Error(result.error || "Social links could not be saved.");
      setSocialLinks(result.socialLinks);
      setMessage("Social-media links saved. Active links now appear in the store footer.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Social links could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function changeOrderStatus(id: string, status: string) {
    clearStatus();
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json() as { ok?: boolean; error?: string; orders?: AdminOrderSummary[] };
      if (!response.ok || !result.ok || !result.orders) throw new Error(result.error || "Order could not be updated.");
      setOrders(result.orders);
      setMessage(`Order ${id} updated.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Order could not be updated.");
    }
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/"><span>F</span><strong>FAWAD<small>STORE ADMIN</small></strong></a>
        <nav>
          <button className={tab === "products" ? styles.active : ""} onClick={() => { setTab("products"); clearStatus(); }}><Boxes /> Products <b>{activeProducts}</b></button>
          <button className={tab === "orders" ? styles.active : ""} onClick={() => { setTab("orders"); clearStatus(); }}><ShoppingCart /> Orders <b>{orders.length}</b></button>
          <button className={tab === "social" ? styles.active : ""} onClick={() => { setTab("social"); clearStatus(); }}><Settings /> Store links</button>
        </nav>
        <div className={styles.sidebarFooter}>
          <a href="/" target="_blank"><ExternalLink /> View store</a>
          <a href={signOutUrl} target="_top"><LogOut /> Sign out</a>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div><span>SECURE OWNER DASHBOARD</span><h1>{tab === "products" ? "Product catalog" : tab === "orders" ? "Customer orders" : "Social-media links"}</h1></div>
          <div className={styles.owner}><span>{ownerName.slice(0, 1).toUpperCase()}</span><p><small>Signed in as</small><strong>{ownerName}</strong></p></div>
        </header>

        <div className={styles.stats}>
          <article><span><Boxes /></span><p>Active products<strong>{activeProducts}</strong></p></article>
          <article><span><ShoppingCart /></span><p>Open orders<strong>{pendingOrders}</strong></p></article>
          <article><span><LayoutDashboard /></span><p>Recorded order value<strong>PKR {salesTotal.toLocaleString("en-PK")}</strong></p></article>
        </div>

        {(message || error) && <div className={error ? styles.errorBanner : styles.successBanner}>{error ? <X /> : <Check />} {error || message}</div>}

        {tab === "products" && (
          <div className={styles.productWorkspace}>
            <section className={styles.productList}>
              <div className={styles.panelTitle}><div><span>CATALOG</span><h2>Products</h2></div><button onClick={() => { setDraft({ ...emptyProduct }); clearStatus(); }}><PackagePlus /> New</button></div>
              <div className={styles.productItems}>
                {products.map((product) => (
                  <button key={product.id} className={`${styles.productItem} ${draft.id === product.id ? styles.selected : ""}`} onClick={() => { setDraft(product); clearStatus(); }}>
                    <span className={styles.thumb}>{product.images[0] ? <img src={product.images[0]} alt="" /> : <Boxes />}</span>
                    <span><strong>{product.name.en}</strong><small>{product.size || "No size"} · PKR {product.unitPrice.toLocaleString("en-PK")}</small></span>
                    <i className={product.isActive ? styles.live : styles.archived}>{product.isActive ? "Live" : "Archived"}</i>
                  </button>
                ))}
              </div>
            </section>

            <form className={styles.editor} onSubmit={saveProduct}>
              <div className={styles.panelTitle}><div><span>{selectedIsExisting ? "EDIT PRODUCT" : "NEW PRODUCT"}</span><h2>{draft.name.en || "Product details"}</h2></div><div className={styles.editorActions}>{selectedIsExisting && <button type="button" className={styles.archiveButton} disabled={busy} onClick={archiveProduct}><Archive /> Archive</button>}<button type="submit" className={styles.saveButton} disabled={busy || uploading}>{busy ? <LoaderCircle className={styles.spin} /> : <Save />} Save product</button></div></div>

              <div className={styles.formGrid}>
                <label>English product name<input value={draft.name.en} onChange={(e) => updateDraft("name.en", e.target.value)} required /></label>
                <label className={styles.urduField}>اردو پروڈکٹ نام<input dir="rtl" value={draft.name.ur} onChange={(e) => updateDraft("name.ur", e.target.value)} /></label>
                <label>Short English name<input value={draft.shortName.en} onChange={(e) => updateDraft("shortName.en", e.target.value)} /></label>
                <label className={styles.urduField}>مختصر اردو نام<input dir="rtl" value={draft.shortName.ur} onChange={(e) => updateDraft("shortName.ur", e.target.value)} /></label>
                <label>English category<input value={draft.category.en} onChange={(e) => updateDraft("category.en", e.target.value)} /></label>
                <label className={styles.urduField}>اردو کیٹیگری<input dir="rtl" value={draft.category.ur} onChange={(e) => updateDraft("category.ur", e.target.value)} /></label>
                <label>Pack size<input placeholder="10g, 500ml, Large…" value={draft.size} onChange={(e) => updateDraft("size", e.target.value)} /></label>
                <label>Store link name<input placeholder="pure-salajit-10g" value={draft.slug} onChange={(e) => updateDraft("slug", e.target.value)} /></label>
                <label>Price in PKR<input type="number" min="1" value={draft.unitPrice || ""} onChange={(e) => updateDraft("unitPrice", Number(e.target.value))} required /></label>
                <label>Stock quantity<input type="number" min="0" value={draft.stockQuantity} onChange={(e) => updateDraft("stockQuantity", Number(e.target.value))} required /></label>
                <label className={styles.fullField}>English description<textarea value={draft.description.en} onChange={(e) => updateDraft("description.en", e.target.value)} /></label>
                <label className={`${styles.fullField} ${styles.urduField}`}>اردو تفصیل<textarea dir="rtl" value={draft.description.ur} onChange={(e) => updateDraft("description.ur", e.target.value)} /></label>
              </div>

              <div className={styles.imageSection}>
                <div><span>PRODUCT PHOTOS</span><p>Upload up to eight JPG, PNG or WebP images. The first image is the main product photo.</p></div>
                <label className={styles.uploadButton}>{uploading ? <LoaderCircle className={styles.spin} /> : <ImagePlus />} {uploading ? "Uploading…" : "Upload photos"}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadImages} disabled={uploading || draft.images.length >= 8} /></label>
                <div className={styles.imageGrid}>{draft.images.map((image, index) => <figure key={`${image}-${index}`}><img src={image} alt={`Product ${index + 1}`} />{index === 0 && <span>Main</span>}<button type="button" onClick={() => setDraft((current) => ({ ...current, images: current.images.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 /></button></figure>)}{!draft.images.length && <div className={styles.emptyImages}><ImagePlus /><span>No photos uploaded yet</span></div>}</div>
              </div>

              <div className={styles.switches}>
                <label><input type="checkbox" checked={draft.isActive} onChange={(e) => updateDraft("isActive", e.target.checked)} /><span /><p><strong>Visible in store</strong><small>Customers can view and order this product.</small></p></label>
                <label><input type="checkbox" checked={draft.featured} onChange={(e) => updateDraft("featured", e.target.checked)} /><span /><p><strong>Featured product</strong><small>Show this product in the main store position.</small></p></label>
              </div>
            </form>
          </div>
        )}

        {tab === "orders" && (
          <section className={styles.ordersPanel}>
            <div className={styles.panelTitle}><div><span>LATEST 100</span><h2>Customer orders</h2></div><p>Change the status as an order moves from payment to delivery.</p></div>
            {!orders.length ? <div className={styles.emptyState}><ShoppingCart /><h3>No orders yet</h3><p>New website orders will appear here automatically.</p></div> : <div className={styles.orderTable}><div className={styles.orderHead}><span>Order & customer</span><span>Items</span><span>Total</span><span>Payment</span><span>Status</span></div>{orders.map((order) => <article key={order.id}><div><strong>{order.id}</strong><span>{order.customerName} · {order.phone}</span><small>{order.address}, {order.city}</small><small>{new Date(order.createdAt).toLocaleString("en-PK")}</small></div><div><span>{order.itemsSummary}</span><small>{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</small></div><strong>PKR {order.total.toLocaleString("en-PK")}</strong><span className={styles.paymentBadge}>{order.paymentMethod.replaceAll("_", " ")}</span><select value={order.status} onChange={(e) => changeOrderStatus(order.id, e.target.value)}>{ORDER_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></article>)}</div>}
          </section>
        )}

        {tab === "social" && (
          <form className={styles.socialPanel} onSubmit={saveSocial}>
            <div className={styles.panelTitle}><div><span>STORE SETTINGS</span><h2>Connect your social pages</h2></div><button type="submit" className={styles.saveButton} disabled={busy}>{busy ? <LoaderCircle className={styles.spin} /> : <Save />} Save links</button></div>
            <p className={styles.socialIntro}>Paste the complete link for each page whenever it is ready. Leave a field empty to hide that network from the customer storefront.</p>
            <div className={styles.socialFields}>
              <label><span className={styles.facebook}>f</span><p><strong>Facebook</strong><small>Your business Facebook page</small></p><input type="url" placeholder="https://facebook.com/your-page" value={socialLinks.facebook} onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} /></label>
              <label><span className={styles.instagram}>◎</span><p><strong>Instagram</strong><small>Your store Instagram profile</small></p><input type="url" placeholder="https://instagram.com/your-profile" value={socialLinks.instagram} onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} /></label>
              <label><span className={styles.youtube}>▶</span><p><strong>YouTube</strong><small>Your product or brand channel</small></p><input type="url" placeholder="https://youtube.com/@your-channel" value={socialLinks.youtube} onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })} /></label>
              <label><span className={styles.xNetwork}>X</span><p><strong>X / Twitter</strong><small>Your business profile on X</small></p><input type="url" placeholder="https://x.com/your-profile" value={socialLinks.x} onChange={(e) => setSocialLinks({ ...socialLinks, x: e.target.value })} /></label>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
