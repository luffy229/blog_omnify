# Deployment Checklist for Blog Application

This checklist will guide you through deploying your MERN Blog application on Vercel.

## Pre-Deployment Checks

1. ✅ **Project structure is correct**:
   - Client code is in `/client` directory
   - Server code is in `/server` directory

2. ✅ **Configuration files are present**:
   - `vercel.json` is configured correctly
   - `package.json` has proper build commands
   - `.gitignore` excludes sensitive files

3. ✅ **API URLs are configured**:
   - All contexts use `process.env.REACT_APP_API_URL || '/api'`
   - Client has `.env.local` with `REACT_APP_API_URL=/api`

4. ✅ **Environment variables prepared**:
   - You have your MongoDB connection string
   - You have your JWT secret

## Vercel Deployment Steps

1. **Create Vercel Account**:
   - Sign up at [vercel.com](https://vercel.com) if you don't have an account

2. **Connect Your GitHub Repository**:
   - Go to your Vercel dashboard
   - Click "Import Project"
   - Choose "Import Git Repository"
   - Select your blog application repository

3. **Configure Project Settings**:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: client/build

4. **Add Environment Variables**:
   - MONGODB_URI: Your MongoDB connection string
   - JWT_SECRET: Your JWT secret key

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build and deployment to complete

## Post-Deployment Checks

1. **Verify Frontend**:
   - Homepage loads correctly
   - Navigation works
   - Styling is applied

2. **Test Authentication**:
   - Register a new user
   - Login with existing credentials
   - Update profile

3. **Test Blog Features**:
   - Create a new blog
   - View blogs list
   - View single blog
   - Like and comment
   - Receive notifications

## Troubleshooting

If you encounter issues during deployment:

1. **Check Build Logs**:
   - Review Vercel build logs for errors

2. **Environment Variables**:
   - Verify all environment variables are set correctly

3. **API Requests**:
   - Use browser DevTools to check for API request errors
   - Ensure the API paths match between client and server

4. **MongoDB Connection**:
   - Ensure your MongoDB cluster is accessible from Vercel's IP addresses
   - Check that your MongoDB user has correct permissions

5. **Client-Side Routing**:
   - If you get 404 errors on refresh, ensure your `vercel.json` routes are correctly set up 