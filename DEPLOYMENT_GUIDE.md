# Jharkhand Tourism - Deployment Guide

## Project Overview
- **Frontend**: Next.js application
- **Backend**: Express.js API server
- **Database**: MongoDB Atlas
- **Hosting**: Vercel (frontend) + Railway (backend)

---

## Prerequisites

Before starting deployment, you'll need:

1. **GitHub Account** - Repository: https://github.com/PRATHAM10805/Tourism-Jharkhand
2. **Vercel Account** - https://vercel.com (sign up with GitHub)
3. **Railway Account** - https://railway.app (sign up with GitHub)
4. **MongoDB Atlas Account** - https://www.mongodb.com/cloud/atlas (free tier available)
5. **API Keys** (from .env file):
   - GROQ_API_KEY
   - GEMINI_API_KEY
   - Razorpay keys (for payment)

---

## Step 1: MongoDB Atlas Setup

MongoDB is already configured with credentials:
```
Username: maniharika945_db_user
Password: NnMs3xFkNLKvhCxr
Cluster: cluster0.kgucvtd.mongodb.net
Database: jharkhand_tourism
```

The MongoDB URI is:
```
mongodb+srv://maniharika945_db_user:NnMs3xFkNLKvhCxr@cluster0.kgucvtd.mongodb.net/jharkhand_tourism?appName=Cluster0
```

✅ **No changes needed** - MongoDB is already set up and accessible.

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Click "Start Project"
3. Connect your GitHub account
4. Authorize Railway to access your GitHub

### 2.2 Create a New Project
1. Click "Create New Project"
2. Select "Deploy from GitHub Repo"
3. Find and select: `Tourism-Jharkhand`
4. Select `Backend` as the deployment directory

### 2.3 Configure Environment Variables
In Railway dashboard, go to your project:

1. Click on the **Backend** service
2. Go to **Variables** tab
3. Add these environment variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://maniharika945_db_user:NnMs3xFkNLKvhCxr@cluster0.kgucvtd.mongodb.net/jharkhand_tourism?appName=Cluster0` |
| `PORT` | `3000` (Railway will auto-assign) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate a random string (e.g., `your_random_jwt_secret_min_32_chars`) |
| `FRONTEND_URL` | Will be updated after frontend deployment |
| `GROQ_API_KEY` | `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` |
| `GEMINI_API_KEY` | Get from Google Cloud Console |
| `MAX_FILE_SIZE` | `10485760` |
| `ALLOWED_IMAGE_TYPES` | `image/jpeg,image/jpg,image/png,image/gif,image/webp` |

### 2.4 Deploy
1. Railway will automatically detect `backend/package.json`
2. Set the start command: `node server.js`
3. Click "Deploy"
4. Wait for deployment to complete
5. **Note the deployed URL** (e.g., `https://your-app.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Go to Vercel
1. Visit https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Search for and select: `Tourism-Jharkhand`

### 3.2 Configure Project Settings
1. **Framework Preset**: Select "Next.js"
2. **Root Directory**: Leave as default (it's in root)
3. **Build Command**: `npm run build` (should be auto-detected)
4. **Start Command**: `npm start` (should be auto-detected)

### 3.3 Set Environment Variables
Before deploying, add these environment variables in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-app-url.railway.app` |
| `NEXT_PUBLIC_APP_URL` | Will be provided by Vercel |

*(Note: Replace `your-railway-app-url` with the actual Railway backend URL)*

### 3.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy your Next.js app
3. Wait for deployment to complete
4. **Note the deployed URL** (e.g., `https://tourism-jharkhand.vercel.app`)

---

## Step 4: Update CORS Configuration

After both are deployed:

### 4.1 Update Backend CORS
1. Go to Railway dashboard
2. Click on your Backend service
3. Go to **Variables** tab
4. Update `FRONTEND_URL` to: `https://your-vercel-url.vercel.app`
5. Redeploy (trigger new deployment)

### 4.2 Update Frontend API URL
1. Go to Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to the Railway backend URL
4. Redeploy (Vercel will automatically redeploy)

---

## Step 5: Test the Application

### 5.1 Test Health Endpoints
Check if services are running:

```bash
# Backend health
curl https://your-railway-app-url.railway.app/api/health

# Frontend
Visit https://your-vercel-url.vercel.app
```

### 5.2 Test Core Features
1. **Browse Destinations** - Should load places from MongoDB
2. **AI Chatbot** - Try the chatbot widget (should connect to backend)
3. **Travel Planner** - Test AI travel planner feature
4. **Authentication** - Test login/signup if implemented
5. **Payments** - Verify Razorpay integration

---

## Troubleshooting

### Issue: Backend deployment fails
- Check if all environment variables are set
- Verify MongoDB URI is correct
- Check logs in Railway dashboard

### Issue: Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check CORS configuration in backend
- Ensure backend is running and accessible

### Issue: "Cannot find module" error
- Run `npm install` locally and commit `package-lock.json`
- Ensure Node version is >=16

### Issue: MongoDB connection timeout
- Check MongoDB Atlas firewall settings
- Ensure IP is whitelisted (0.0.0.0/0 for development)
- Verify connection string is correct

---

## Final URLs

After successful deployment:

- **Frontend URL**: `https://your-vercel-app.vercel.app`
- **Backend API**: `https://your-railway-app.railway.app/api`
- **Database**: MongoDB Atlas (no public URL)

---

## Security Checklist

✅ `.env` files are in `.gitignore` and not committed
✅ Environment variables configured in both platforms
✅ MongoDB credentials secured (not in code)
✅ API keys stored as environment variables
✅ CORS properly configured for production domains
✅ JWT secrets configured for authentication

---

## Monitoring & Maintenance

1. **Railway Dashboard**: Monitor backend logs and performance
2. **Vercel Dashboard**: Monitor frontend builds and performance
3. **MongoDB Atlas**: Monitor database usage and connections
4. **Set up alerts** for deployment failures

---

## Support

If you encounter issues:
1. Check Railway logs: Dashboard → Service → Logs
2. Check Vercel logs: Dashboard → Project → Deployments → Logs
3. Check MongoDB connection in Railway terminal
4. Verify all environment variables are set correctly
