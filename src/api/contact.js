import nodemailer from "nodemailer";

const {
  NOTIFICATION_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  SMTP_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT ? Number(SMTP_PORT) : 587,
  secure: SMTP_SECURE === "true",
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  let body = req.body;
  if (typeof body === "string" && body) {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON body." });
    }
  }
  const { name, email, project, message } = body || {};

  if (!name || !email || !project || !message) {
    return res.status(400).json({ ok: false, error: "Missing required fields." });
  }

  if (!NOTIFICATION_EMAIL) {
    return res.status(500).json({ ok: false, error: "NOTIFICATION_EMAIL not set." });
  }

  const subject = `New Brayden's Blueprint Inquiry — ${name}`;
  const text = `New inquiry received\n\nName: ${name}\nEmail: ${email}\nProject Type: ${project}\n\nMessage:\n${message}\n`;
  const html = `
    <h2>New inquiry received</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Project Type:</strong> ${project}</p>
    <p><strong>Message:</strong></p>
    <p>${(message || "").replace(/\n/g, "<br />")}</p>
  `;

  try {
    await transporter.sendMail({
      to: NOTIFICATION_EMAIL,
      from: SMTP_FROM || SMTP_USER || NOTIFICATION_EMAIL,
      replyTo: email,
      subject,
      text,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Email send failed", error);
    return res.status(500).json({ ok: false, error: "Email send failed." });
  }
}
