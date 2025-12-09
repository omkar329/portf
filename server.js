require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (frontend) from project root
app.use(express.static(path.join(__dirname)));

// ============================================
// PRODUCTION-READY EMAIL CONFIGURATION
// ============================================

// Read SMTP config from environment variables
const SMTP_USER = process.env.EMAIL_USER || '';
const SMTP_PASS = process.env.EMAIL_PASS || '';
const SMTP_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465;
const SMTP_SECURE = process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : true;
const EMAIL_RECEIVER = process.env.EMAIL_RECEIVER || SMTP_USER;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Portfolio Contact';

// Debug: Log environment variable presence (NOT VALUES for security)
console.log('\n=== EMAIL CONFIGURATION DEBUG ===');
console.log(`EMAIL_USER present: ${!!SMTP_USER}`);
console.log(`EMAIL_PASS present: ${!!SMTP_PASS}`);
console.log(`SMTP_HOST: ${SMTP_HOST}`);
console.log(`SMTP_PORT: ${SMTP_PORT}`);
console.log(`SMTP_SECURE: ${SMTP_SECURE}`);
console.log(`EMAIL_RECEIVER: ${EMAIL_RECEIVER}`);
console.log('===================================\n');

// Create transporter with better error handling
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    // Add connection timeout for production
    connectionTimeout: 5000,
    socketTimeout: 5000,
    // Add pool for better performance
    pool: {
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 10
    }
  });

  // Verify transporter with enhanced error logging
  transporter.verify(async (err, success) => {
    if (err) {
      console.error('❌ Email transporter verification FAILED:');
      console.error(`   Error: ${err.message || err}`);
      console.error(`   Code: ${err.code}`);
      
      // Common fixes for production
      if (err.code === 'EAUTH') {
        console.error('   → Solution: Check EMAIL_USER and EMAIL_PASS. For Gmail, use App Password, not regular password.');
      } else if (err.code === 'ECONNREFUSED') {
        console.error(`   → Solution: Cannot connect to ${SMTP_HOST}:${SMTP_PORT}. Check firewall/hosting provider restrictions.`);
      } else if (err.code === 'ETIMEDOUT') {
        console.error('   → Solution: Connection timeout. Network/firewall may be blocking SMTP port.');
      }
    } else {
      console.log('✅ Email transporter is ready and verified');
    }
  });
} catch (error) {
  console.error('❌ Failed to create email transporter:', error.message);
  transporter = null;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true,
    emailConfigured: !!(SMTP_USER && SMTP_PASS)
  });
});

// Contact endpoint with comprehensive error handling
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  
  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields (name, email, message)' 
    });
  }

  // Check if SMTP is configured
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('❌ /api/contact called but SMTP credentials not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'Email service not configured on server. Contact administrator.' 
    });
  }

  // Check if transporter exists
  if (!transporter) {
    console.error('❌ /api/contact called but email transporter failed to initialize');
    return res.status(500).json({ 
      success: false, 
      error: 'Email service initialization failed. Contact administrator.' 
    });
  }

  const mailOptions = {
    from: `${EMAIL_FROM_NAME} <${SMTP_USER}>`,
    to: EMAIL_RECEIVER,
    subject: subject || `Portfolio contact from ${name}`,
    replyTo: email,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New Portfolio Contact</h3>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Subject:</strong> ${escapeHtml(subject || 'N/A')}</p>
      <p><strong>Message:</strong></p>
      <pre>${escapeHtml(message)}</pre>
    `
  };

  try {
    console.log(`📧 Attempting to send email to ${EMAIL_RECEIVER}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return res.json({ 
      success: true,
      messageId: info.messageId
    });
  } catch (err) {
    console.error('❌ Failed to send email:');
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    
    // Provide specific error guidance
    let userMessage = 'Failed to send email. Please try again later.';
    
    if (err.code === 'EAUTH') {
      userMessage = 'Email authentication failed. Server configuration issue.';
      console.error('   → Solution: Verify EMAIL_USER and EMAIL_PASS are correct.');
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      userMessage = 'Email service temporarily unavailable. Please try again.';
      console.error('   → Solution: Check SMTP server connectivity and firewall rules.');
    }
    
    return res.status(500).json({ 
      success: false, 
      error: userMessage 
    });
  }
});

// Debug endpoint to check configuration (remove in production)
app.get('/api/debug/email-config', (req, res) => {
  // Only allow from localhost in production
  const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('localhost');
  
  if (process.env.NODE_ENV === 'production' && !isLocalhost) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  res.json({
    emailConfigured: !!(SMTP_USER && SMTP_PASS),
    smtpHost: SMTP_HOST,
    smtpPort: SMTP_PORT,
    smtpSecure: SMTP_SECURE,
    emailReceiver: EMAIL_RECEIVER,
    emailFromName: EMAIL_FROM_NAME,
    nodeEnv: process.env.NODE_ENV || 'development',
    hasTransporter: !!transporter
  });
});

// Helper function to escape HTML for safety
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
