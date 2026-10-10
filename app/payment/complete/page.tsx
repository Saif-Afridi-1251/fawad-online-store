"use client";

import { Check, Clock3, Home, MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type PaymentState = "checking" | "paid" | "pending" | "error";

const WHATSAPP_URL =
  "https://wa.me/923339789188?text=" +
  encodeURIComponent("Assalam-o-Alaikum, I need help with my Fawad Online Store payment.");

export default function PaymentCompletePage() {
  const [state, setState] = useState<PaymentState>("checking");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const tracker = new URLSearchParams(window.location.search).get("tracker");
    if (!tracker) {
      setState("error");
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          const response = await fetch(`/api/payment/status?tracker=${encodeURIComponent(tracker ?? "")}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          });
          const result = (await response.json()) as { ok?: boolean; paid?: boolean; orderId?: string };

          if (cancelled) return;
          if (response.ok && result.paid) {
            setOrderId(result.orderId ?? "");
            setState("paid");
            return;
          }
        } catch {
          // A short retry handles the gap between checkout redirect and final payment reporting.
        }

        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }

      if (!cancelled) setState("pending");
    }

    void verifyPayment();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="payment-status-page">
      <section className="payment-status-card">
        <div className="status-brand"><span>F</span><strong>FAWAD <small>ONLINE STORE</small></strong></div>
        {state === "checking" && (
          <>
            <span className="status-icon checking"><Clock3 /></span>
            <p className="section-eyebrow">SECURE PAYMENT</p>
            <h1>Verifying your payment</h1>
            <p>Please keep this page open for a few seconds.</p>
            <p className="status-urdu" dir="rtl">آپ کی ادائیگی کی تصدیق ہو رہی ہے۔ براہِ کرم چند سیکنڈ انتظار کریں۔</p>
          </>
        )}

        {state === "paid" && (
          <>
            <span className="status-icon paid"><Check /></span>
            <p className="section-eyebrow">PAYMENT CONFIRMED</p>
            <h1>Your order is placed</h1>
            <p>Your payment was verified and your paid order is confirmed with Fawad Online Store.</p>
            {orderId && <strong className="order-reference">Order {orderId}</strong>}
            <p className="status-urdu" dir="rtl">ادائیگی کی تصدیق ہو گئی ہے اور آپ کا آرڈر کامیابی سے درج ہو گیا ہے۔</p>
          </>
        )}

        {state === "pending" && (
          <>
            <span className="status-icon checking"><ShieldCheck /></span>
            <p className="section-eyebrow">PAYMENT PROCESSING</p>
            <h1>Confirmation is taking longer</h1>
            <p>Do not pay again. We are waiting for Safepay’s final confirmation.</p>
            <p className="status-urdu" dir="rtl">دوبارہ ادائیگی نہ کریں۔ ہم سیف پے کی حتمی تصدیق کا انتظار کر رہے ہیں۔</p>
          </>
        )}

        {state === "error" && (
          <>
            <span className="status-icon error"><ShieldCheck /></span>
            <p className="section-eyebrow">PAYMENT REFERENCE MISSING</p>
            <h1>We could not verify this page</h1>
            <p>Please return to the store or contact us if money was deducted.</p>
            <p className="status-urdu" dir="rtl">اگر رقم کٹ گئی ہے تو براہِ کرم ہم سے رابطہ کریں۔</p>
          </>
        )}

        <div className="status-actions">
          <a href="/"><Home />Back to store</a>
          <a className="secondary" href={WHATSAPP_URL} target="_blank" rel="noreferrer"><MessageCircle />Payment help</a>
        </div>
      </section>
    </main>
  );
}
