const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BRAND_VIOLET = "#7C3AED";
const BRAND_BLUE = "#2563EB";

// ─── Shared wrapper ───────────────────────────────────────────────────────────

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Syntra AI</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,${BRAND_BLUE},${BRAND_VIOLET});border-radius:14px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:22px;font-weight:700;line-height:48px;">S</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#111827;letter-spacing:0.04em;">SYNTRA</p>
                    <p style="margin:0;font-size:9px;color:#9CA3AF;letter-spacing:0.18em;text-transform:uppercase;">AI Meeting Co-worker</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;border:1px solid #E5E7EB;box-shadow:0 4px 24px rgba(0,0,0,0.06);overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${content}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;">
                You're receiving this because you have an account on Syntra AI.<br/>
                © ${new Date().getFullYear()} Syntra AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string, color: string = BRAND_VIOLET): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td style="background:${color};border-radius:12px;padding:0;">
        <a href="${href}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

// ─── 1. Email verification (sent after signup) ────────────────────────────────

export function verificationEmailTemplate(params: {
  fullName: string;
  verificationLink: string;
}): { subject: string; html: string; text: string } {
  const subject = "Verify your Syntra AI email address";

  const html = wrap(`
    <tr>
      <td style="padding:40px 40px 0;">
        <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Verify your email</p>
        <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6;">
          Hi ${params.fullName}, welcome to Syntra AI! Click the button below to verify your email address and activate your account.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px;">
        ${button("Verify email address", params.verificationLink)}
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;">
        <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;">Or copy and paste this link into your browser:</p>
        <p style="margin:0;font-size:11px;color:#7C3AED;word-break:break-all;">${params.verificationLink}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:#F9FAFB;border-top:1px solid #F3F4F6;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;">This link expires in 24 hours. If you didn't create a Syntra AI account, you can safely ignore this email.</p>
      </td>
    </tr>
  `);

  const text = `Hi ${params.fullName},\n\nVerify your Syntra AI email:\n${params.verificationLink}\n\nThis link expires in 24 hours.`;

  return { subject, html, text };
}

// ─── 2. Password reset ────────────────────────────────────────────────────────

export function passwordResetEmailTemplate(params: {
  fullName: string;
  resetLink: string;
}): { subject: string; html: string; text: string } {
  const subject = "Reset your Syntra AI password";

  const html = wrap(`
    <tr>
      <td style="padding:40px 40px 0;">
        <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Reset your password</p>
        <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6;">
          Hi ${params.fullName}, we received a request to reset the password for your Syntra AI account. Click the button below to choose a new one.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px;">
        ${button("Reset password", params.resetLink)}
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;">
        <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;">Or copy and paste this link into your browser:</p>
        <p style="margin:0;font-size:11px;color:#7C3AED;word-break:break-all;">${params.resetLink}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:#F9FAFB;border-top:1px solid #F3F4F6;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will not change.</p>
      </td>
    </tr>
  `);

  const text = `Hi ${params.fullName},\n\nReset your Syntra AI password:\n${params.resetLink}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;

  return { subject, html, text };
}

// ─── 3. Workspace invite (sent from onboarding Step 4 / Team page) ────────────

export function inviteEmailTemplate(params: {
  invitedByName: string;
  workspaceName: string;
  email: string;
  inviteLink: string;
}): { subject: string; html: string; text: string } {
  const subject = `${params.invitedByName} invited you to join ${params.workspaceName} on Syntra AI`;

  const html = wrap(`
    <tr>
      <td style="padding:40px 40px 0;">
        <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">You&apos;re invited!</p>
        <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6;">
          <strong style="color:#111827;">${params.invitedByName}</strong> has invited you to join
          <strong style="color:#7C3AED;">${params.workspaceName}</strong> on Syntra AI —
          the AI meeting co-worker that turns conversations into tasks, decisions, and reports automatically.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3FF;border-radius:12px;border:1px solid #DDD6FE;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 4px;font-size:11px;color:#7C3AED;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Invited as</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">Member · ${params.workspaceName}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#6B7280;">${params.email}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;">
        ${button("Accept invite & create account", params.inviteLink)}
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 24px;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;">Or copy this link: <span style="color:#7C3AED;word-break:break-all;">${params.inviteLink}</span></p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:#F9FAFB;border-top:1px solid #F3F4F6;">
        <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;font-weight:600;">What is Syntra AI?</p>
        <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">Syntra joins your meetings, listens in real time, and automatically extracts tasks, decisions, and summaries — so nothing falls through the cracks.</p>
      </td>
    </tr>
  `);

  const text = `${params.invitedByName} invited you to join ${params.workspaceName} on Syntra AI.\n\nAccept your invite:\n${params.inviteLink}`;

  return { subject, html, text };
}

// ─── 4. Welcome email (sent after onboarding activation) ─────────────────────

export function welcomeEmailTemplate(params: {
  fullName: string;
  workspaceName: string;
  agentName: string;
  dashboardLink: string;
}): { subject: string; html: string; text: string } {
  const subject = `${params.agentName} is ready — your workspace is live!`;

  const html = wrap(`
    <tr>
      <td style="padding:40px 40px 0;">
        <p style="margin:0 0 4px;font-size:11px;color:#7C3AED;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">You're all set</p>
        <p style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Welcome to Syntra AI, ${params.fullName}!</p>
        <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6;">
          Your workspace <strong style="color:#111827;">${params.workspaceName}</strong> is live and your AI agent
          <strong style="color:#7C3AED;">${params.agentName}</strong> is active. It will join your scheduled meetings automatically and start extracting tasks and decisions right away.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${["Joins meetings automatically from your calendar", "Extracts tasks, owners &amp; deadlines in real time", "Generates a PDF summary after every meeting", "Flags tasks with no owner or deadline"].map((item) => `
          <tr>
            <td style="padding:6px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:20px;vertical-align:top;padding-top:2px;">
                    <div style="width:16px;height:16px;background:#EDE9FE;border-radius:50%;text-align:center;line-height:16px;font-size:9px;color:#7C3AED;font-weight:700;">✓</div>
                  </td>
                  <td style="padding-left:10px;font-size:13px;color:#374151;">${item}</td>
                </tr>
              </table>
            </td>
          </tr>`).join("")}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;">
        ${button("Go to dashboard", params.dashboardLink)}
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:#F9FAFB;border-top:1px solid #F3F4F6;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;">
          Need help? Reply to this email or visit our support docs. We&apos;re here to help you get the most out of every meeting.
        </p>
      </td>
    </tr>
  `);

  const text = `Welcome to Syntra AI, ${params.fullName}!\n\nYour workspace "${params.workspaceName}" is live and ${params.agentName} is active.\n\nGo to dashboard: ${params.dashboardLink}`;

  return { subject, html, text };
}

// ─── 5. Meeting summary email (sent after meeting ends) ───────────────────────

export function meetingSummaryEmailTemplate(params: {
  recipientName: string;
  meetingTitle: string;
  meetingDate: string;
  summary: string;
  taskCount: number;
  decisionCount: number;
  meetingLink: string;
  pdfLink?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Meeting summary: ${params.meetingTitle}`;

  const html = wrap(`
    <tr>
      <td style="padding:40px 40px 0;">
        <p style="margin:0 0 4px;font-size:11px;color:#7C3AED;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Meeting summary</p>
        <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;">${params.meetingTitle}</p>
        <p style="margin:0;font-size:13px;color:#9CA3AF;">${params.meetingDate}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:50%;padding-right:8px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3FF;border-radius:10px;border:1px solid #DDD6FE;">
                <tr><td style="padding:14px 16px;text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:700;color:#7C3AED;">${params.taskCount}</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;">Tasks extracted</p>
                </td></tr>
              </table>
            </td>
            <td style="width:50%;padding-left:8px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF6FF;border-radius:10px;border:1px solid #BFDBFE;">
                <tr><td style="padding:14px 16px;text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:700;color:#2563EB;">${params.decisionCount}</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;">Decisions made</p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 24px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;">Summary</p>
        <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.7;background:#F9FAFB;border-radius:10px;padding:14px;border:1px solid #F3F4F6;">${params.summary}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">${button("View full meeting", params.meetingLink)}</td>
            ${params.pdfLink ? `<td>${button("Download PDF", params.pdfLink, "#059669")}</td>` : ""}
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:#F9FAFB;border-top:1px solid #F3F4F6;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;">This summary was generated automatically by Syntra AI. Hi ${params.recipientName}!</p>
      </td>
    </tr>
  `);

  const text = `Meeting summary: ${params.meetingTitle} (${params.meetingDate})\n\nTasks: ${params.taskCount} | Decisions: ${params.decisionCount}\n\n${params.summary}\n\nView full meeting: ${params.meetingLink}`;

  return { subject, html, text };
}