import nodemailer from "nodemailer";

// ─── Transporter ────────────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ─── Shared HTML wrapper ─────────────────────────────────────────────────────
const emailWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f1117; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #1a1d2e; border-radius: 12px; border: 1px solid rgba(139,92,246,0.2); overflow: hidden; }
    .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 40px; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 14px; }
    .body { padding: 36px 40px; color: #c8cad8; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .badge--pending  { background: rgba(234,179,8,0.15);  color: #eab308; }
    .badge--interview{ background: rgba(99,102,241,0.15); color: #818cf8; }
    .badge--offer    { background: rgba(34,197,94,0.15);  color: #22c55e; }
    .badge--reject   { background: rgba(239,68,68,0.15);  color: #ef4444; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 20px 24px; margin: 20px 0; }
    .card p { margin: 6px 0; font-size: 14px; }
    .card strong { color: #e8eaf0; }
    .btn { display: inline-block; margin-top: 24px; padding: 12px 28px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.06); color: rgba(200,202,216,0.5); font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 JobLedger</h1>
      <p>${title}</p>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">© ${new Date().getFullYear()} JobLedger · You're receiving this because you're registered on JobLedger.</div>
  </div>
</body>
</html>
`;

// ─── 1. Application Status Change Email ─────────────────────────────────────
export const sendStatusChangeEmail = async (to, jobTitle, company, newStatus) => {
  if (!process.env.SMTP_USER) {
    console.warn("[EmailService] SMTP_USER not configured — skipping status change email");
    return;
  }
  try {
    const transporter = createTransporter();
    const badgeClass = `badge--${newStatus}`;
    const bodyHtml = `
      <p>Hi there,</p>
      <p>There's an update on one of your job applications:</p>
      <div class="card">
        <p><strong>Position:</strong> ${jobTitle}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>New Status:</strong> <span class="badge ${badgeClass}">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
      </div>
      <p>Log in to your dashboard to view more details and take next steps.</p>
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/jobs" class="btn">View Application →</a>
    `;
    await transporter.sendMail({
      from: `"JobLedger" <${process.env.SMTP_USER}>`,
      to,
      subject: `Application Update: ${jobTitle} at ${company} — ${newStatus}`,
      html: emailWrapper("Application Status Update", bodyHtml),
    });
    console.log(`[EmailService] Status change email sent to ${to}`);
  } catch (error) {
    console.error("[EmailService] Failed to send status change email:", error.message);
  }
};

// ─── 2. New Matching Job Alert Email ────────────────────────────────────────
export const sendJobAlertEmail = async (to, jobs) => {
  if (!process.env.SMTP_USER) {
    console.warn("[EmailService] SMTP_USER not configured — skipping job alert email");
    return;
  }
  try {
    const transporter = createTransporter();
    const jobCards = jobs
      .map(
        (job) => `
      <div class="card">
        <p><strong>${job.position}</strong></p>
        <p>🏢 ${job.company} &nbsp;|&nbsp; 📍 ${job.workLocation} &nbsp;|&nbsp; 🕐 ${job.workType}</p>
      </div>`
      )
      .join("");
    const bodyHtml = `
      <p>Hi there,</p>
      <p>We found <strong>${jobs.length} new job${jobs.length > 1 ? "s" : ""}</strong> matching your skills and preferences:</p>
      ${jobCards}
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/jobs" class="btn">Browse All Jobs →</a>
    `;
    await transporter.sendMail({
      from: `"JobLedger" <${process.env.SMTP_USER}>`,
      to,
      subject: `🔔 ${jobs.length} New Job${jobs.length > 1 ? "s" : ""} Matching Your Profile`,
      html: emailWrapper("New Job Alerts", bodyHtml),
    });
    console.log(`[EmailService] Job alert email sent to ${to}`);
  } catch (error) {
    console.error("[EmailService] Failed to send job alert email:", error.message);
  }
};

// ─── 3. Interview Reminder Email ─────────────────────────────────────────────
export const sendInterviewReminderEmail = async (to, interview) => {
  if (!process.env.SMTP_USER) {
    console.warn("[EmailService] SMTP_USER not configured — skipping interview reminder email");
    return;
  }
  try {
    const transporter = createTransporter();
    const dateObj = new Date(interview.dateTime);
    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const bodyHtml = `
      <p>Hi there,</p>
      <p>⏰ Reminder: You have an interview scheduled soon!</p>
      <div class="card">
        <p><strong>📅 Date:</strong> ${formattedDate}</p>
        <p><strong>🕐 Time:</strong> ${formattedTime}</p>
        ${interview.notes ? `<p><strong>📝 Notes:</strong> ${interview.notes}</p>` : ""}
      </div>
      <p>Good luck! Prepare well and you've got this. 💪</p>
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard" class="btn">View Dashboard →</a>
    `;
    await transporter.sendMail({
      from: `"JobLedger" <${process.env.SMTP_USER}>`,
      to,
      subject: `⏰ Interview Reminder — Tomorrow at ${formattedTime}`,
      html: emailWrapper("Interview Reminder", bodyHtml),
    });
    console.log(`[EmailService] Interview reminder email sent to ${to}`);
  } catch (error) {
    console.error("[EmailService] Failed to send interview reminder email:", error.message);
  }
};
