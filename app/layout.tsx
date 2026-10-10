import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fawad-online-store.fawad5251.chatgpt.site"),
  title: "Fawad Online Store | Simple, Trusted Shopping",
  description:
    "Shop quality products from Fawad Online Store with simple ordering, trusted support and delivery across Pakistan.",
  keywords: ["Fawad Online Store", "Pakistan online store", "Salajit Pakistan", "Shilajit resin"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_PK",
    title: "Fawad Online Store | Simple, Trusted Shopping",
    description: "Quality products, simple ordering and dependable delivery support across Pakistan.",
    siteName: "Fawad Online Store",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071226",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
