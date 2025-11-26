# 🚀 Quick Start - Deploy in 5 Minutes!

## Step 1: Generate Icons (1 minute)

1. Open `generate-icons.html` in your browser
2. Click "Download 192x192" → save as `icon-192.png`
3. Click "Download 512x512" → save as `icon-512.png`
4. Put both icons in the same folder as `index.html`

## Step 2: Deploy to GitHub Pages (3 minutes)

### Option A: Using GitHub Website (No coding!)

1. Go to https://github.com and sign in (or create account)
2. Click the "+" icon → "New repository"
3. Name it: `pub-crawler`
4. Make it Public
5. Click "Create repository"
6. Click "uploading an existing file"
7. Drag and drop ALL files:
   - index.html
   - manifest.json
   - service-worker.js
   - icon-192.png
   - icon-512.png
8. Click "Commit changes"
9. Go to Settings → Pages
10. Under "Source" select "main" branch
11. Click "Save"
12. Wait 1-2 minutes
13. Visit: `https://YOUR-USERNAME.github.io/pub-crawler`

### Option B: Using Command Line

```bash
# Navigate to the folder with your files
cd /path/to/your/files

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/pub-crawler.git
git branch -M main
git push -u origin main

# Enable Pages: Settings → Pages → Source: main branch → Save
```

## Step 3: Install on Your Phone (1 minute)

### Android
1. Open the GitHub Pages URL in Chrome
2. Tap "Install App" button at bottom
3. Tap "Install" in popup
4. Done! App is on your home screen

### iOS
1. Open the GitHub Pages URL in Safari
2. Tap Share button (⎙) at bottom
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. Done! App is on your home screen

## 🎉 That's It!

Your app is now:
- ✅ Live on the internet
- ✅ Installable on any device
- ✅ Works like a native app

## Next Steps

1. **Add Your API Key**
   - Open the installed app
   - Enter your Google Maps API Key
   - Click "Connect"

2. **Get a Google Maps API Key** (if you don't have one)
   - Go to https://console.cloud.google.com
   - Create a project
   - Enable APIs: Places (New), Maps JavaScript, Geocoding, Directions
   - Create API key
   - Copy and paste into app

3. **Start Planning Pub Crawls!**
   - Choose your location
   - Select venue type (Historic, Sports Bar, etc.)
   - Set your preferences
   - Click "Search"
   - Get your optimized route!

## 🆘 Problems?

**Install button doesn't appear?**
- Make sure you're using HTTPS URL from GitHub Pages
- Try Chrome on Android or Safari on iOS

**App doesn't work?**
- Did you add your Google Maps API Key?
- Check if APIs are enabled in Google Cloud Console

**Need more help?**
- Read the full [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- Check [README.md](README.md) for details

## Alternative: One-Click Netlify Deploy

Click this button to deploy to Netlify instantly:

1. Go to https://app.netlify.com/start
2. Connect your GitHub repository
3. Click "Deploy site"
4. Done! Use the Netlify URL

---

**Enjoy your pub crawls! 🍺**
