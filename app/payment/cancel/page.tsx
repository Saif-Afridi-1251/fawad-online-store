import { ArrowLeft, MessageCircle, ShieldAlert } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/923339789188?text=" +
  encodeURIComponent("Assalam-o-Alaikum, I need help completing my Fawad Online Store order.");

export default function PaymentCancelledPage() {
  return (
    <main className="payment-status-page">
      <section className="payment-status-card">
        <div className="status-brand"><span>F</span><strong>FAWAD <small>ONLINE STORE</small></strong></div>
        <span className="status-icon error"><ShieldAlert /></span>
        <p className="section-eyebrow">PAYMENT NOT COMPLETED</p>
        <h1>Your order was not placed</h1>
        <p>No order is created when Safepay checkout is cancelled or payment does not succeed.</p>
        <p className="status-urdu" dir="rtl">ادائیگی مکمل نہیں ہوئی، اس لیے آپ کا آرڈر درج نہیں کیا گیا۔</p>
        <div className="status-actions">
          <a href="/"><ArrowLeft />Return and try again</a>
          <a className="secondary" href={WHATSAPP_URL} target="_blank" rel="noreferrer"><MessageCircle />Get help</a>
        </div>
      </section>
    </main>
  );
}
