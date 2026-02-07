import nodemailer from 'nodemailer';

// Create transporter dynamically to ensure env vars are loaded
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.BREVO_HOST || process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.BREVO_PORT || process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER || process.env.SMTP_USER || '',
      pass: process.env.BREVO_PASS || process.env.SMTP_PASS || ''
    }
  });
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = getTransporter();
    console.log(`[Mailer] Sending email to ${to} via ${process.env.BREVO_HOST || 'smtp-relay.brevo.com'}`);
    await transporter.sendMail({
      from: process.env.BREVO_FROM || process.env.SMTP_FROM || 'no-reply@example.com',
      to,
      subject,
      html
    });
    console.log(`[Mailer] Email sent successfully to ${to}`);
  } catch (err) {
    console.error('[Mailer] Error sending email:', err);
    throw err;
  }
};

export default getTransporter;
