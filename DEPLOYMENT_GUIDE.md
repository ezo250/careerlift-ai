# Kepler CareerLift - Deployment Guide

## Overview
This guide will help you deploy the Kepler CareerLift application to production.

## Prerequisites
- Node.js v20 or higher
- MongoDB Atlas account (or MongoDB server)
- Render account (for backend)
- Vercel account (for frontend)
- Gmail account with App Password (for emails)

## Backend Deployment (Render)

### 1. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `https://github.com/ezo250/careerlift-ai.git`
4. Configure the service:
   - **Name**: `careerlift-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or higher for production)

### 2. Set Environment Variables on Render

In the Render dashboard, add these environment variables:

```
MONGODB_URI=mongodb+srv://humbertjames17_db_user:rFgWwCGDycHbcFaD@cluster0.zd1yx51.mongodb.net/careerlift?retryWrites=true&w=majority
JWT_SECRET=kepler_careerlift_secret_key_2025_secure
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://careerlift-ai.vercel.app

# SMTP Configuration for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=Kepler CareerLift <no-reply@kepler-careerlift.com>
```

### 3. Generate Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification (enable if not enabled)
3. Scroll down to "App passwords"
4. Create a new app password for "Mail"
5. Copy the 16-character password
6. Use this password in `SMTP_PASS` environment variable

### 4. Deploy

- Click "Create Web Service"
- Wait for the build to complete
- Note your backend URL (e.g., `https://careerlift-backend.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Update Environment Variable

Update `.env` file with your Render backend URL:

```
VITE_API_URL=https://careerlift-backend.onrender.com/api
```

Commit this change to your repository.

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://careerlift-backend.onrender.com/api`
6. Click "Deploy"

### 3. Update Backend FRONTEND_URL

After Vercel deployment, go back to Render:
1. Update `FRONTEND_URL` environment variable with your Vercel URL
2. Redeploy the service

## Post-Deployment

### 1. Test the Application

1. Visit your Vercel URL
2. Try logging in with the super admin credentials:
   - Email: `amanialaindrin7@gmail.com`
   - Password: `123`

### 2. Test Email Functionality

1. Go to Teachers page
2. Send a test invite to your email
3. Verify the email is received

### 3. Create Initial Data

1. Create sections (e.g., KC 2026, BA 2025)
2. Create checklists for grading
3. Create job opportunities
4. Invite teachers

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Emails not sending
- Verify Gmail App Password is correct
- Check SMTP settings match Gmail requirements
- Check Render logs for email-related errors
- Ensure 2-Step Verification is enabled on Gmail

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend is running (check Render status)

### AI Grading not working
- Verify Puter.js script is loaded (check browser console)
- Ensure `window.puter` is available
- Check browser console for errors

## Monitoring

- **Render**: Monitor logs and metrics in Render dashboard
- **Vercel**: Check deployment logs and analytics
- **MongoDB**: Monitor database usage in Atlas

## Scaling

For production use:
1. Upgrade Render instance type
2. Enable auto-scaling on Vercel
3. Set up proper database indexes
4. Consider using a CDN for static assets
5. Implement proper error tracking (e.g., Sentry)

## Support

For issues, check:
- Backend logs on Render
- Frontend logs in browser console
- MongoDB logs in Atlas

---

**Important Notes:**
- Never commit real credentials to git
- Use environment variables for all secrets
- Regularly backup your MongoDB database
- Monitor email sending limits (Gmail has daily limits)
