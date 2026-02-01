import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

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

app.post("/api/contact", async (req, res) => {
  const { name, email, project, message } = req.body || {};

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
    <p>${message.replace(/\n/g, "<br />")}</p>
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

    return res.json({ ok: true });
  } catch (error) {
    console.error("Email send failed", error);
    return res.status(500).json({ ok: false, error: "Email send failed." });
  }
});


app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
