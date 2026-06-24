
import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

// ─── Singleton transporter ────────────────────────────────────────────────────

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST!,
    port: Number(process.env.NODEMAILER_PORT ?? 587),
    secure: process.env.NODEMAILER_PORT === "465",
    auth: {
      user: process.env.NODEMAILER_USER!,
      pass: process.env.NODEMAILER_PASS!,
    },
  });

  return transporter;
}

// ─── Core send function ───────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string; // plain-text fallback
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const t = getTransporter();

  const mail: SendMailOptions = {
    from: process.env.NODEMAILER_FROM ?? `"Syntra AI" <${process.env.NODEMAILER_USER}>`,
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  await t.sendMail(mail);
}

// ─── Verify connection (call during server startup to catch misconfig) ────────

export async function verifyMailerConnection(): Promise<boolean> {
  try {
    const t = getTransporter();
    await t.verify();
    return true;
  } catch {
    return false;
  }
}