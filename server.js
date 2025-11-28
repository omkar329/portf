require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Read SMTP config from environment
const SMTP_USER = process.env.EMAIL_USER || '';
const SMTP_PASS = process.env.EMAIL_PASS || '';
const SMTP_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465;
const SMTP_SECURE = process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : true;
const EMAIL_RECEIVER = process.env.EMAIL_RECEIVER || SMTP_USER; // where incoming messages are sent

if (!SMTP_USER || !SMTP_PASS) {
  console.warn('Warning: EMAIL_USER or EMAIL_PASS not set in .env — /api/contact will fail until configured.');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

transporter.verify((err, success) => {
  if (err) console.error('Email transporter verify failed:', err.message || err);
  else console.log('Email transporter is ready');
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields (name, email, message)' });
  }

  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ success: false, error: 'SMTP credentials not configured on server' });
  }

  const mailOptions = {
    from: `${name} <${SMTP_USER}>`,
    to: EMAIL_RECEIVER,
    subject: subject || `Portfolio contact from ${name}`,
    replyTo: email,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to send email:', err);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
