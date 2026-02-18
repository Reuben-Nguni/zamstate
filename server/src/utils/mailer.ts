import nodemailer from 'nodemailer';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.BREVO_FROM || process.env.SMTP_FROM || 'reutechhub@gmail.com';
const FROM_NAME = process.env.BREVO_FROM_NAME || 'ZAMSTATE';

async function brevoSend(to: string, subject: string, html: string, text?: string) {
  const url = 'https://api.brevo.com/v3/smtp/email';
  const payload: any = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };
  if (text) payload.textContent = text;

  const headers: any = { 'Content-Type': 'application/json' };
  if (BREVO_API_KEY) {
    headers['api-key'] = BREVO_API_KEY;
  } else {
    console.warn('[Mailer] ⚠️  WARNING: BREVO_API_KEY not set, email send will fail');
  }

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Mailer] 📧 Brevo API: sending to ${to}, subject="${subject}", attempt ${attempt}/${maxAttempts}`);
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[Mailer] ❌ Brevo API error: status=${res.status}`);
        console.error(`[Mailer] Response body: ${body}`);
        throw new Error(`Brevo API returned ${res.status}: ${body}`);
      }
      const responseData: any = await res.json();
      console.log(`[Mailer] ✅ Brevo API success: email sent to ${to}, messageId=${responseData.messageId}`);
      return;
    } catch (err: any) {
      console.error(`[Mailer] ❌ Attempt ${attempt}/${maxAttempts} failed:`, err?.message || err);
      if (attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, attempt * 500));
    }
  }
}

function getSmtpTransporter() {
  return nodemailer.createTransport({
    host: process.env.BREVO_HOST || process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.BREVO_PORT || process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER || process.env.SMTP_USER || '',
      pass: process.env.BREVO_PASS || process.env.SMTP_PASS || '',
    },
  });
}

export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  if (BREVO_API_KEY) {
    try {
      await brevoSend(to, subject, html, text);
      console.log(`[Mailer] Sent via Brevo to ${to}`);
      return;
    } catch (err) {
      console.error('[Mailer] Brevo send failed, falling back to SMTP:', err);
    }
  }

  // Fallback to SMTP (nodemailer)
  try {
    const transporter = getSmtpTransporter();
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`[Mailer] Sent via SMTP to ${to}`);
  } catch (err) {
    console.error('[Mailer] SMTP send failed:', err);
    throw err;
  }
};

export default sendEmail;
