export type StoreProduct = {
  id: string;
  slug: string;
  name: { en: string; ur: string };
  shortName: { en: string; ur: string };
  description: { en: string; ur: string };
  category: { en: string; ur: string };
  size: string;
  unitPrice: number;
  images: string[];
  featured: boolean;
  stockQuantity: number;
  isActive: boolean;
  sortOrder: number;
};

export const PRODUCTS: StoreProduct[] = [
  {
    id: "salajit-10g",
    slug: "pure-salajit-resin-10g",
    name: { en: "Pure Salajit Resin", ur: "خالص سلاجیت ریزن" },
    shortName: { en: "Salajit 10g", ur: "سلاجیت 10 گرام" },
    description: {
      en: "Naturally occurring mineral resin in a compact, reusable 10 gram jar.",
      ur: "قدرتی معدنی ریزن، 10 گرام کے آسان اور دوبارہ استعمال ہونے والے جار میں۔",
    },
    category: { en: "Natural wellness", ur: "قدرتی صحت" },
    size: "10g",
    unitPrice: 1500,
    images: ["/product-resin.jpg", "/product-jars.jpg", "/product-stock.jpg"],
    featured: true,
    stockQuantity: 100,
    isActive: true,
    sortOrder: 0,
  },
];

export const STORE_NAME = "Fawad Online Store";
export const CURRENCY = "PKR";
export const PAKISTAN_DELIVERY_FEE = 300;
export const MAX_ITEM_QUANTITY = 20;

export function findProduct(productId: string) {
  return PRODUCTS.find((product) => product.id === productId);
}

export function formatPrice(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}
