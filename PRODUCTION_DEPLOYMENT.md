# Production Deployment Guide

## Overview
Your portfolio website has a Node.js backend with email functionality. This guide covers deploying to common hosting platforms.

---

## Environment Variables Required

Create these environment variables on your hosting platform (NOT in `.env` file):

```
EMAIL_USER=okaunsalye@gmail.com
EMAIL_PASS=nknjwmabczgipyky
EMAIL_RECEIVER=okaunsalye@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_FROM_NAME=Portfolio Contact
NODE_ENV=production
```

---

## Platform-Specific Setup

### 1️⃣ **Render** (Recommended - Free Tier Available)

**Steps:**
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repository
4. Configuration:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add environment variables:
   - Go to Settings → Environment
   - Add all variables from "Environment Variables Required" section above
6. Deploy

**Free tier includes:**
- 750 free compute hours/month
- Auto-rebuild on push
- Free SSL/HTTPS

---

### 2️⃣ **Heroku** (Credit Card Required)

**Steps:**
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```powershell
   heroku config:set EMAIL_USER=okaunsalye@gmail.com
   heroku config:set EMAIL_PASS=nknjwmabczgipyky
   heroku config:set EMAIL_RECEIVER=okaunsalye@gmail.com
   # ... set all variables
   ```
5. Deploy:
   ```powershell
   git push heroku main  # or master if using master branch
   ```

---

### 3️⃣ **Railway.app** (GitHub Integration)

**Steps:**
1. Go to [railway.app](https://railway.app) → Create New Project
2. Select "Deploy from GitHub repo"
3. Connect and select your repository
4. Add environment variables in dashboard under Variables
5. Railway auto-detects and deploys Node.js projects

---

### 4️⃣ **Replit** (Free, Quick Testing)

**Steps:**
1. Go to [replit.com](https://replit.com) → Import from GitHub
2. Select your repository
3. Add secrets (environment variables):
   - Click "Secrets" (lock icon)
   - Add EMAIL_USER, EMAIL_PASS, etc.
4. Click "Run"

---

## Gmail App Password Setup

### ⚠️ Important: Your Password Must Be a Gmail App Password

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. In Security settings, find **App passwords** (below 2-Step Verification)
4. Select: App = Mail, Device = Windows Computer
5. Google will generate a **16-character password**
6. Copy this password and use as `EMAIL_PASS`

**Why:** Gmail blocks regular passwords from SMTP. Only app passwords work.

---

## Troubleshooting

### ❌ "Email authentication failed" (EAUTH)
- Check EMAIL_USER and EMAIL_PASS are correct
- Verify Gmail account has 2FA enabled
- Regenerate app password and update it
- Ensure no extra spaces in credentials

### ❌ "Cannot connect to SMTP" (ECONNREFUSED)
- Your hosting provider may block outbound SMTP
- Try **Alternative: SendGrid** (see below)

### ❌ "Connection timeout" (ETIMEDOUT)
- Firewall blocking port 465
- Ask hosting provider about SMTP restrictions
- Try port 587 with TLS instead (modify EMAIL_PORT=587, add EMAIL_TLS=true)

### ✅ Test Your Configuration
After deploying, visit:
```
https://your-domain.com/api/health
```
Should return: `{"ok":true,"emailConfigured":true}`

For detailed debugging (localhost only):
```
https://your-domain.com/api/debug/email-config
```

---

## Alternative Email Services

If Gmail SMTP doesn't work on your hosting platform:

### **SendGrid** (Free tier: 100 emails/day)
```javascript
// Install: npm install nodemailer-sendgrid-transport
const transport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
  transport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);
```

### **Mailgun** (Free tier included)
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 465,
  secure: true,
  auth: {
    user: 'postmaster@your-domain.com',
    pass: process.env.MAILGUN_PASSWORD
  }
});
```

### **AWS SES** (Free tier: 62,000 emails/month)
Requires AWS account setup. See AWS documentation for configuration.

---

## Production Best Practices

### ✅ Implemented in Updated server.js
- ✅ Environment variable validation
- ✅ Detailed error logging (without exposing secrets)
- ✅ Connection pooling for reliability
- ✅ Transporter verification
- ✅ HTML email format
- ✅ Security: HTML escaping in emails
- ✅ Debug endpoint (localhost only)
- ✅ Graceful error messages to frontend

### 📝 TODO for Full Production
1. Add request logging middleware (Morgan)
2. Add rate limiting to /api/contact
3. Add CAPTCHA to contact form (prevent spam bots)
4. Monitor email delivery (SendGrid webhooks)
5. Set up error tracking (Sentry)
6. Add authentication for debug endpoints

---

## Quick Deployment Checklist

- [ ] Have GitHub account and pushed code
- [ ] Gmail 2FA enabled with App Password generated
- [ ] Chosen hosting platform (Render recommended)
- [ ] Created account on hosting platform
- [ ] Connected GitHub repository
- [ ] Set all environment variables
- [ ] Deployed successfully
- [ ] Tested `/api/health` endpoint
- [ ] Tested contact form submission
- [ ] Received test email in inbox

---

## Support

If emails still don't send after setup:
1. Check server logs on hosting platform
2. Visit `/api/debug/email-config` (if localhost)
3. Verify environment variables match exactly
4. Check Gmail account hasn't marked emails as spam
5. Try test email via `curl`:
   ```powershell
   $body = @{
       name = "Test"
       email = "test@example.com"
       subject = "Test"
       message = "Test message"
   } | ConvertTo-Json
   
   Invoke-WebRequest -Uri "https://your-domain.com/api/contact" `
     -Method POST `
     -ContentType "application/json" `
     -Body $body
   ```

