import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const from = process.env.FROM_EMAIL || 'noreply@sports.local';

export function isConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER);
}

export async function sendCoachCredentials(email, password, firstName, lastName, baseUrl) {
  if (!isConfigured()) {
    console.warn('Email not configured; skipping coach credentials email');
    return false;
  }
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your Sports Management Service Coach Account',
      html: `
        <h2>Welcome, ${firstName} ${lastName}</h2>
        <p>Your coach account has been created.</p>
        <p><strong>Login URL:</strong> <a href="${baseUrl}/login">${baseUrl}/login</a></p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary password:</strong> ${password}</p>
        <p>Please sign in and change your password in Profile.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

export async function sendPasswordReset(email, resetUrl) {
  if (!isConfigured()) {
    console.warn('Email not configured; skipping password reset');
    return false;
  }
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Password Reset - Sports Management Service',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password (valid 1 hour):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}
