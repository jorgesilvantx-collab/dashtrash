// Branded transactional email templates for DashTrashTX.
// All templates render at 600px wide, table-based, inline styles only — Outlook/Gmail safe.
// Brand: ink #0F1722, cyan #5EE3E3, off-white #FAFAF7, coral #FF7F65.

const INK = "#0F1722";
const CYAN = "#5EE3E3";
const BG = "#FAFAF7";
const CARD = "#FFFFFF";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const ACCENT_CORAL = "#FF7F65";
const FONT_STACK =
  "'Apple Color Emoji','Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif";

const SUPPORT_PHONE = "(682) 362-5847";
const SUPPORT_ADDR = "DashTrashTX · Dallas–Fort Worth, TX";

export type Template = { subject: string; html: string; text: string };

function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function shell(opts: { previewText: string; bodyHtml: string; supportEmail: string }): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>DashTrashTX</title>
  </head>
  <body style="margin:0;padding:0;background:${BG};font-family:${FONT_STACK};color:${INK};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(opts.previewText)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BG};">
      <tr>
        <td align="center" style="padding:24px 12px 8px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;">
            <!-- Header -->
            <tr>
              <td style="background:${INK};border-radius:14px 14px 0 0;padding:22px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <span style="font-family:${FONT_STACK};font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;line-height:1;">Dash<span style="color:${CYAN};">Trash</span></span>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-family:${FONT_STACK};font-size:12px;color:${CYAN};letter-spacing:1px;text-transform:uppercase;">Bin valet for DFW</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Cyan accent line -->
            <tr>
              <td style="background:${CYAN};height:4px;line-height:4px;font-size:0;">&nbsp;</td>
            </tr>
            <!-- Body card -->
            <tr>
              <td style="background:${CARD};padding:32px 32px 28px 32px;border-radius:0 0 14px 14px;">
                ${opts.bodyHtml}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:18px 28px 24px 28px;font-family:${FONT_STACK};font-size:12px;color:${MUTED};line-height:1.6;text-align:center;">
                <div style="margin-bottom:4px;color:${INK};font-weight:600;">Need a hand?</div>
                <div>Call <a href="tel:+16823625847" style="color:${INK};text-decoration:none;font-weight:600;">${SUPPORT_PHONE}</a> · Email <a href="mailto:${escapeHtml(opts.supportEmail)}" style="color:${INK};text-decoration:none;font-weight:600;">${escapeHtml(opts.supportEmail)}</a></div>
                <div style="margin-top:6px;">${SUPPORT_ADDR}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 12px 0;font-family:${FONT_STACK};font-size:24px;line-height:1.25;font-weight:800;color:${INK};letter-spacing:-0.4px;">${escapeHtml(text)}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 14px 0;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:${INK};">${text}</p>`;
}

function highlightBox(rows: { label: string; value: string }[]): string {
  const inner = rows
    .map(
      (r) => `
        <tr>
          <td style="padding:8px 0;font-family:${FONT_STACK};font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:0.5px;width:140px;vertical-align:top;">${escapeHtml(r.label)}</td>
          <td style="padding:8px 0;font-family:${FONT_STACK};font-size:15px;color:${INK};font-weight:600;vertical-align:top;">${escapeHtml(r.value)}</td>
        </tr>`
    )
    .join("");
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BG};border:1px solid ${BORDER};border-left:4px solid ${CYAN};border-radius:10px;padding:8px 18px;margin:0 0 18px 0;">
      <tr><td>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${inner}</table>
      </td></tr>
    </table>`;
}

function callout(text: string, color: "cyan" | "coral" = "cyan"): string {
  const bar = color === "cyan" ? CYAN : ACCENT_CORAL;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px 0;">
      <tr>
        <td style="background:${BG};border:1px solid ${BORDER};border-left:4px solid ${bar};border-radius:10px;padding:14px 16px;font-family:${FONT_STACK};font-size:14px;color:${INK};line-height:1.55;">
          ${text}
        </td>
      </tr>
    </table>`;
}

function signoff(): string {
  return `<p style="margin:24px 0 0 0;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:${INK};">— The DashTrashTX team</p>`;
}

function firstNameOf(name: string): string {
  return (name?.split(" ")[0] || name || "there").trim();
}

// ---------- Customer: in-area welcome ----------

export function welcomeInArea(args: {
  firstName: string;
  address: string;
  monthlyPrice?: string;
  firstServiceDate?: string;
  supportEmail: string;
}): Template {
  const first = firstNameOf(args.firstName);
  const rows: { label: string; value: string }[] = [
    { label: "Service address", value: args.address },
  ];
  if (args.monthlyPrice) rows.push({ label: "Monthly", value: args.monthlyPrice });
  if (args.firstServiceDate) rows.push({ label: "First service", value: args.firstServiceDate });

  const subject = "Welcome to DashTrashTX — we got your signup";
  const previewText = `Hi ${first} — we got your signup. Our team confirms your schedule within 24 hours.`;

  const bodyHtml = `
    ${h1(`Welcome aboard, ${escapeHtml(first)}.`)}
    ${p("Thanks for signing up. Your address is inside our active service zone, so we can roll right into scheduling.")}
    ${highlightBox(rows)}
    ${callout("<b>What happens next:</b> A team member will reach out within 24 hours to confirm pickup days and complete checkout. No charges until you approve the schedule.")}
    ${p("If you have questions in the meantime, just reply to this email or call us — we actually pick up.")}
    ${signoff()}
  `;

  const text = `Hi ${first},

Thanks for signing up with DashTrashTX! Your address (${args.address}) is in our active service zone.

What happens next: Our team will reach out within 24 hours to confirm your pickup schedule and complete checkout. No charges until you approve.

Questions? Reply to this email or call ${SUPPORT_PHONE}.

— The DashTrashTX team`;

  return {
    subject,
    html: shell({ previewText, bodyHtml, supportEmail: args.supportEmail }),
    text,
  };
}

// ---------- Customer: waitlist ----------

export function waitlistJoined(args: {
  firstName: string;
  address: string;
  neighborsNeeded?: number; // remaining (threshold - current)
  current?: number;
  threshold?: number;
  supportEmail: string;
}): Template {
  const first = firstNameOf(args.firstName);
  const rows: { label: string; value: string }[] = [
    { label: "Address", value: args.address },
  ];
  if (typeof args.current === "number" && typeof args.threshold === "number") {
    rows.push({ label: "Cluster progress", value: `${args.current} of ${args.threshold} homes` });
  }
  if (typeof args.neighborsNeeded === "number" && args.neighborsNeeded > 0) {
    rows.push({ label: "Neighbors to go", value: String(args.neighborsNeeded) });
  }

  const subject = "You're on the DashTrashTX waitlist";
  const previewText = `Hi ${first} — you're on the list for your neighborhood.`;

  const bodyHtml = `
    ${h1(`You're on the list, ${escapeHtml(first)}.`)}
    ${p("Your address is just outside our current routes, but we're growing every week. You're now in the queue for your neighborhood — we'll open it as soon as enough neighbors are in.")}
    ${highlightBox(rows)}
    ${callout("<b>Want to skip the wait?</b> Forward this email to neighbors. The more sign-ups in your cluster, the faster we can start.", "coral")}
    ${p("We'll email you the moment your area is ready.")}
    ${signoff()}
  `;

  const text = `Hi ${first},

Your address (${args.address}) is just outside our current routes, but you're now on the DashTrashTX waitlist for your neighborhood.${
    typeof args.current === "number" && typeof args.threshold === "number"
      ? `\n\nCluster progress: ${args.current} of ${args.threshold} homes.`
      : ""
  }

The more neighbors who sign up, the faster we open service. You'll be among the first notified.

— The DashTrashTX team`;

  return {
    subject,
    html: shell({ previewText, bodyHtml, supportEmail: args.supportEmail }),
    text,
  };
}

// ---------- Driver applied ----------

export function driverApplied(args: { firstName: string; supportEmail: string }): Template {
  const first = firstNameOf(args.firstName);
  const subject = "We got your DashTrashTX driver application";
  const previewText = `Thanks for applying, ${first}. We review every app within 48 hours.`;

  const bodyHtml = `
    ${h1(`Thanks for applying, ${escapeHtml(first)}.`)}
    ${p("Your driver application is in. We review every application personally — usually within 48 hours.")}
    ${callout("<b>What's next:</b> If you're a fit, we'll reach out to schedule a quick call and a ride-along. Bring questions.")}
    ${p("In the meantime, if you have questions, reply to this email or call us at " + SUPPORT_PHONE + ".")}
    ${signoff()}
  `;

  const text = `Hi ${first},

Thanks for applying to drive with DashTrashTX! We review every application within 48 hours. If you're a fit, we'll reach out to schedule a quick call and a ride-along.

Questions? Reply to this email or call ${SUPPORT_PHONE}.

— The DashTrashTX team`;

  return {
    subject,
    html: shell({ previewText, bodyHtml, supportEmail: args.supportEmail }),
    text,
  };
}

// ---------- Partner inquiry ----------

export function partnerInquiry(args: {
  firstName: string;
  companyName: string;
  supportEmail: string;
}): Template {
  const first = firstNameOf(args.firstName);
  const subject = "DashTrashTX partnership — we got your inquiry";
  const previewText = `Hi ${first} — your partnership inquiry for ${args.companyName} is in.`;

  const bodyHtml = `
    ${h1(`Thanks, ${escapeHtml(first)}.`)}
    ${p(`We got your partnership inquiry for <b>${escapeHtml(args.companyName)}</b>. Our partner team will review and reach out within one business day to discuss how DashTrashTX can support your clients.`)}
    ${callout("<b>Coming up:</b> A short call to understand your client base, then a custom proposal — pricing, branding, white-label options.")}
    ${p("Questions in the meantime? Reply to this email or call " + SUPPORT_PHONE + ".")}
    ${signoff()}
  `;

  const text = `Hi ${first},

Thanks for reaching out about a DashTrashTX partnership for ${args.companyName}. Our partner team will review and reach out within 1 business day to discuss how we can support your clients.

Questions in the meantime? Reply to this email or call ${SUPPORT_PHONE}.

— The DashTrashTX team`;

  return {
    subject,
    html: shell({ previewText, bodyHtml, supportEmail: args.supportEmail }),
    text,
  };
}

// ---------- Owner notification ----------

export type OwnerFormType =
  | "customer-in-area"
  | "customer-waitlist"
  | "driver"
  | "partner";

const FORM_LABELS: Record<OwnerFormType, string> = {
  "customer-in-area": "New customer signup",
  "customer-waitlist": "New waitlist signup",
  driver: "New driver application",
  partner: "New partner inquiry",
};

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bId\b/g, "ID")
    .replace(/\bUrl\b/g, "URL");
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.length === 0 ? "—" : v.map((x) => String(x)).join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

export function ownerNotification(args: {
  formType: OwnerFormType;
  payload: Record<string, unknown>;
  leadId?: string;
  subjectExtra?: string;
  supportEmail: string;
  replyToHint?: string;
}): Template {
  const label = FORM_LABELS[args.formType];
  const subject = args.subjectExtra
    ? `[DashTrashTX] ${label} — ${args.subjectExtra}`
    : `[DashTrashTX] ${label}`;

  const entries = Object.entries(args.payload).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );

  const rowsHtml = entries
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-family:${FONT_STACK};font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;width:170px;background:${BG};">${escapeHtml(humanizeKey(k))}</td>
        <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-family:${FONT_STACK};font-size:14px;color:${INK};vertical-align:top;word-break:break-word;">${escapeHtml(formatValue(v))}</td>
      </tr>`
    )
    .join("");

  const leadIdHtml = args.leadId
    ? `<div style="margin-top:14px;font-family:${FONT_STACK};font-size:12px;color:${MUTED};">Internal ID: <span style="color:${INK};font-weight:600;">${escapeHtml(args.leadId)}</span></div>`
    : "";

  const replyHint = args.replyToHint
    ? p(`Reply to this email to message <b>${escapeHtml(args.replyToHint)}</b> directly.`)
    : "";

  const previewText = `${label}${args.subjectExtra ? " — " + args.subjectExtra : ""}`;

  const bodyHtml = `
    ${h1(label)}
    ${p("A new submission just came in. Full details below.")}
    ${replyHint}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${BORDER};border-radius:10px;overflow:hidden;margin-top:8px;">
      ${rowsHtml || `<tr><td style="padding:14px;font-family:${FONT_STACK};font-size:14px;color:${MUTED};">No fields submitted.</td></tr>`}
    </table>
    ${leadIdHtml}
  `;

  const text =
    `${label}${args.subjectExtra ? " — " + args.subjectExtra : ""}\n\n` +
    entries.map(([k, v]) => `${humanizeKey(k)}: ${formatValue(v)}`).join("\n") +
    (args.leadId ? `\n\nInternal ID: ${args.leadId}` : "");

  return {
    subject,
    html: shell({ previewText, bodyHtml, supportEmail: args.supportEmail }),
    text,
  };
}
