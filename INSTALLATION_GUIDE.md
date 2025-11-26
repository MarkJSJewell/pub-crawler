# Pub Crawl Planner - PWA Installation Guide

## 📱 What is This?

Your Pub Crawl Planner is now a **Progressive Web App (PWA)** that can be installed on Android and iOS devices, working like a native app!

## 🚀 Quick Start

### Step 1: Generate App Icons

1. Open `generate-icons.html` in your browser
2. Click "Download 192x192" and save as `icon-192.png`
3. Click "Download 512x512" and save as `icon-512.png`
4. Place both icon files in the same folder as `index.html`

### Step 2: Deploy Your App

You need to host these files on a web server with HTTPS. Here are your options:

#### Option A: GitHub Pages (FREE & Easy)
1. Create a GitHub account at https://github.com
2. Create a new repository (e.g., "pub-crawler")
3. Upload these files:
   - `index.html`
   - `manifest.json`
   - `service-worker.js`
   - `icon-192.png`
   - `icon-512.png`
4. Go to Settings → Pages
5. Select "main" branch and click Save
6. Your app will be live at `https://yourusername.github.io/pub-crawler`

#### Option B: Netlify (FREE)
1. Sign up at https://www.netlify.com
2. Drag and drop your folder (with all files) to Netlify
3. Your app is live instantly with a URL like `https://your-app-name.netlify.app`

#### Option C: Vercel (FREE)
1. Sign up at https://vercel.com
2. Connect your GitHub repo or drag & drop files
3. Instant deployment at `https://your-app.vercel.app`

#### Option D: Your Own Server
Upload all files to any web server with HTTPS enabled.

## 📲 Installing on Devices

### Android (Chrome/Edge)

1. Open your deployed app URL in Chrome or Edge
2. You'll see an "Install App" button at the bottom right
3. Click it and follow the prompts
4. The app will appear on your home screen

**Alternative:**
- Tap the three dots menu (⋮)
- Select "Install app" or "Add to Home screen"

### iOS (Safari)

1. Open your deployed app URL in Safari
2. Tap the Share button (⎙)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Pub Crawler" and tap "Add"
5. The app will appear on your home screen

**Note:** iOS will show installation instructions automatically when you open the app.

### Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Look for the install icon (➕) in the address bar
3. Click it to install
4. The app opens in its own window

## ✨ Features of the Installed App

- **Works Offline:** App loads even without internet (though Google Maps APIs need connection)
- **Home Screen Icon:** Looks like a native app
- **Full Screen:** No browser UI when opened
- **Fast Loading:** Cached resources load instantly
- **App Drawer:** Shows up in your app drawer/list like other apps

## 🔑 Adding Your Google Maps API Key

Before using the app:
1. Open the installed app
2. Enter your Google Maps API Key in the "API Configuration" section
3. Click "Connect"
4. Start searching!

## 🛠️ Requirements

- **HTTPS:** The app MUST be served over HTTPS (all hosting options above provide this)
- **Modern Browser:** Chrome, Edge, Safari, or Firefox
- **Service Worker Support:** All modern browsers support this

## 📱 Testing Before Deployment

To test locally:
1. Use a local server with HTTPS, or
2. Use `python3 -m http.server 8000` and access via `localhost:8000`
3. Note: PWA features require HTTPS in production

## 🌐 Updating Your App

When you make changes:
1. Update the `CACHE_NAME` version in `service-worker.js` (e.g., 'pub-crawler-v2')
2. Upload the changed files
3. Users will get the update automatically on their next visit

## 📋 Files Included

- `index.html` - Main app file
- `manifest.json` - PWA configuration
- `service-worker.js` - Offline functionality
- `icon-192.png` - App icon (192x192)
- `icon-512.png` - App icon (512x512)
- `generate-icons.html` - Icon generator tool

## 🎨 Customizing

### Change App Colors
Edit `manifest.json`:
- `theme_color` - App theme color
- `background_color` - Splash screen background

### Change App Name
Edit `manifest.json`:
- `name` - Full name
- `short_name` - Name shown on home screen

### Change Icon
Replace `icon-192.png` and `icon-512.png` with your own icons (must be exact sizes)

## ⚠️ Important Notes

1. **HTTPS is Required:** PWAs only work on HTTPS (except localhost for testing)
2. **iOS Limitations:** iOS doesn't support all PWA features, but core functionality works
3. **API Key:** Each user needs to enter their own Google Maps API key
4. **Storage:** The app stores the API key in browser storage (stays logged in)

## 🆘 Troubleshooting

### "Install" button doesn't appear
- Ensure you're using HTTPS
- Try Chrome or Edge on Android
- Check browser console for errors

### App doesn't work offline
- Make sure service worker registered successfully
- Check browser console for service worker errors
- Remember: Google Maps APIs need internet connection

### Icons don't show
- Verify icon files are in the same directory as index.html
- Check file names match exactly (icon-192.png, icon-512.png)
- Clear browser cache and try again

### iOS installation issues
- Must use Safari browser
- Share button is at the bottom (middle icon)
- Look for "Add to Home Screen" option

## 📞 Support

For Google Maps API issues:
- Visit: https://console.cloud.google.com
- Enable: Places API (New), Maps JavaScript API, Geocoding API, Directions API

## 🎉 Success!

Once deployed and installed, your Pub Crawl Planner works just like a native app, with:
- Fast loading
- Offline capability
- Home screen presence
- Full-screen experience
- Push notifications ready (can be added later)

Enjoy your pub crawls! 🍺
