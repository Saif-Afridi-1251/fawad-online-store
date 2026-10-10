import { listStoreProducts } from "../../lib/products-db";
import { getSocialLinks } from "../../lib/store-settings-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [products, socialLinks] = await Promise.all([listStoreProducts(false), getSocialLinks()]);
    return Response.json({ ok: true, products, socialLinks }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Store catalog could not be loaded", error);
    return Response.json({ ok: false, error: "Catalog is temporarily unavailable." }, { status: 500 });
  }
}
