import nodemailer from 'nodemailer';

// Creates a Nodemailer transporter using SMTP settings from environment variables.
// Supports Gmail, Outlook, and any SMTP provider.
// Required env vars:
// - SMTP_HOST (e.g. smtp.gmail.com or smtp.office365.com)
// - SMTP_PORT (e.g. 465 for SSL, 587 for STARTTLS)
// - SMTP_USER (your mailbox/login)
// - SMTP_PASS (your app password or mailbox password)
// Optional:
// - SMTP_SECURE ("true" for port 465 SSL, otherwise false)
// - EMAIL_FROM (default sender address, e.g. "Kepler CareerLift <no-reply@yourdomain>")

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_PORT, SMTP_SECURE).');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

export async function sendTeacherInvite({ to, code }) {
  const transporter = getTransporter();

  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const signupUrl = `${appUrl}/signup`;
  const from = process.env.EMAIL_FROM || 'Kepler CareerLift <no-reply@kepler-careerlift.local>';

  const subject = 'You are invited to Kepler CareerLift as a Teacher';
  const text = `Hello,

You have been invited to join Kepler CareerLift as a Teacher.

Your invite code: ${code}

To complete your signup:
1) Go to ${signupUrl}
2) Choose the Teacher option
3) Enter your invite code and complete your profile

If you did not expect this email, you can ignore it.

— Kepler CareerLift`;

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin:0 0 12px;">You're invited to Kepler CareerLift</h2>
      <p style="margin:0 0 12px;">You have been invited to join <strong>Kepler CareerLift</strong> as a <strong>Teacher</strong>.</p>
      <p style="margin:0 0 12px;">Your invite code:</p>
      <div style="font-size: 18px; font-weight: 700; letter-spacing: 1px; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; display: inline-block;">${code}</div>
      <p style="margin:16px 0 12px;">To complete your signup:</p>
      <ol style="margin:0 0 12px 18px;">
        <li>Visit <a href="${signupUrl}">${signupUrl}</a></li>
        <li>Select the <strong>Teacher</strong> option</li>
        <li>Enter your invite code and complete your profile</li>
      </ol>
      <p style="margin:16px 0 0; color:#64748b; font-size: 12px;">If you did not expect this email, you can ignore it.</p>
      <p style="margin:8px 0 0; color:#64748b; font-size: 12px;">— Kepler CareerLift</p>
    </div>
  `;

  await transporter.sendMail({ from, to, subject, text, html });
}
