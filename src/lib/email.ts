import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  customerName,
  items,
  total,
  deliveryMethod,
  deliveryDetails,
}: {
  to: string;
  orderId: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  deliveryMethod: string;
  deliveryDetails?: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set. Skipping email send.");
    return { success: false, skipped: true };
  }

  const deliveryLabel = deliveryMethod === "pickup" ? "Retiro en punto" : "Línea Sarmiento";

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #E8E2DC;font-family:system-ui,sans-serif;font-size:14px;color:#1C1917">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #E8E2DC;text-align:center;font-family:system-ui,sans-serif;font-size:14px;color:#78716C">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #E8E2DC;text-align:right;font-family:system-ui,sans-serif;font-size:14px;color:#1C1917">$${item.price.toLocaleString("es-AR")}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="max-width:560px;margin:0 auto;background:#FAF8F5;padding:40px 32px;border-radius:16px;font-family:system-ui,sans-serif;color:#1C1917">
      <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:500;margin-bottom:8px;color:#1C1917">Millanel</h1>
      <p style="font-size:14px;color:#78716C;margin-bottom:32px">Cosméticos</p>
      <h2 style="font-family:Georgia,serif;font-size:20px;font-weight:500;margin-bottom:8px">Hola ${customerName},</h2>
      <p style="font-size:15px;line-height:1.6;color:#44403C;margin-bottom:24px">Recibimos tu pedido correctamente. Acá están los detalles:</p>
      <div style="background:#FFFFFF;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #E8E2DC">
        <p style="font-size:13px;color:#78716C;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.1em">Pedido #${orderId.slice(-6).toUpperCase()}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <thead>
            <tr>
              <th style="text-align:left;font-size:12px;color:#78716C;padding-bottom:8px;border-bottom:2px solid #D9D3CD;font-weight:500">Producto</th>
              <th style="text-align:center;font-size:12px;color:#78716C;padding-bottom:8px;border-bottom:2px solid #D9D3CD;font-weight:500">Cant.</th>
              <th style="text-align:right;font-size:12px;color:#78716C;padding-bottom:8px;border-bottom:2px solid #D9D3CD;font-weight:500">Precio</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px">
          <span style="font-family:Georgia,serif;font-size:16px;font-weight:500">Total</span>
          <span style="font-family:Georgia,serif;font-size:20px;font-weight:500">$${total.toLocaleString("es-AR")}</span>
        </div>
      </div>
      <div style="background:#FFFFFF;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E2DC">
        <p style="font-size:13px;color:#78716C;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.1em">Entrega</p>
        <p style="font-size:15px;font-weight:500;margin-bottom:2px">${deliveryLabel}</p>
        ${deliveryDetails ? `<p style="font-size:14px;color:#78716C">${deliveryDetails}</p>` : ""}
      </div>
      <p style="font-size:14px;color:#78716C;text-align:center">Te avisamos por email cuando el pago sea confirmado.</p>
      <hr style="border:none;border-top:1px solid #E8E2DC;margin:32px 0" />
      <p style="font-size:12px;color:#A8A29E;text-align:center">Millanel · Cosméticos</p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: `Millanel <${FROM_EMAIL}>`,
      to,
      subject: `Pedido recibido #${orderId.slice(-6).toUpperCase()} · Millanel`,
      html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return { success: false, error };
  }
}

export async function sendPaymentApprovedEmail({
  to,
  orderId,
  customerName,
  items,
  total,
}: {
  to: string;
  orderId: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set. Skipping email send.");
    return { success: false, skipped: true };
  }

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #E8E2DC;font-family:system-ui,sans-serif;font-size:14px;color:#1C1917">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #E8E2DC;text-align:center;font-family:system-ui,sans-serif;font-size:14px;color:#78716C">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #E8E2DC;text-align:right;font-family:system-ui,sans-serif;font-size:14px;color:#1C1917">$${item.price.toLocaleString("es-AR")}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="max-width:560px;margin:0 auto;background:#FAF8F5;padding:40px 32px;border-radius:16px;font-family:system-ui,sans-serif;color:#1C1917">
      <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:500;margin-bottom:8px;color:#1C1917">Millanel</h1>
      <p style="font-size:14px;color:#78716C;margin-bottom:32px">Cosméticos</p>
      <h2 style="font-family:Georgia,serif;font-size:20px;font-weight:500;margin-bottom:8px">¡Pago confirmado!</h2>
      <p style="font-size:15px;line-height:1.6;color:#44403C;margin-bottom:24px">Hola ${customerName}, tu pago fue aprobado y ya estamos preparando tu pedido.</p>
      <div style="background:#FFFFFF;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #E8E2DC">
        <p style="font-size:13px;color:#78716C;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.1em">Pedido #${orderId.slice(-6).toUpperCase()}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <thead>
            <tr>
              <th style="text-align:left;font-size:12px;color:#78716C;padding-bottom:8px;border-bottom:2px solid #D9D3CD;font-weight:500">Producto</th>
              <th style="text-align:center;font-size:12px;color:#78716C;padding-bottom:8px;border-bottom:2px solid #D9D3CD;font-weight:500">Cant.</th>
              <th style="text-align:right;font-size:12px;color:#78716C;padding-bottom:8px;border-bottom:2px solid #D9D3CD;font-weight:500">Precio</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px">
          <span style="font-family:Georgia,serif;font-size:16px;font-weight:500">Total pagado</span>
          <span style="font-family:Georgia,serif;font-size:20px;font-weight:500">$${total.toLocaleString("es-AR")}</span>
        </div>
      </div>
      <p style="font-size:14px;color:#78716C;text-align:center">Te contactaremos pronto para coordinar la entrega.</p>
      <hr style="border:none;border-top:1px solid #E8E2DC;margin:32px 0" />
      <p style="font-size:12px;color:#A8A29E;text-align:center">Millanel · Cosméticos</p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: `Millanel <${FROM_EMAIL}>`,
      to,
      subject: `Pago confirmado · Pedido #${orderId.slice(-6).toUpperCase()} · Millanel`,
      html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Failed to send payment approved email:", error);
    return { success: false, error };
  }
}
