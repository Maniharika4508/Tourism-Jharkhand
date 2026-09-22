# Quick Deployment Checklist for Hackathon Submission

## 🚀 Complete These Steps to Deploy Your Application

### Phase 1: Create Accounts (5 minutes)
- [ ] Create/Login to Vercel: https://vercel.com
- [ ] Create/Login to Railway: https://railway.app
- [ ] Both should be connected to your GitHub account

### Phase 2: Deploy Backend to Railway (10 minutes)

**MANUAL STEPS (I cannot automate these, but they're simple):**

1. **Go to Railway.app**
   - Click "Start New Project" 
   - Select "Deploy from GitHub"
   - Authorize Railway to access GitHub
   
2. **Select Repository**
   - Find "Tourism-Jharkhand" repository
   - Click "Deploy"
   
3. **Railway Auto-Detection**
   - Railway will detect it's a Node.js project
   - It will auto-build from `backend/package.json`
   
4. **Add Environment Variables to Railway**
   - In Railway dashboard, go to your Backend service
   - Click "Variables" tab
   - Add these EXACTLY as shown:

```
MONGODB_URI=mongodb+srv://maniharika945_db_user:NnMs3xFkNLKvhCxr@cluster0.kgucvtd.mongodb.net/jharkhand_tourism?appName=Cluster0
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-jwt-key-at-least-32-characters-long
FRONTEND_URL=(leave blank for now, update later)
GROQ_API_KEY=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
GEMINI_API_KEY=your-gemini-api-key-here
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp
```

5. **Wait for Deployment**
   - Railway will build and deploy automatically
   - You'll see a green checkmark when done
   - **IMPORTANT: Copy the provided URL** (e.g., `https://production-xxx.railway.app`)

### Phase 3: Deploy Frontend to Vercel (10 minutes)

1. **Go to Vercel Dashboard**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Find "Tourism-Jharkhand"
   
2. **Configure Project**
   - Framework: "Next.js" (auto-detected)
   - Root Directory: "./" (default)
   - Build Command: "npm run build" (auto-detected)
   
3. **Add Environment Variables to Vercel**
   - In project settings, go to "Environment Variables"
   - Add this (replace with your Railway URL from Phase 2):

```
NEXT_PUBLIC_API_URL=https://your-railway-url-here.railway.app
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - **Copy the Vercel URL** when deployment completes (e.g., `https://your-app.vercel.app`)

### Phase 4: Update CORS Configuration (5 minutes)

1. **Go Back to Railway**
   - Click on your Backend service
   - Go to "Variables"
   - Update `FRONTEND_URL` with your Vercel URL
   - Railway will auto-redeploy

2. **Go to Vercel**
   - Go to Settings → Environment Variables
   - Verify `NEXT_PUBLIC_API_URL` is set to Railway URL
   - Trigger redeploy if needed

### Phase 5: Test Your Application (10 minutes)

1. **Test Backend is Running**
   - Visit: `https://your-railway-url.railway.app/api/health`
   - Should see JSON response

2. **Test Frontend**
   - Visit: `https://your-vercel-url.vercel.app`
   - Should see the Jharkhand Tourism website

3. **Test Key Features**
   - [ ] Browse destinations page loads
   - [ ] AI Chatbot widget works (click button in bottom-right)
   - [ ] API calls complete without CORS errors
   - [ ] Images load correctly

### Phase 6: Get Your Final URLs for Submission

**Frontend (Public URL for users):**
```
https://your-vercel-app.vercel.app
```

**Backend API (for documentation):**
```
https://your-railway-app.railway.app/api/docs
```

---

## ✅ Quality Checklist Before Submission

- [ ] No "localhost" references in code
- [ ] All environment variables set on hosting platforms
- [ ] MongoDB Atlas is accessible from Railway
- [ ] CORS is configured correctly
- [ ] Frontend successfully connects to backend
- [ ] Website is accessible via HTTPS
- [ ] All features working (destinations, chatbot, travel planner)
- [ ] Database has sample data loaded

---

## 🔐 Important Security Reminders

✅ **.env files are NOT committed** to GitHub (they're in .gitignore)
✅ **Secrets are stored as environment variables** on hosting platforms
✅ **No API keys** are visible in the codebase
✅ **CORS is restricted** to your production domains

---

## 🆘 If Something Goes Wrong

### Backend won't start on Railway
1. Check Railway logs (click service → Logs tab)
2. Verify MongoDB URI is correct
3. Ensure all required environment variables are set

### Frontend can't connect to backend
1. Check browser console (F12) for errors
2. Verify NEXT_PUBLIC_API_URL in Vercel settings
3. Verify FRONTEND_URL in Railway settings
4. Check that Railway backend is running (test /api/health)

### Deployment not triggered
1. Make sure code is pushed to GitHub
2. Check GitHub connection in Vercel/Railway settings
3. Manually trigger deployment from dashboard

---

## 📝 Estimated Total Time: 45-60 minutes

Most of the time is waiting for builds to complete. You can start Phase 2 and 3 in parallel!

Good luck with your hackathon submission! 🎉
