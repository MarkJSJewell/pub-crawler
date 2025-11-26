# 🍺 Pub Crawl Planner - Progressive Web App

A smart pub crawl planning app that helps you discover and route between venues based on your preferences.

## ✨ Features

### Venue Filters
- 🏛️ **Historic Pubs** - Traditional and heritage venues
- ⚽ **Sports Bars** - Perfect for watching the game
- 🌳 **Outdoor Seating** - Beer gardens and patios
- 🫖 **Afternoon Tea** - Elegant tea service venues
- 🍻 **Happy Hours** - Drink specials and deals
- 📍 **All Venues** - No filter

### Smart Planning
- 🗺️ **Optimized Routes** - Walking directions between venues
- 📊 **Distance & Time** - Total route calculations
- ⭐ **Ratings Filter** - Minimum rating selection
- 🕐 **Opening Hours** - Filter by currently open venues
- 📏 **Distance Control** - 5km or 10km search radius

### App Features
- 📱 **Install as App** - Works on Android, iOS, and Desktop
- 🔌 **Offline Ready** - App loads without internet
- 🚀 **Fast Loading** - Cached for instant access
- 🎯 **Location-Based** - Search anywhere in the world

## 🚀 Quick Deployment

### 1. Generate Icons
Open `generate-icons.html` in a browser and download both icons.

### 2. Deploy to GitHub Pages (Easiest)

```bash
# Create a new repository on GitHub
# Then run:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main

# Enable GitHub Pages in repository Settings → Pages
```

Your app will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO`

### 3. Install on Your Device

**Android:** Open in Chrome → Install App button appears

**iOS:** Open in Safari → Share → Add to Home Screen

## 📋 Required Files

```
pub-crawler/
├── index.html              # Main app
├── manifest.json           # PWA configuration
├── service-worker.js       # Offline functionality
├── icon-192.png           # App icon (small)
├── icon-512.png           # App icon (large)
├── generate-icons.html    # Icon generator
├── INSTALLATION_GUIDE.md  # Detailed guide
└── README.md              # This file
```

## 🔑 Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable these APIs:
   - Places API (New)
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. Create credentials (API Key)
5. Enter the API key in the app

## 🌐 Alternative Hosting Options

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Simple Python Server (Testing Only)
```bash
# For local testing (not HTTPS)
python3 -m http.server 8000
# Open http://localhost:8000
```

## 🎨 Customization

### Change App Name
Edit `manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "Short Name"
}
```

### Change Colors
Edit `manifest.json`:
```json
{
  "theme_color": "#1a73e8",
  "background_color": "#ffffff"
}
```

### Change Icons
Replace `icon-192.png` and `icon-512.png` with your own 192x192 and 512x512 PNG images.

## 📱 Browser Support

| Browser | Android | iOS | Desktop |
|---------|---------|-----|---------|
| Chrome  | ✅ Full | ❌ | ✅ Full |
| Safari  | ❌ | ✅ Limited | ✅ Limited |
| Edge    | ✅ Full | ❌ | ✅ Full |
| Firefox | ✅ Limited | ❌ | ✅ Limited |

## 🛠️ Technical Details

- **Framework:** Vanilla JavaScript (no dependencies)
- **PWA:** Service Worker + Web Manifest
- **APIs:** Google Maps Platform (Places, Directions, Geocoding)
- **Storage:** LocalStorage for API key persistence
- **Offline:** App shell cached, API calls require internet

## 📖 Documentation

- [Installation Guide](INSTALLATION_GUIDE.md) - Detailed deployment steps
- [Google Maps Platform](https://developers.google.com/maps) - API documentation

## 🔒 Security Notes

- API key is stored in browser's LocalStorage
- Use API key restrictions in Google Cloud Console
- Restrict to your domain and required APIs only
- Consider implementing server-side key management for production

## ⚠️ Important

- **HTTPS Required:** PWAs only work over HTTPS (except localhost)
- **API Costs:** Google Maps APIs have usage costs after free tier
- **iOS Limitations:** Some PWA features unavailable on iOS
- **Storage:** LocalStorage is per-domain and can be cleared

## 🎯 Use Cases

- Planning pub crawls for groups
- Finding venues with specific amenities
- Discovering historic pubs in new cities
- Locating sports bars for game day
- Finding outdoor dining options
- Planning afternoon tea outings
- Discovering happy hour deals

## 🤝 Contributing

This is a standalone PWA. To modify:
1. Edit `index.html` for app logic
2. Update `service-worker.js` version after changes
3. Test on multiple devices
4. Redeploy to hosting service

## 📄 License

Free to use and modify for personal and commercial projects.

## 🎉 Credits

Built with:
- Google Maps Platform
- Progressive Web App technologies
- Modern Web APIs

---

**Ready to start?** Follow the [Installation Guide](INSTALLATION_GUIDE.md) for step-by-step instructions!
