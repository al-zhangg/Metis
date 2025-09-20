# 🏛️ Metis - Greek Mythology Habit Tracker

A beautiful habit tracking application inspired by Greek mythology, built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

Since Git is not available in the WebContainer environment, here's how to get your code to GitHub:

### Method 1: Download and Upload (Recommended)

1. **Download your project files:**
   - Use the file explorer in Bolt to download individual files
   - Or use the browser's download functionality

2. **Create a new GitHub repository:**
   - Go to https://github.com/new
   - Name it `metis` or your preferred name
   - Initialize with README (optional)

3. **Upload files to GitHub:**
   - Use GitHub's web interface to upload files
   - Or clone the repo locally and copy files

### Method 2: Copy-Paste Method

1. **Create a new GitHub repository**
2. **Copy file contents** from Bolt's file explorer
3. **Create files manually** in GitHub's web interface
4. **Paste the contents** into each file

## 📁 Important Files to Copy

Make sure to copy these key files:
- `src/` folder (entire directory)
- `package.json`
- `vite.config.ts`
- `tailwind.config.js`
- `tsconfig.json`
- `index.html`
- `.env.example` (rename to `.env` and add your credentials)

## 🔧 Environment Setup

After copying to GitHub, create a `.env` file with:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your_auth0_domain_here
VITE_AUTH0_CLIENT_ID=your_auth0_client_id_here

# For GitHub Codespaces, add these URL patterns to Auth0:
# Callback URLs: https://*.github.dev, https://*.app.github.dev
# Web Origins: https://*.github.dev, https://*.app.github.dev
# Logout URLs: https://*.github.dev, https://*.app.github.dev

# Supabase Configuration (Optional)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI Service Configuration (Optional)
VITE_AI_API_URL=https://cloud.cerebras.ai/platform/org_k4n5ke4tjdk9xrdvrf8x88yc/apikeys
VITE_AI_API_KEY=csk-kth6t92kwdpwvphtv35yvprp3hf3hxne4m3869drc2mtpe8r
```

## 🚀 GitHub Codespaces Setup

If you're using GitHub Codespaces:

1. **Get your Codespace URL** - it will look like `https://username-reponame-randomid.github.dev`
2. **Configure Auth0**:
   - Go to [Auth0 Dashboard](https://manage.auth0.com/dashboard)
   - Select your application → Settings
   - Add these to **Allowed Callback URLs**:
     ```
     https://*.github.dev,https://*.app.github.dev,http://localhost:3000
     ```
   - Add these to **Allowed Web Origins**:
     ```
     https://*.github.dev,https://*.app.github.dev,http://localhost:3000
     ```
   - Add these to **Allowed Logout URLs**:
     ```
     https://*.github.dev,https://*.app.github.dev,http://localhost:3000
     ```
   - Save changes
3. **Create `.env` file** in your Codespace with your Auth0 credentials
4. **Restart the dev server**: `npm run dev`

## 🌐 GitHub Pages Deployment

1. **Enable GitHub Pages** in your repository settings
2. **Set source** to "GitHub Actions"
3. **The workflow** will automatically deploy your app

## ✨ Features

- 🏛️ Greek mythology-themed design
- 📊 Habit tracking with streaks and XP
- 🔮 AI-powered journal insights
- 🏆 Achievement system
- 📱 Responsive design
- 🔐 Auth0 authentication
- 🗄️ Supabase database integration

## 🛠️ Local Development

```bash
npm install
npm run dev
```

## 📝 Notes

- The app works with mock data if Supabase is not configured
- Auth0 is required for authentication features
- AI features have fallback responses if not configured