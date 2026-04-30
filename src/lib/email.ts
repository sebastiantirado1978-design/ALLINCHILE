import { Resend } from "resend";

/**
 * Cliente de email transaccional.
 *
 * Si `RESEND_API_KEY` no está definida, las funciones loguean a consola en lugar
 * de enviar — útil en dev y para no romper el flujo si Resend no está conectado.
 */

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || "ALLINCHILE <hola@allinchile.cl>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";

const client = apiKey ? new Resend(apiKey) : null;

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail(params: SendEmailParams) {
  if (!client) {
    console.warn(
      `[email] RESEND_API_KEY no configurada — no se envía email a ${params.to}.\n  Subject: ${params.subject}`,
    );
    return { sent: false, reason: "not_configured" as const };
  }
  try {
    const result = await client.emails.send({
      from: fromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });
    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return { sent: false, reason: "send_error" as const, error: result.error.message };
    }
    return { sent: true, id: result.data?.id };
  } catch (e) {
    console.error("[email] Send exception:", e);
    return { sent: false, reason: "exception" as const };
  }
}

// ============================================================================
// Templates
// ============================================================================

function wrapInLayout(content: string, footer?: string) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr><td style="padding:32px 32px 16px 32px;">
            <p style="margin:0;font-size:20px;font-weight:bold;letter-spacing:-0.02em;">
              ALLIN<span style="color:#06b6d4;">CHILE</span>
            </p>
          </td></tr>
          <tr><td style="padding:0 32px 32px 32px;font-size:15px;line-height:1.6;">
            ${content}
          </td></tr>
        </table>
        <p style="margin:20px 0 0 0;font-size:12px;color:#64748b;text-align:center;">
          ${footer ?? "ALLINCHILE — Plataforma de gestión comercial y atención al cliente"}<br>
          <a href="${appUrl}" style="color:#0c4a6e;text-decoration:none;">${appUrl.replace(/^https?:\/\//, "")}</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export async function sendInvitationEmail(params: {
  to: string;
  organizationName: string;
  inviterName: string;
  role: string;
  token: string;
}) {
  const acceptUrl = `${appUrl}/invite/${params.token}`;
  const html = wrapInLayout(`
    <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:bold;">Te invitaron a ${escapeHtml(params.organizationName)} 🎉</h1>
    <p style="margin:0 0 12px 0;">
      <strong>${escapeHtml(params.inviterName)}</strong> te invitó a unirte a
      <strong>${escapeHtml(params.organizationName)}</strong> en ALLINCHILE como
      <strong>${escapeHtml(params.role)}</strong>.
    </p>
    <p style="margin:0 0 24px 0;color:#64748b;">
      ALLINCHILE es la plataforma que centraliza ventas, atención y seguimiento de clientes en un solo lugar.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
      <tr><td style="background:#0c4a6e;border-radius:8px;">
        <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:600;">
          Aceptar invitación
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;">
      O copia este link en tu navegador:
    </p>
    <p style="margin:0;font-size:12px;color:#0c4a6e;word-break:break-all;">
      ${acceptUrl}
    </p>
    <p style="margin:24px 0 0 0;font-size:12px;color:#94a3b8;">
      Esta invitación expira en 7 días. Si no esperabas esta invitación, puedes ignorar este email.
    </p>
  `);

  return sendEmail({
    to: params.to,
    subject: `${params.inviterName} te invitó a ${params.organizationName} en ALLINCHILE`,
    html,
    text: `${params.inviterName} te invitó a ${params.organizationName} en ALLINCHILE como ${params.role}.\n\nAcepta la invitación: ${acceptUrl}`,
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  fullName: string;
  organizationName: string;
}) {
  const html = wrapInLayout(`
    <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:bold;">¡Bienvenido a ALLINCHILE, ${escapeHtml(params.fullName.split(" ")[0])}! 👋</h1>
    <p style="margin:0 0 16px 0;">
      Tu cuenta de <strong>${escapeHtml(params.organizationName)}</strong> está lista.
    </p>
    <p style="margin:0 0 16px 0;color:#475569;">
      Para sacarle el jugo a la plataforma en menos de 5 minutos, te dejamos los primeros pasos:
    </p>
    <ul style="margin:0 0 24px 0;padding-left:20px;color:#0f172a;">
      <li style="margin-bottom:6px;">Crea tu primer contacto</li>
      <li style="margin-bottom:6px;">Agrega una empresa</li>
      <li style="margin-bottom:6px;">Registra tu primera oportunidad de venta</li>
      <li style="margin-bottom:6px;">Crea una plantilla de mensaje con atajo (ej. /saludo)</li>
      <li style="margin-bottom:6px;">Invita a tu equipo</li>
    </ul>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px auto;">
      <tr><td style="background:#0c4a6e;border-radius:8px;">
        <a href="${appUrl}/dashboard" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:600;">
          Ir al dashboard
        </a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0 0;font-size:13px;color:#64748b;">
      ¿Necesitas ayuda? Responde este email o escríbenos a hola@allinchile.cl.
    </p>
  `);

  return sendEmail({
    to: params.to,
    subject: `Bienvenido a ALLINCHILE, ${params.fullName.split(" ")[0]}`,
    html,
    text: `Bienvenido a ALLINCHILE. Tu cuenta de ${params.organizationName} está lista. Ve al dashboard: ${appUrl}/dashboard`,
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
