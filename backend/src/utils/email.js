const nodemailer = require("nodemailer");

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // In dev without SMTP creds, use Ethereal (fake SMTP)
  if (!process.env.SMTP_USER) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("📧  Ethereal SMTP active – preview at https://ethereal.email");
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const t    = await getTransporter();
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || "DevLens <noreply@devlens.io>",
    to, subject, html, text,
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("📧  Email preview:", nodemailer.getTestMessageUrl(info));
  }
  return info;
}

module.exports = { sendEmail };
