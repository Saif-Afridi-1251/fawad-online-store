import type { StoredOrder } from "./orders-db";
import { setEmailDeliveryStatuses } from "./orders-db";

const OWNER_EMAIL = "fawadaslam31@gmail.com";
const SUPPORT_PHONE = "+92 333 9789188";
const WHATSAPP_URL = "https://wa.me/923339789188";
const STORE_URL = "https://fawad-online-store.fawad5251.chatgpt.site";
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

type DeliveryStatus = "sent" | "failed" | "skipped";

export type OrderEmailDelivery = {
  owner: DeliveryStatus;
  customer: DeliveryStatus;
};

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function emailShell({
  preheader,
  title,
  lead,
  body,
  footer,
}: {
  preheader: string;
  title: string;
  lead: string;
  body: string;
  footer: string;
}) {
  return `<!doctype html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#f4f7fb;color:#0d1830;font-family:Arial,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 10px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 34px rgba(7,18,38,.10)">
          <tr><td style="padding:24px 30px;background:#071226;color:#fff">
            <div style="font-size:22px;font-weight:800;letter-spacing:.08em">FAWAD</div>
            <div style="font-size:10px;font-weight:700;letter-spacing:.2em;color:#5de1ee">ONLINE STORE</div>
          </td></tr>
          <tr><td style="padding:34px 30px">
            <div style="display:inline-block;padding:7px 10px;border-radius:20px;background:#edf3ff;color:#175cff;font-size:11px;font-weight:700">ORDER ${escapeHtml(title)}</div>
            <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.2">${escapeHtml(lead)}</h1>
            ${body}
          </td></tr>
          <tr><td style="padding:22px 30px;background:#071226;color:#aebbd1;font-size:12px;line-height:1.6">${footer}</td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function orderItemsHtml(order: StoredOrder) {
  return order.items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #e7ecf4">${escapeHtml(item.productName)}</td>
        <td align="center" style="padding:12px 8px;border-bottom:1px solid #e7ecf4">${item.quantity}</td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #e7ecf4;font-weight:700">${money(item.lineTotal)}</td>
      </tr>`
    )
    .join("");
}

function totalsHtml(order: StoredOrder) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px">
    <tr><td style="padding:5px 0;color:#62708a">Subtotal</td><td align="right">${money(order.subtotal)}</td></tr>
    <tr><td style="padding:5px 0;color:#62708a">Delivery</td><td align="right">${money(order.deliveryFee)}</td></tr>
    <tr><td style="padding:14px 0 0;border-top:1px solid #dce3ef;font-size:17px;font-weight:800">Total</td><td align="right" style="padding:14px 0 0;border-top:1px solid #dce3ef;color:#175cff;font-size:19px;font-weight:800">${money(order.total)}</td></tr>
  </table>`;
}

function ownerEmail(order: StoredOrder) {
  const paymentLabel = order.status === "paid" ? `${order.paymentProvider} — verified paid` : "Cash on Delivery";
  return emailShell({
    preheader: `New ${paymentLabel} order ${order.id} from ${order.customerName}`,
    title: order.id,
    lead: "A new customer order is confirmed.",
    body: `<p style="margin:0 0 24px;color:#62708a;line-height:1.7">The order is stored in the Fawad Online Store database. Complete customer, delivery and payment details are below.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:18px;background:#f4f7fb;border-radius:12px;font-size:14px;line-height:1.7">
        <tr><td style="color:#62708a">Customer</td><td align="right"><strong>${escapeHtml(order.customerName)}</strong></td></tr>
        <tr><td style="color:#62708a">Phone</td><td align="right"><a href="tel:${escapeHtml(order.phone)}" style="color:#175cff">${escapeHtml(order.phone)}</a></td></tr>
        <tr><td style="color:#62708a">Email</td><td align="right"><a href="mailto:${escapeHtml(order.email)}" style="color:#175cff">${escapeHtml(order.email)}</a></td></tr>
        <tr><td style="color:#62708a">City</td><td align="right">${escapeHtml(order.city)}, ${escapeHtml(order.country)}</td></tr>
        <tr><td style="color:#62708a;vertical-align:top">Address</td><td align="right" style="max-width:340px">${escapeHtml(order.address)}</td></tr>
        <tr><td style="color:#62708a">Payment</td><td align="right"><strong>${escapeHtml(paymentLabel)}</strong></td></tr>
      </table>
      <h2 style="margin:28px 0 8px;font-size:18px">Order items</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px">${orderItemsHtml(order)}</table>
      ${totalsHtml(order)}
      <p style="margin:24px 0 0"><a href="${WHATSAPP_URL}?text=${encodeURIComponent(`Order ${order.id} — Hello ${order.customerName}`)}" style="display:inline-block;padding:12px 18px;border-radius:9px;background:#175cff;color:#fff;text-decoration:none;font-weight:700">Contact customer on WhatsApp</a></p>`,
    footer: `Owner notification · Fawad Online Store · <a href="${STORE_URL}" style="color:#5de1ee">Open store</a>`,
  });
}

function customerEmail(order: StoredOrder) {
  const isPaid = order.status === "paid";
  return emailShell({
    preheader: `Your Fawad Online Store order ${order.id} is confirmed`,
    title: order.id,
    lead: `Thank you, ${order.customerName}. Your order is confirmed.`,
    body: `<p style="margin:0 0 22px;color:#62708a;line-height:1.7">We have received your order. ${isPaid ? "Your online payment has been verified." : "You selected Cash on Delivery; please pay the total amount when your parcel arrives."}</p>
      <div style="padding:16px 18px;background:#edf3ff;border-left:4px solid #175cff;border-radius:8px">
        <div style="font-size:11px;color:#62708a;text-transform:uppercase;letter-spacing:.08em">Order number</div>
        <div style="margin-top:4px;color:#175cff;font-size:20px;font-weight:800">${escapeHtml(order.id)}</div>
      </div>
      <h2 style="margin:28px 0 8px;font-size:18px">Your order</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px">${orderItemsHtml(order)}</table>
      ${totalsHtml(order)}
      <h2 style="margin:28px 0 8px;font-size:18px">Delivery details</h2>
      <p style="margin:0;color:#62708a;line-height:1.75">${escapeHtml(order.customerName)}<br>${escapeHtml(order.phone)}<br>${escapeHtml(order.address)}<br>${escapeHtml(order.city)}, ${escapeHtml(order.country)}</p>
      <div dir="rtl" style="margin-top:24px;padding:16px;background:#f4f7fb;border-radius:10px;color:#34415a;line-height:2;text-align:right">آپ کا آرڈر کامیابی سے درج ہو گیا ہے۔ مدد کے لیے اپنا آرڈر نمبر محفوظ رکھیں۔</div>
      <p style="margin:24px 0 0"><a href="${WHATSAPP_URL}?text=${encodeURIComponent(`Hello Fawad Online Store, I need help with order ${order.id}`)}" style="display:inline-block;padding:12px 18px;border-radius:9px;background:#175cff;color:#fff;text-decoration:none;font-weight:700">Get order help on WhatsApp</a></p>`,
    footer: `Need help? WhatsApp or call ${SUPPORT_PHONE} · <a href="${STORE_URL}" style="color:#5de1ee">Fawad Online Store</a>`,
  });
}

async function sendBrevoEmail({
  to,
  name,
  subject,
  htmlContent,
}: {
  to: string;
  name: string;
  subject: string;
  htmlContent: string;
}) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || "Fawad Online Store";
  if (!apiKey || !senderEmail) throw new Error("Brevo transactional email is not configured.");

  let lastError = "Email provider did not accept the message.";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to, name }],
        replyTo: { email: OWNER_EMAIL, name: "Fawad Online Store" },
        subject,
        htmlContent,
        tags: ["store-order"],
      }),
    });
    if (response.ok) return;
    const detail = await response.text().catch(() => "");
    lastError = `Brevo ${response.status}: ${detail.slice(0, 240)}`;
    if (response.status !== 429 && response.status < 500) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(lastError);
}

export async function notifyOrderParties(order: StoredOrder): Promise<OrderEmailDelivery> {
  let owner: DeliveryStatus = order.ownerEmailStatus === "sent" ? "sent" : "skipped";
  let customer: DeliveryStatus = order.customerEmailStatus === "sent" ? "sent" : "skipped";
  const errors: string[] = [];

  if (owner !== "sent") {
    try {
      await sendBrevoEmail({
        to: OWNER_EMAIL,
        name: "Fawad Aslam",
        subject: `${order.status === "paid" ? "PAID" : "COD"} order ${order.id} — ${order.customerName}`,
        htmlContent: ownerEmail(order),
      });
      owner = "sent";
    } catch (error) {
      owner = "failed";
      errors.push(`Owner: ${error instanceof Error ? error.message : "Unknown email error"}`);
    }
  }

  if (customer !== "sent") {
    try {
      await sendBrevoEmail({
        to: order.email,
        name: order.customerName,
        subject: `Order confirmed — ${order.id} | Fawad Online Store`,
        htmlContent: customerEmail(order),
      });
      customer = "sent";
    } catch (error) {
      customer = "failed";
      errors.push(`Customer: ${error instanceof Error ? error.message : "Unknown email error"}`);
    }
  }

  await setEmailDeliveryStatuses({
    orderId: order.id,
    ownerStatus: owner,
    customerStatus: customer,
    error: errors.join(" | "),
  });

  if (errors.length) console.error("Order email delivery incomplete", { orderId: order.id, errors });
  return { owner, customer };
}
