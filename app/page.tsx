"use client";

import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Headphones,
  HeartHandshake,
  Leaf,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatPrice, PAKISTAN_DELIVERY_FEE, PRODUCTS, type StoreProduct } from "./lib/catalog";
import type { PaymentMethod } from "./lib/order";
import type { SocialLinks } from "./lib/store-settings-db";

type Lang = "en" | "ur";
type Cart = Record<string, number>;

const WA_NUMBER = "923339789188";
const SUPPORT_PHONE = "+92 333 9789188";
const SUPPORT_EMAIL = "fawadaslam31@gmail.com";
const SITE_URL = "https://fawad-online-store.fawad5251.chatgpt.site";
const text = {
  en: {
    notice: "Pakistan delivery · International delivery",
    shop: "Shop",
    about: "About us",
    benefits: "Salajit benefits",
    faq: "FAQs",
    contact: "Contact",
    cart: "Cart",
    heroTag: "A modern Pakistani online store",
    heroTitle: "Everyday essentials, selected with care.",
    heroBody:
      "Welcome to Fawad Online Store—built for simple ordering, dependable support and a growing collection of quality products.",
    shopNow: "Shop the first product",
    contactUs: "Talk to us",
    trust1: "Clear pricing",
    trust2: "Secure checkout",
    trust3: "Direct support",
    firstDrop: "Our first product",
    moreProducts: "More products",
    moreProductsBody: "Explore the latest products available from Fawad Online Store.",
    productTitle: "Pure Salajit Resin",
    productBody: "Naturally occurring mineral resin, carefully presented in a compact 10 gram jar.",
    size: "Pack size",
    price: "Price",
    delivery: "Pakistan delivery",
    add: "Add to cart",
    added: "Added to cart",
    buy: "Buy now",
    gallery: "See the real product",
    galleryBody: "Real photographs of the product, texture and current jar presentation.",
    aboutTag: "Who we are",
    aboutTitle: "One trusted store. More thoughtful products ahead.",
    aboutBody:
      "We are a customer-focused team based in Pakistan, working to make online shopping simpler, clearer and more dependable. Our team carefully presents each product with honest information, transparent pricing and responsive after-sales support. Salajit is our first product; as Fawad Online Store grows, we will add selected wellness, personal-care, lifestyle and everyday products that meet our standards for quality, usefulness and value.",
    salajitTitle: "About Salajit",
    salajitBody:
      "Salajit (also written Shilajit) is a naturally occurring resin with a long history of traditional use. It is not medicine, and potential wellness effects can vary. Choose purified, responsibly sourced material and seek medical advice if you have a health condition or take medication.",
    benefitsTag: "Tradition, evidence & transparency",
    benefitsTitle: "What research is exploring about Salajit",
    benefitsIntro:
      "Salajit has a long history of traditional use. A small number of human studies have examined specific purified extracts, doses and populations. These findings are preliminary and do not prove that every Salajit product provides the same result.",
    benefit1Title: "Traditional vitality",
    benefit1Body:
      "Traditionally used in Ayurvedic wellness practices as part of routines focused on energy, stamina and general vitality.",
    benefit2Title: "Exercise and strength response",
    benefit2Body:
      "An eight-week randomized study in recreationally active men found less fatigue-related strength decline in one subgroup using 500 mg daily of a specific purified extract.",
    benefit3Title: "Male hormone research",
    benefit3Body:
      "A 90-day randomized study in healthy men aged 45–55 reported increases in testosterone markers with a specific purified extract. This was a small, product-specific study—not a guaranteed effect.",
    benefit4Title: "Bone-health research",
    benefit4Body:
      "A 48-week trial in postmenopausal women with osteopenia reported preservation of bone mineral density with a standardized extract. It does not establish a general benefit for all users or products.",
    evidenceNote:
      "Research links are provided for education. These studies used standardized extracts and cannot be treated as proof for this particular product. Salajit is not a treatment for fatigue, hormonal conditions, osteoporosis or any disease.",
    readStudy: "Read cited study",
    coming: "Coming next",
    comingTitle: "A store designed to grow",
    comingBody: "New product categories are coming soon. The catalog and cart are ready for future additions.",
    soon1: "Wellness essentials",
    soon2: "Personal care",
    soon3: "Everyday lifestyle",
    whyTitle: "Made easy from cart to delivery",
    why1: "Add to cart",
    why1Body: "Choose products and quantities without leaving the page.",
    why2: "Choose payment",
    why2Body: "Cash on Delivery now, with verified digital gateways prepared for activation.",
    why3: "Get support",
    why3Body: "Reach a real person through WhatsApp, phone or email.",
    safetyTitle: "Product care & responsible information",
    safety1: "Use only purified, contaminant-tested Salajit.",
    safety2: "Follow the directions supplied with the product.",
    safety3: "Consult a healthcare professional before use if pregnant, under 18, taking medicines or managing a health condition.",
    safety4: "This product is not intended to diagnose, treat, cure or prevent disease.",
    safetyResearch: "Read heavy-metal safety research",
    faqTag: "Frequently asked questions",
    faqTitle: "Everything to know before ordering",
    faqIntro: "Clear answers about payment, delivery, confirmation and product care.",
    faq1: "Which payment methods are available?",
    faq1Answer: "Cash on Delivery is available for Pakistan orders. Card, JazzCash and Easypaisa are shown in checkout and will activate after their approved merchant gateways are connected. Online orders confirm only after the selected gateway verifies payment.",
    faq2: "How does Cash on Delivery work?",
    faq2Answer: "Choose Cash on Delivery at checkout, enter your complete details and place the order. Your order number is created immediately. Pay the total amount when the parcel arrives.",
    faq3: "Do you deliver internationally?",
    faq3Answer: "Yes. International delivery is arranged directly on WhatsApp because the cost and delivery time depend on the destination country. Message us with your country, city and required quantity for a quotation.",
    faq4: "Will I receive an order confirmation?",
    faq4Answer: "Yes. A confirmation screen shows your order number. When transactional email is available, the customer receives an email confirmation and the store owner receives the complete order, address and contact details.",
    faq5: "What is the Pakistan delivery charge?",
    faq5Answer: "The current Pakistan delivery charge is PKR 300 per order. International delivery is quoted separately on WhatsApp.",
    faq6: "Is Salajit a medicine?",
    faq6Answer: "No. Salajit is sold as a traditional wellness product, not as a medicine. It is not intended to diagnose, treat, cure or prevent disease. Consult a healthcare professional when appropriate.",
    contactTitle: "Questions before you order?",
    contactBody: "We can help with product information, delivery, payment or an existing order.",
    whatsapp: "WhatsApp",
    call: "Call",
    email: "Email",
    footer: "Quality products. Clear service. Simple ordering.",
    cartTitle: "Your cart",
    empty: "Your cart is empty.",
    emptyBody: "Add a product to begin your order.",
    continueShop: "Continue shopping",
    subtotal: "Subtotal",
    deliveryFee: "Delivery",
    total: "Total",
    checkout: "Continue to checkout",
    checkoutTitle: "Checkout",
    checkoutBody: "Enter your Pakistan delivery details and choose a payment method.",
    fullName: "Full name",
    phone: "Phone number",
    customerEmail: "Email for order confirmation",
    city: "City",
    address: "Complete delivery address",
    payment: "Payment method",
    cod: "Cash on Delivery",
    codNote: "Place the order now and pay when it arrives.",
    card: "Debit / Credit Card",
    cardNote: "Secure Safepay checkout; order confirms only after verified payment.",
    jazzcash: "JazzCash",
    jazzcashNote: "Direct merchant checkout—activation in progress.",
    easypaisa: "Easypaisa",
    easypaisaNote: "Direct merchant checkout—activation in progress.",
    paymentRule: "Online orders are placed only after the selected gateway verifies payment.",
    placeCod: "Place Cash on Delivery order",
    payNow: "Continue to secure payment",
    processing: "Processing your order…",
    required: "Please complete your name, phone, valid email, city and delivery address.",
    orderSuccess: "Order placed successfully",
    orderSuccessBody: "Your order number is",
    saveOrder: "Save this number for support.",
    emailSent: "Confirmation has been emailed to you, and the store owner has received the full order details.",
    emailPending: "Your order is safely recorded. Email delivery is pending; please save the order number shown above.",
    merchantPending: "This payment gateway needs merchant activation before it can accept payment.",
    tryAgain: "Please try again or choose Cash on Delivery.",
    close: "Close",
    directOrder: "Prefer WhatsApp? Order directly",
    international: "International delivery is arranged directly through WhatsApp.",
  },
  ur: {
    notice: "پاکستان ڈیلیوری · بین الاقوامی ڈیلیوری",
    shop: "خریداری",
    about: "ہمارے بارے میں",
    benefits: "سلاجیت کے فوائد",
    faq: "سوالات",
    contact: "رابطہ",
    cart: "کارٹ",
    heroTag: "پاکستان کا جدید آن لائن اسٹور",
    heroTitle: "روزمرہ کی معیاری اشیاء، پوری توجہ کے ساتھ۔",
    heroBody: "فواد آن لائن اسٹور میں خوش آمدید—آسان آرڈر، قابلِ اعتماد مدد اور معیاری مصنوعات کا بڑھتا ہوا مجموعہ۔",
    shopNow: "پہلی پروڈکٹ خریدیں",
    contactUs: "ہم سے بات کریں",
    trust1: "واضح قیمت",
    trust2: "محفوظ چیک آؤٹ",
    trust3: "براہِ راست مدد",
    firstDrop: "ہماری پہلی پروڈکٹ",
    moreProducts: "مزید مصنوعات",
    moreProductsBody: "فواد آن لائن اسٹور پر دستیاب تازہ ترین مصنوعات دیکھیں۔",
    productTitle: "خالص سلاجیت ریزن",
    productBody: "قدرتی معدنی ریزن، 10 گرام کے خوبصورت اور آسان جار میں۔",
    size: "پیک سائز",
    price: "قیمت",
    delivery: "پاکستان ڈیلیوری",
    add: "کارٹ میں شامل کریں",
    added: "کارٹ میں شامل ہوگیا",
    buy: "ابھی خریدیں",
    gallery: "اصل پروڈکٹ دیکھیں",
    galleryBody: "پروڈکٹ، اس کی ساخت اور موجودہ جار کی حقیقی تصاویر۔",
    aboutTag: "ہمارا تعارف",
    aboutTitle: "ایک قابلِ اعتماد اسٹور، مزید معیاری مصنوعات جلد آرہی ہیں۔",
    aboutBody: "ہم پاکستان میں قائم ایک کسٹمر فوکسڈ ٹیم ہیں جو آن لائن خریداری کو آسان، واضح اور قابلِ اعتماد بنانے کے لیے کام کرتی ہے۔ ہماری ٹیم ہر پروڈکٹ کو دیانت دار معلومات، واضح قیمت اور فوری بعد از فروخت مدد کے ساتھ پیش کرتی ہے۔ سلاجیت ہماری پہلی پروڈکٹ ہے؛ مستقبل میں صحت، ذاتی نگہداشت، طرزِ زندگی اور روزمرہ استعمال کی منتخب مصنوعات شامل کی جائیں گی۔",
    salajitTitle: "سلاجیت کے بارے میں",
    salajitBody: "سلاجیت ایک قدرتی ریزن ہے جو روایتی طور پر طویل عرصے سے استعمال ہوتی رہی ہے۔ یہ دوا نہیں اور ممکنہ فوائد ہر شخص میں مختلف ہو سکتے ہیں۔ صرف خالص اور ٹیسٹ شدہ سلاجیت استعمال کریں اور بیماری یا دوا کی صورت میں ڈاکٹر سے مشورہ کریں۔",
    benefitsTag: "روایت، تحقیق اور وضاحت",
    benefitsTitle: "سلاجیت کے بارے میں تحقیق کیا بتاتی ہے",
    benefitsIntro: "سلاجیت روایتی طور پر طویل عرصے سے استعمال ہوتی رہی ہے۔ محدود انسانی تحقیقات میں مخصوص خالص ایکسٹریکٹ، مقدار اور افراد کا مطالعہ کیا گیا ہے۔ یہ ابتدائی نتائج ہر پروڈکٹ کے یکساں فائدے کی ضمانت نہیں۔",
    benefit1Title: "روایتی توانائی",
    benefit1Body: "آیورویدک فلاحی طریقوں میں روایتی طور پر توانائی، برداشت اور عمومی چستی کی روٹین کے حصے کے طور پر استعمال۔",
    benefit2Title: "ورزش اور طاقت",
    benefit2Body: "آٹھ ہفتوں کی ایک تحقیق میں مخصوص خالص ایکسٹریکٹ کی 500 ملی گرام روزانہ مقدار استعمال کرنے والے کچھ فعال مردوں میں تھکن کے بعد طاقت کی کمی نسبتاً کم دیکھی گئی۔",
    benefit3Title: "مردانہ ہارمون کی تحقیق",
    benefit3Body: "45 سے 55 سال کے صحت مند مردوں کی 90 روزہ محدود تحقیق میں مخصوص خالص ایکسٹریکٹ کے ساتھ ٹیسٹوسٹیرون مارکر بڑھے۔ یہ چھوٹی اور مخصوص پروڈکٹ کی تحقیق ہے، ضمانت نہیں۔",
    benefit4Title: "ہڈیوں کی صحت کی تحقیق",
    benefit4Body: "ہڈیوں کی کمزوری والی مینوپاز کے بعد خواتین کی 48 ہفتوں کی تحقیق میں ایک معیاری ایکسٹریکٹ کے ساتھ ہڈیوں کی کثافت کے تحفظ کی اطلاع ملی۔ یہ ہر شخص یا پروڈکٹ کے لیے عمومی فائدہ ثابت نہیں کرتی۔",
    evidenceNote: "تحقیقی لنکس صرف معلومات کے لیے ہیں۔ ان مطالعات میں معیاری ایکسٹریکٹ استعمال ہوئے؛ یہ ہماری مخصوص پروڈکٹ کا ثبوت نہیں۔ سلاجیت تھکن، ہارمون، آسٹیوپوروسس یا کسی بیماری کا علاج نہیں۔",
    readStudy: "تحقیق پڑھیں",
    coming: "جلد آرہا ہے",
    comingTitle: "بڑھنے کے لیے تیار اسٹور",
    comingBody: "نئی پروڈکٹ کیٹیگریز جلد شامل ہوں گی۔ مستقبل کی مصنوعات کے لیے کیٹلاگ اور کارٹ تیار ہیں۔",
    soon1: "صحت کی ضروریات",
    soon2: "ذاتی نگہداشت",
    soon3: "روزمرہ طرزِ زندگی",
    whyTitle: "کارٹ سے ڈیلیوری تک آسان طریقہ",
    why1: "کارٹ میں شامل کریں",
    why1Body: "صفحہ چھوڑے بغیر پروڈکٹ اور تعداد منتخب کریں۔",
    why2: "ادائیگی منتخب کریں",
    why2Body: "کیش آن ڈیلیوری موجود ہے، تصدیق شدہ ڈیجیٹل گیٹ ویز ایکٹیویشن کے لیے تیار ہیں۔",
    why3: "مدد حاصل کریں",
    why3Body: "واٹس ایپ، فون یا ای میل پر براہِ راست رابطہ کریں۔",
    safetyTitle: "پروڈکٹ کی احتیاط اور ذمہ دار معلومات",
    safety1: "صرف خالص اور آلودگی سے ٹیسٹ شدہ سلاجیت استعمال کریں۔",
    safety2: "پروڈکٹ کے ساتھ فراہم کردہ ہدایات پر عمل کریں۔",
    safety3: "حمل، 18 سال سے کم عمر، دوا یا بیماری کی صورت میں پہلے ڈاکٹر سے مشورہ کریں۔",
    safety4: "یہ پروڈکٹ کسی بیماری کی تشخیص، علاج یا روک تھام کے لیے نہیں۔",
    safetyResearch: "ہیوی میٹل سیفٹی تحقیق پڑھیں",
    faqTag: "اکثر پوچھے جانے والے سوالات",
    faqTitle: "آرڈر سے پہلے ضروری معلومات",
    faqIntro: "ادائیگی، ڈیلیوری، تصدیق اور پروڈکٹ کے متعلق واضح جوابات۔",
    faq1: "کون سے ادائیگی کے طریقے موجود ہیں؟",
    faq1Answer: "پاکستان میں کیش آن ڈیلیوری موجود ہے۔ کارڈ، جاز کیش اور ایزی پیسہ چیک آؤٹ میں دکھائے گئے ہیں اور منظور شدہ مرچنٹ گیٹ وے منسلک ہونے کے بعد فعال ہوں گے۔ آن لائن آرڈر ادائیگی کی تصدیق کے بعد مکمل ہوگا۔",
    faq2: "کیش آن ڈیلیوری کیسے کام کرتی ہے؟",
    faq2Answer: "چیک آؤٹ پر کیش آن ڈیلیوری منتخب کریں، مکمل تفصیل درج کریں اور آرڈر کریں۔ آرڈر نمبر فوراً بن جائے گا۔ پارسل ملنے پر مکمل رقم ادا کریں۔",
    faq3: "کیا بین الاقوامی ڈیلیوری موجود ہے؟",
    faq3Answer: "جی ہاں۔ بین الاقوامی ڈیلیوری واٹس ایپ پر طے کی جاتی ہے کیونکہ قیمت اور وقت منزل کے ملک پر منحصر ہیں۔ ملک، شہر اور مطلوبہ تعداد بتا کر قیمت معلوم کریں۔",
    faq4: "کیا آرڈر کی تصدیق ملے گی؟",
    faq4Answer: "جی ہاں۔ تصدیقی اسکرین پر آرڈر نمبر دکھایا جاتا ہے۔ ٹرانزیکشنل ای میل دستیاب ہونے پر کسٹمر کو تصدیقی ای میل اور اسٹور مالک کو مکمل آرڈر، پتہ اور رابطہ تفصیل بھیجی جاتی ہے۔",
    faq5: "پاکستان ڈیلیوری چارج کتنا ہے؟",
    faq5Answer: "موجودہ پاکستان ڈیلیوری چارج فی آرڈر 300 روپے ہے۔ بین الاقوامی ڈیلیوری کی قیمت واٹس ایپ پر الگ بتائی جاتی ہے۔",
    faq6: "کیا سلاجیت دوا ہے؟",
    faq6Answer: "نہیں۔ سلاجیت ایک روایتی فلاحی پروڈکٹ ہے، دوا نہیں۔ یہ کسی بیماری کی تشخیص، علاج یا روک تھام کے لیے نہیں۔ ضرورت کے مطابق ڈاکٹر سے مشورہ کریں۔",
    contactTitle: "آرڈر سے پہلے کوئی سوال؟",
    contactBody: "پروڈکٹ، ڈیلیوری، ادائیگی یا موجودہ آرڈر کے متعلق ہم مدد کر سکتے ہیں۔",
    whatsapp: "واٹس ایپ",
    call: "کال",
    email: "ای میل",
    footer: "معیاری مصنوعات۔ واضح سروس۔ آسان آرڈر۔",
    cartTitle: "آپ کا کارٹ",
    empty: "آپ کا کارٹ خالی ہے۔",
    emptyBody: "آرڈر شروع کرنے کے لیے پروڈکٹ شامل کریں۔",
    continueShop: "خریداری جاری رکھیں",
    subtotal: "پروڈکٹ کل",
    deliveryFee: "ڈیلیوری",
    total: "مکمل رقم",
    checkout: "چیک آؤٹ جاری رکھیں",
    checkoutTitle: "چیک آؤٹ",
    checkoutBody: "پاکستان ڈیلیوری کی تفصیل درج کریں اور ادائیگی منتخب کریں۔",
    fullName: "پورا نام",
    phone: "فون نمبر",
    customerEmail: "آرڈر کی تصدیق کے لیے ای میل",
    city: "شہر",
    address: "مکمل ڈیلیوری ایڈریس",
    payment: "ادائیگی کا طریقہ",
    cod: "کیش آن ڈیلیوری",
    codNote: "ابھی آرڈر کریں اور وصولی پر ادائیگی کریں۔",
    card: "ڈیبٹ / کریڈٹ کارڈ",
    cardNote: "سیف پے چیک آؤٹ؛ ادائیگی کی تصدیق کے بعد ہی آرڈر مکمل ہوگا۔",
    jazzcash: "جاز کیش",
    jazzcashNote: "براہِ راست مرچنٹ چیک آؤٹ—ایکٹیویشن جاری ہے۔",
    easypaisa: "ایزی پیسہ",
    easypaisaNote: "براہِ راست مرچنٹ چیک آؤٹ—ایکٹیویشن جاری ہے۔",
    paymentRule: "آن لائن آرڈر صرف گیٹ وے کی طرف سے ادائیگی کی تصدیق کے بعد مکمل ہوگا۔",
    placeCod: "کیش آن ڈیلیوری آرڈر کریں",
    payNow: "محفوظ ادائیگی جاری رکھیں",
    processing: "آپ کا آرڈر تیار ہو رہا ہے…",
    required: "براہِ کرم نام، فون، درست ای میل، شہر اور مکمل ایڈریس درج کریں۔",
    orderSuccess: "آرڈر کامیابی سے ہوگیا",
    orderSuccessBody: "آپ کا آرڈر نمبر ہے",
    saveOrder: "مدد کے لیے یہ نمبر محفوظ رکھیں۔",
    emailSent: "تصدیقی ای میل آپ کو بھیج دی گئی ہے اور اسٹور مالک کو مکمل آرڈر تفصیل موصول ہو گئی ہے۔",
    emailPending: "آپ کا آرڈر محفوظ ہو گیا ہے۔ ای میل کی ترسیل زیرِ التوا ہے، براہِ کرم اوپر دکھایا گیا آرڈر نمبر محفوظ رکھیں۔",
    merchantPending: "ادائیگی قبول کرنے سے پہلے اس گیٹ وے کا مرچنٹ اکاؤنٹ فعال کرنا ضروری ہے۔",
    tryAgain: "دوبارہ کوشش کریں یا کیش آن ڈیلیوری منتخب کریں۔",
    close: "بند کریں",
    directOrder: "واٹس ایپ پر براہِ راست آرڈر کریں",
    international: "بین الاقوامی ڈیلیوری واٹس ایپ کے ذریعے طے کی جاتی ہے۔",
  },
};

const paymentOptions: { id: PaymentMethod; icon: typeof Banknote; brand?: string }[] = [
  { id: "cod", icon: Banknote },
  { id: "card", icon: CreditCard },
  { id: "jazzcash", icon: WalletCards, brand: "jazz" },
  { id: "easypaisa", icon: WalletCards, brand: "easy" },
];

export default function Storefront() {
  const [lang, setLang] = useState<Lang>("en");
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState("");
  const [confirmationEmailed, setConfirmationEmailed] = useState(false);
  const [products, setProducts] = useState<StoreProduct[]>(PRODUCTS);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ facebook: "", instagram: "", youtube: "", x: "" });
  const c = text[lang];
  const isUrdu = lang === "ur";
  const product = products.find((item) => item.featured) ?? products[0] ?? PRODUCTS[0];

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("fos-cart");
      if (saved) setCart(JSON.parse(saved) as Cart);
    } catch { /* Ignore unavailable or invalid local storage. */ }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { ok?: boolean; products?: StoreProduct[]; socialLinks?: SocialLinks }) => {
        if (!active || !result.ok || !result.products?.length) return;
        setProducts(result.products);
        if (result.socialLinks) setSocialLinks(result.socialLinks);
      })
      .catch(() => { /* The built-in catalog remains available if the network is interrupted. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const validIds = new Set(products.map((item) => item.id));
    setCart((current) => Object.fromEntries(Object.entries(current).filter(([id]) => validIds.has(id))));
  }, [products]);

  useEffect(() => {
    try { window.localStorage.setItem("fos-cart", JSON.stringify(cart)); }
    catch { /* Cart remains available for this visit. */ }
  }, [cart]);

  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = useMemo(
    () => products.reduce((sum, item) => sum + item.unitPrice * (cart[item.id] ?? 0), 0),
    [cart, products]
  );
  const total = subtotal + (itemCount ? PAKISTAN_DELIVERY_FEE : 0);

  function updateQuantity(productId: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[productId];
      else next[productId] = Math.min(quantity, 20);
      return next;
    });
  }

  function addToCart(productId: string, open = false) {
    updateQuantity(productId, (cart[productId] ?? 0) + 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    if (open) setCartOpen(true);
  }

  function beginCheckout() {
    if (!itemCount) return;
    setCartOpen(false);
    setCheckoutOpen(true);
    setError("");
    setSuccessId("");
    setConfirmationEmailed(false);
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      customer: String(form.get("customer") ?? ""),
      phone: String(form.get("phone") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? ""),
      city: String(form.get("city") ?? ""),
      address: String(form.get("address") ?? ""),
      paymentMethod,
      items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
    };
    if (
      !payload.customer.trim() ||
      !payload.phone.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customerEmail) ||
      !payload.city.trim() ||
      !payload.address.trim()
    ) {
      setError(c.required);
      return;
    }

    setBusy(true);
    try {
      const endpoint = paymentMethod === "cod" ? "/api/orders/cod" : "/api/payment/start";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        orderId?: string;
        checkoutUrl?: string;
        code?: string;
        error?: string;
        emailDelivery?: { owner?: string; customer?: string };
      };
      if (!response.ok || !result.ok) {
        if (result.code === "MERCHANT_GATEWAY_REQUIRED" || result.code === "SAFEPAY_NOT_CONFIGURED") {
          setError(`${c.merchantPending} ${c.tryAgain}`);
        } else {
          setError(result.error || c.tryAgain);
        }
        return;
      }
      if (paymentMethod === "cod" && result.orderId) {
        setSuccessId(result.orderId);
        setConfirmationEmailed(
          result.emailDelivery?.owner === "sent" && result.emailDelivery?.customer === "sent"
        );
        setCart({});
      } else if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
      }
    } catch {
      setError(c.tryAgain);
    } finally {
      setBusy(false);
    }
  }

  const waText = encodeURIComponent("Hello Fawad Online Store, I would like help with an order.");
  const directWaText = encodeURIComponent(
    `Hello Fawad Online Store, I would like to order:\n${products.filter((item) => cart[item.id])
      .map((item) => `${item.name.en} (${item.size}) x ${cart[item.id]}`)
      .join("\n")}\nTotal within Pakistan: ${formatPrice(total)}\nPlease confirm my delivery details.`
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": `${SITE_URL}/#store`,
        name: "Fawad Online Store",
        url: SITE_URL,
        email: SUPPORT_EMAIL,
        telephone: SUPPORT_PHONE,
        areaServed: ["Pakistan", "International"],
      },
      {
        "@type": "Product",
        name: product.name.en,
        description: product.description.en,
        image: product.images.map((image) => image.startsWith("https://") ? image : `${SITE_URL}${image}`),
        brand: { "@type": "Brand", name: "Fawad Online Store" },
        offers: {
          "@type": "Offer",
          priceCurrency: "PKR",
          price: product.unitPrice,
          availability: product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/#shop`,
        },
      },
    ],
  };

  return (
    <main dir={isUrdu ? "rtl" : "ltr"} className={isUrdu ? "urdu" : ""}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
      <div className="announcement">
        <Zap size={15} /> <span>{c.notice}</span>
        <span className="announcement-divider">·</span>
        <a href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noreferrer">
          <MessageCircle size={15} /> {SUPPORT_PHONE}
        </a>
      </div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Fawad Online Store home">
          <span className="brand-mark">F</span>
          <span><strong>FAWAD</strong><small>ONLINE STORE</small></span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#shop" onClick={() => setMenuOpen(false)}>{c.shop}</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>{c.about}</a>
          <a href="#benefits" onClick={() => setMenuOpen(false)}>{c.benefits}</a>
          <a href="#faqs" onClick={() => setMenuOpen(false)}>{c.faq}</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>{c.contact}</a>
        </nav>
        <div className="header-actions">
          <button className="lang-toggle" onClick={() => setLang(isUrdu ? "en" : "ur")}>
            {isUrdu ? "EN" : "اردو"}
          </button>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={c.cart}>
            <ShoppingBag size={20} /><span className="cart-label">{c.cart}</span>
            {itemCount > 0 && <b>{itemCount}</b>}
          </button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} /> {c.heroTag}</span>
          <h1>{c.heroTitle}</h1>
          <p>{c.heroBody}</p>
          <div className="hero-actions">
            <a className="button primary" href="#shop">{c.shopNow} <ArrowRight size={18} /></a>
            <a className="button secondary" href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noreferrer">
              <MessageCircle size={18} /> {c.contactUs}
            </a>
          </div>
          <div className="trust-row">
            <span><Check /> {c.trust1}</span><span><ShieldCheck /> {c.trust2}</span><span><Headphones /> {c.trust3}</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-product-card">
            <span className="stock-pill"><span /> {product.stockQuantity > 0 ? "IN STOCK" : "OUT OF STOCK"}</span>
            <img src={product.images[0] || "/logo.png"} alt={product.name[lang]} />
            <div><span>{c.firstDrop}</span><strong>{product.size}</strong></div>
          </div>
          <div className="floating-card delivery-card"><Truck /><span>{c.delivery}<strong>{formatPrice(PAKISTAN_DELIVERY_FEE)}</strong></span></div>
          <div className="floating-card verified-card"><BadgeCheck /><span>Genuine photos<strong>Real product</strong></span></div>
        </div>
      </section>

      <section className="product-section" id="shop">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">01 · {c.firstDrop}</span><h2>{product.name[lang]}</h2></div>
          <p>{product.description[lang] || c.productBody}</p>
        </div>
        <div className="product-layout">
          <div className="product-gallery">
            <div className="main-product-image"><img src={product.images[0] || "/logo.png"} alt={product.name[lang]} /><span>{c.firstDrop}</span></div>
            <div className="mini-images">
              {product.images.slice(1).map((image, index) => <img key={image} src={image} alt={`${product.name[lang]} ${index + 2}`} />)}
            </div>
          </div>
          <article className="product-panel">
            <div className="product-topline"><span>{product.category[lang]}</span><span className="rating">★★★★★ <small>5.0</small></span></div>
            <h3>{product.name[lang]}</h3>
            <p>{product.description[lang]}</p>
            <div className="spec-grid">
              <div><small>{c.size}</small><strong>{product.size}</strong></div>
              <div><small>{c.price}</small><strong>{formatPrice(product.unitPrice)}</strong></div>
              <div><small>{c.delivery}</small><strong>{formatPrice(PAKISTAN_DELIVERY_FEE)}</strong></div>
            </div>
            <div className="product-cta">
              <button className="button primary wide" disabled={product.stockQuantity < 1} onClick={() => addToCart(product.id, false)}>{added ? <Check /> : <Plus />} {added ? c.added : c.add}</button>
              <button className="button dark wide" disabled={product.stockQuantity < 1} onClick={() => addToCart(product.id, true)}>{c.buy} <ChevronRight /></button>
            </div>
            <div className="micro-trust"><span><PackageCheck /> Secure packing</span><span><Truck /> Nationwide delivery</span></div>
          </article>
        </div>
        {products.length > 1 && <div className="catalog-block">
          <div className="catalog-heading"><span className="eyebrow">{c.moreProducts}</span><h2>{c.moreProducts}</h2><p>{c.moreProductsBody}</p></div>
          <div className="catalog-grid">{products.filter((item) => item.id !== product.id).map((item) => <article className="catalog-card" key={item.id}>
            <div><img src={item.images[0] || "/logo.png"} alt={item.name[lang]} /><span>{item.stockQuantity > 0 ? "IN STOCK" : "OUT OF STOCK"}</span></div>
            <small>{item.category[lang]}</small><h3>{item.name[lang]}</h3><p>{item.description[lang]}</p>
            <div className="catalog-card-footer"><strong>{formatPrice(item.unitPrice)}</strong><button disabled={item.stockQuantity < 1} onClick={() => addToCart(item.id, false)}><Plus /> {c.add}</button></div>
          </article>)}</div>
        </div>}
      </section>

      <section className="gallery-strip">
        <div className="gallery-intro"><span className="eyebrow">{c.gallery}</span><h2>{c.gallery}</h2><p>{c.galleryBody}</p></div>
        {product.images.slice(0, 3).map((image, index) => <div className="gallery-tile" key={image}><img src={image} alt={`${product.name[lang]} ${index + 1}`} /><span>0{index + 1}</span></div>)}
      </section>

      <section className="about-section" id="about">
        <div className="about-copy"><span className="eyebrow">02 · {c.aboutTag}</span><h2>{c.aboutTitle}</h2><p>{c.aboutBody}</p></div>
        <div className="about-card"><div className="mini-brand"><span>F</span><strong>FAWAD<br /><small>ONLINE STORE</small></strong></div><p>{c.salajitBody}</p><strong>{c.salajitTitle}</strong></div>
      </section>

      <section className="process-section">
        <div className="section-heading centered"><span className="eyebrow">SHOP WITH CONFIDENCE</span><h2>{c.whyTitle}</h2></div>
        <div className="process-grid">
          {[
            ["01", ShoppingBag, c.why1, c.why1Body],
            ["02", WalletCards, c.why2, c.why2Body],
            ["03", HeartHandshake, c.why3, c.why3Body],
          ].map(([number, Icon, title, body]) => (
            <article className="process-card" key={String(number)}><span>{String(number)}</span><Icon /><h3>{String(title)}</h3><p>{String(body)}</p></article>
          ))}
        </div>
      </section>

      <section className="benefits-section" id="benefits">
        <div className="section-heading benefits-heading">
          <div><span className="eyebrow">03 · {c.benefitsTag}</span><h2>{c.benefitsTitle}</h2></div>
          <p>{c.benefitsIntro}</p>
        </div>
        <div className="benefits-grid">
          {[
            ["01", Leaf, c.benefit1Title, c.benefit1Body, ""],
            ["02", Zap, c.benefit2Title, c.benefit2Body, "https://pubmed.ncbi.nlm.nih.gov/30728074/"],
            ["03", BadgeCheck, c.benefit3Title, c.benefit3Body, "https://pubmed.ncbi.nlm.nih.gov/26395129/"],
            ["04", HeartHandshake, c.benefit4Title, c.benefit4Body, "https://pubmed.ncbi.nlm.nih.gov/35933897/"],
          ].map(([number, Icon, title, body, link]) => (
            <article className="benefit-card" key={String(number)}>
              <div><span>{String(number)}</span><Icon /></div>
              <h3>{String(title)}</h3>
              <p>{String(body)}</p>
              {link && <a href={String(link)} target="_blank" rel="noreferrer">{c.readStudy} <ArrowRight /></a>}
            </article>
          ))}
        </div>
        <div className="evidence-note"><ShieldCheck /><p>{c.evidenceNote}</p></div>
      </section>

      <section className="coming-section">
        <div><span className="eyebrow">04 · {c.coming}</span><h2>{c.comingTitle}</h2><p>{c.comingBody}</p></div>
        <div className="coming-grid">
          {[c.soon1, c.soon2, c.soon3].map((name, index) => <div key={name}><span>0{index + 2}</span><div className="coming-icon">{index === 0 ? <Leaf /> : index === 1 ? <Sparkles /> : <ShoppingBag />}</div><strong>{name}</strong><small>COMING SOON</small></div>)}
        </div>
      </section>

      <section className="care-section" id="care">
        <div className="care-title"><span className="eyebrow"><ShieldCheck /> RESPONSIBLE SHOPPING</span><h2>{c.safetyTitle}</h2></div>
        <div className="care-list">{[c.safety1, c.safety2, c.safety3, c.safety4].map((item) => <p key={item}><Check /> {item}</p>)}
          <a className="safety-research" href="https://pubmed.ncbi.nlm.nih.gov/38393486/" target="_blank" rel="noreferrer">{c.safetyResearch} <ArrowRight /></a>
        </div>
      </section>

      <section className="faq-section" id="faqs">
        <div className="section-heading centered"><span className="eyebrow">05 · {c.faqTag}</span><h2>{c.faqTitle}</h2><p>{c.faqIntro}</p></div>
        <div className="faq-list">
          {[
            [c.faq1, c.faq1Answer], [c.faq2, c.faq2Answer], [c.faq3, c.faq3Answer],
            [c.faq4, c.faq4Answer], [c.faq5, c.faq5Answer], [c.faq6, c.faq6Answer],
          ].map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>0{index + 1}</span>{question}<Plus /></summary><p>{answer}</p></details>)}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div><span className="eyebrow">WE ARE HERE TO HELP</span><h2>{c.contactTitle}</h2><p>{c.contactBody}</p><small>{c.international}</small></div>
        <div className="contact-actions">
          <a href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noreferrer"><MessageCircle /><span>{c.whatsapp}<strong>{SUPPORT_PHONE}</strong></span><ArrowRight /></a>
          <a href={`tel:${SUPPORT_PHONE.replaceAll(" ", "")}`}><Phone /><span>{c.call}<strong>{SUPPORT_PHONE}</strong></span><ArrowRight /></a>
          <a href={`mailto:${SUPPORT_EMAIL}`}><Mail /><span>{c.email}<strong>{SUPPORT_EMAIL}</strong></span><ArrowRight /></a>
        </div>
      </section>

      <footer><div className="brand light"><span className="brand-mark">F</span><span><strong>FAWAD</strong><small>ONLINE STORE</small></span></div><div className="footer-center"><p>{c.footer}</p>{Object.values(socialLinks).some(Boolean) && <div className="social-links">{socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">f</a>}{socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>}{socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>}{socialLinks.x && <a href={socialLinks.x} target="_blank" rel="noreferrer" aria-label="X">X</a>}</div>}</div><span>© {new Date().getFullYear()} Fawad Online Store</span></footer>

      {cartOpen && <div className="overlay" onMouseDown={() => setCartOpen(false)}>
        <aside className="cart-drawer" onMouseDown={(event) => event.stopPropagation()}>
          <div className="drawer-head"><div><span>SHOPPING BAG</span><h2>{c.cartTitle}</h2></div><button onClick={() => setCartOpen(false)}><X /></button></div>
          {!itemCount ? <div className="empty-cart"><span><ShoppingBag /></span><h3>{c.empty}</h3><p>{c.emptyBody}</p><button className="button primary" onClick={() => setCartOpen(false)}>{c.continueShop}</button></div> : <>
            <div className="cart-items">{products.filter((item) => cart[item.id]).map((item) => <div className="cart-item" key={item.id}>
              <img src={item.images[0]} alt={item.name[lang]} /><div><h3>{item.name[lang]}</h3><small>{item.size} · {formatPrice(item.unitPrice)}</small><div className="qty-row"><button onClick={() => updateQuantity(item.id, cart[item.id] - 1)}><Minus /></button><span>{cart[item.id]}</span><button onClick={() => updateQuantity(item.id, cart[item.id] + 1)}><Plus /></button></div></div><button className="trash" onClick={() => updateQuantity(item.id, 0)}><Trash2 /></button>
            </div>)}</div>
            <div className="cart-summary"><p><span>{c.subtotal}</span><strong>{formatPrice(subtotal)}</strong></p><p><span>{c.deliveryFee}</span><strong>{formatPrice(PAKISTAN_DELIVERY_FEE)}</strong></p><p className="grand-total"><span>{c.total}</span><strong>{formatPrice(total)}</strong></p><button className="button primary wide" onClick={beginCheckout}>{c.checkout} <ArrowRight /></button><button className="link-button" onClick={() => setCartOpen(false)}>{c.continueShop}</button></div>
          </>}
        </aside>
      </div>}

      {checkoutOpen && <div className="overlay checkout-overlay" onMouseDown={() => !busy && setCheckoutOpen(false)}>
        <section className="checkout-modal" onMouseDown={(event) => event.stopPropagation()}>
          <div className="drawer-head"><div><span>SECURE CHECKOUT</span><h2>{successId ? c.orderSuccess : c.checkoutTitle}</h2></div><button disabled={busy} onClick={() => setCheckoutOpen(false)}><X /></button></div>
          {successId ? <div className="success-state"><span><Check /></span><h3>{c.orderSuccess}</h3><p>{c.orderSuccessBody}</p><strong>{successId}</strong><small>{c.saveOrder}</small><p className={confirmationEmailed ? "email-confirmation sent" : "email-confirmation pending"}><Mail /> {confirmationEmailed ? c.emailSent : c.emailPending}</p><button className="button primary" onClick={() => setCheckoutOpen(false)}>{c.close}</button></div> :
          <form onSubmit={submitOrder} className="checkout-form">
            <p className="checkout-intro">{c.checkoutBody}</p>
            <div className="field-grid"><label>{c.fullName}<input name="customer" autoComplete="name" required /></label><label>{c.phone}<input name="phone" type="tel" autoComplete="tel" required /></label><label>{c.customerEmail}<input name="customerEmail" type="email" autoComplete="email" required /></label><label>{c.city}<input name="city" autoComplete="address-level2" required /></label><label className="full-field">{c.address}<textarea name="address" autoComplete="street-address" required /></label></div>
            <fieldset className="payment-options"><legend>{c.payment}</legend>{paymentOptions.map(({ id, icon: Icon, brand }) => <label className={`payment-option ${paymentMethod === id ? "selected" : ""}`} key={id}><input type="radio" name="paymentMethod" value={id} checked={paymentMethod === id} onChange={() => { setPaymentMethod(id); setError(""); }} /><span className={`payment-icon ${brand ?? ""}`}><Icon /></span><span><strong>{c[id]}</strong><small>{c[`${id}Note` as keyof typeof c]}</small></span><i>{paymentMethod === id && <Check />}</i></label>)}</fieldset>
            {paymentMethod !== "cod" && <p className="payment-rule"><ShieldCheck /> {c.paymentRule}</p>}
            {error && <p className="form-error">{error}</p>}
            <div className="checkout-total"><span>{c.total}</span><strong>{formatPrice(total)}</strong></div>
            <button className="button primary wide checkout-submit" disabled={busy}>{busy ? c.processing : paymentMethod === "cod" ? c.placeCod : c.payNow} {!busy && <ArrowRight />}</button>
            <a className="direct-order" href={`https://wa.me/${WA_NUMBER}?text=${directWaText}`} target="_blank" rel="noreferrer"><MessageCircle /> {c.directOrder}</a>
          </form>}
        </section>
      </div>}
    </main>
  );
}
