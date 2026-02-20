import { User } from '../models/User.js';
import { sendEmail } from '../utils/mailer.js';

const APP_NAME = process.env.APP_NAME || 'ZAMSTATE';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

function wrapTemplate(title: string, bodyHtml: string) {
  return `<!doctype html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0;padding:0;background:#f7f7f7 }
      .container { max-width:600px;margin:20px auto;background:#ffffff;padding:20px;border-radius:8px }
      .btn { display:inline-block;padding:10px 16px;border-radius:6px;background:#2d8f4a;color:#fff;text-decoration:none }
      .muted { color:#6b7280;font-size:14px }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>${APP_NAME}</h2>
      ${bodyHtml}
      <p class="muted">If you did not expect this email, you can ignore it.</p>
    </div>
  </body>
  </html>`;
}

export const sendVerificationEmail = async (user: any, token: string, baseUrl?: string) => {
  const client = baseUrl || CLIENT_URL;
  const link = `${client}/verify-email?token=${encodeURIComponent(token)}`;
  const html = wrapTemplate('Verify your email', `
    <p>Hi ${user.firstName},</p>
    <p>Please verify your email by clicking the button below. This link expires in 24 hours.</p>
    <p><a class="btn" href="${link}">Verify Email</a></p>
  `);
  const text = `Hi ${user.firstName},\nVerify your email: ${link}`;
  await sendEmail(user.email, `Verify your email — ${APP_NAME}`, html, text);
};

export const sendWelcomeEmail = async (user: any, baseUrl?: string) => {
  const client = baseUrl || CLIENT_URL;
  const html = wrapTemplate('Welcome to ' + APP_NAME, `
    <p>Hi ${user.firstName},</p>
    <p>Welcome to ${APP_NAME}! We're glad to have you. Start by browsing properties or completing your profile.</p>
    <p><a class="btn" href="${client}">Open ${APP_NAME}</a></p>
  `);
  const text = `Welcome to ${APP_NAME}, ${user.firstName}! Visit ${client}`;
  await sendEmail(user.email, `Welcome to ${APP_NAME}`, html, text);
};

export const sendPasswordResetEmail = async (user: any, token: string, baseUrl?: string) => {
  const client = baseUrl || CLIENT_URL;
  const link = `${client}/reset-password?token=${encodeURIComponent(token)}`;
  console.log(`[EmailService] Password reset link for ${user.email}: ${link}`);
  const html = wrapTemplate('Reset your password', `
    <p>Hi ${user.firstName},</p>
    <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
    <p><a class="btn" href="${link}">Reset Password</a></p>
  `);
  const text = `Reset your password: ${link}`;
  await sendEmail(user.email, `Reset your password — ${APP_NAME}`, html, text);
};

export const sendPasswordResetConfirmation = async (user: any, baseUrl?: string) => {
  const client = baseUrl || CLIENT_URL;
  const html = wrapTemplate('Password changed', `
    <p>Hi ${user.firstName},</p>
    <p>Your password was changed successfully. If you did not perform this action, contact support immediately.</p>
    <p><a class="btn" href="${client}/login">Sign in</a></p>
  `);
  const text = `Your password was changed. If this wasn't you, contact support.`;
  await sendEmail(user.email, `Password changed — ${APP_NAME}`, html, text);
};

export const sendPropertyInquiryEmail = async (agentEmail: string, inquiry: any) => {
  const html = wrapTemplate('New property inquiry', `
    <p>You have a new inquiry for your property.</p>
    <p><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
    <p><strong>Message:</strong></p>
    <p>${inquiry.message}</p>
  `);
  const text = `New inquiry from ${inquiry.name} (${inquiry.email}): ${inquiry.message}`;
  await sendEmail(agentEmail, `New inquiry for your property — ${APP_NAME}`, html, text);
};

export const sendNewPropertyNotification = async (adminEmails: string[], property: any, baseUrl?: string) => {
  const client = baseUrl || CLIENT_URL;
  const html = wrapTemplate('New property listed', `
    <p>A new property was listed by ${property.ownerName || 'a user'}.</p>
    <p><strong>Title:</strong> ${property.title}</p>
    <p><strong>Price:</strong> ${property.price}</p>
    <p><a class="btn" href="${client}/properties/${property._id}">View Property</a></p>
  `);
  const text = `New property listed: ${property.title} - ${property.price}`;
  for (const email of adminEmails) {
    try {
      // send individually to avoid leaking recipient list
      await sendEmail(email, `New property listed — ${APP_NAME}`, html, text);
    } catch (err) {
      console.error('[EmailService] Failed to notify admin', email, err);
    }
  }
};

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendPropertyInquiryEmail,
  sendNewPropertyNotification,
};
