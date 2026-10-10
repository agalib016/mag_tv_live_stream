# 📺 MAG Tv - Bangladesh, India & Pakistan Live TV Web App

An aesthetic, responsive Live TV streaming web application built with Python (Flask) and modern frontend technologies.

---

## ✨ Features

- **📺 990+ Live TV Channels**:
  - 🇧🇩 **Bangladesh**: Somoy TV, Jamuna TV, Channel 24, T Sports, Bangla Vision, Peace TV Bangla, Gaan Bangla, ATN Bangla, etc.
  - 🇮🇳 **India**: DD News, DD Sports, India TV, 9X Jalwa, Sanskar TV, Aastha TV, 4TV News, etc.
  - 🇵🇰 **Pakistan**: Geo News, ARY News, A Sports, PTV Sports, Hum TV, Madani Channel Urdu, etc.
- **🧭 Navigation Bar Categories**:
  - **All Channels**
  - **Sports**
  - **News**
  - **Religious**
  - **Entertainment**
  - **Others**
- **🎥 Selectable Resolutions (360p to 4K)**:
  - Users can select streaming quality: **Auto (Adaptive)**, **360p**, **480p**, **720p HD**, **1080p Full HD**, **2K QHD (1440p)**, and **4K Ultra HD (2160p)**.
  - Dynamic resolution badge overlay on the player (`Auto HD`, `720p HD`, `1080p FHD`, `4K UHD`).
- **🌍 4 Languages Supported (with Dynamic Switching & RTL support)**:
  - 🇺🇸 **English**
  - 🇧🇩 **বাংলা (Bangla)**
  - 🇮🇳 **हिन्दी (Hindi)**
  - 🇵🇰 **اردو (Urdu)** (with native RTL font layout)
- **🌓 Aesthetic Day & Night Mode**:
  - Smooth 1-click toggle with animated sun/moon icons.
  - High-contrast, glassmorphism cards, glowing ambient accents, and theme persistence.
- **⚡ Interactive Video Player**:
  - Powered by **HLS.js** for live `.m3u8` feeds.
  - Automatic stream retry & built-in **CORS Bypass Proxy**.
  - Live blinking status dot (Online, Buffering, Offline).
  - Dynamic simulated live viewer counter.
  - Controls: Play/Pause, Mute/Volume slider, Resolution Selector, Picture-in-Picture (PiP), Theater Mode, Fullscreen, and Stream Reload.
  - Graceful stream error fallback card with 1-click Proxy switcher and verified test streams.
- **❤️ Favorites & Recent Shelf**:
  - Bookmark favorite channels with interactive heart animation.
  - Instant filter tab for saved channels.
  - Recently watched quick shelf for quick channel switching.
- **🔍 Quick Search & Shortcuts**:
  - Search by channel name, country, or category.
  - Keyboard shortcuts (`Space` to Play/Pause, `M` to Mute, `F` for Fullscreen, `T` for Theater, `/` to focus Search).
- **➕ Custom M3U8 Stream Modal**:
  - Test and watch any custom public `.m3u8` link right inside the web app.

---

## 🚀 How to Run

1. Make sure Python is installed.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```bash
   python app.py
   ```
4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

---

## 📁 Project Structure

```
live_tv/
├── app.py                      # Flask backend (REST API, CORS stream proxy)
├── channels.json               # Curated channel database (BD, IN, PK)
├── build_channel_database.py   # Database generator & scraper
├── requirements.txt            # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css           # Glassmorphism, Day/Night themes, hover effects
│   └── js/
│       ├── app.js              # State, channels filtering, search, modals
│       ├── player.js           # HLS player, controls, CORS fallback
│       └── i18n.js             # Translations (EN, BN, HI, UR)
└── templates/
    └── index.html              # Modern semantic HTML5 markup
```
