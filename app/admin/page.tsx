import type { Metadata } from "next";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { isAdminUser } from "../lib/admin-auth";
import { listRecentOrders } from "../lib/orders-db";
import { listStoreProducts } from "../lib/products-db";
import { getSocialLinks } from "../lib/store-settings-db";
import AdminDashboard from "./admin-dashboard";
import styles from "./admin-dashboard.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store Admin | Fawad Online Store",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!isAdminUser(user.id, user.email)) {
    return (
      <main className={styles.accessPage}>
        <section>
          <span>OWNER ACCESS</span>
          <h1>This dashboard is private.</h1>
          <p>The signed-in account is not authorized to manage Fawad Online Store.</p>
          <a href={chatGPTSignOutPath("/admin")} target="_top">Sign out</a>
        </section>
      </main>
    );
  }

  const [products, socialLinks, orders] = await Promise.all([
    listStoreProducts(true),
    getSocialLinks(),
    listRecentOrders(),
  ]);

  return (
    <AdminDashboard
      initialProducts={products}
      initialSocialLinks={socialLinks}
      initialOrders={orders}
      ownerName={user.displayName}
      signOutUrl={chatGPTSignOutPath("/")}
    />
  );
}
