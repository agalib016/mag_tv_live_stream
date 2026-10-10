# 📺 MAG Tv - Bangladesh, India & Pakistan Live TV Web App

An aesthetic, responsive Live TV streaming web application built with Python (Flask) and modern frontend technologies.

---

## ✨ Features

- **📺 700+ Verified Active Live TV Channels**:
  - 🇧🇩 **Bangladesh**: Somoy TV, DBC News, Ekattor TV, Independent TV, Bangla Vision, Boishakhi TV, Ekushey TV, Duronto TV, Maasranga TV, ATN Bangla, NTV, RTV, Peace TV Bangla, Star Jalsha, Zee Bangla, Nexus TV, etc.
  - 🇮🇳 **India**: India Today HD, WION News, News Nation, 9X Jalwa, Red Bull TV Sports, NASA TV HD, TRT World, DW News, etc.
  - 🇵🇰 **Pakistan**: A Sports HD, Geo News HD, ARY News, 8XM Music, Khyber News, etc.
- **🖥️ Multi-Server Anti-Buffering Architecture**:
  - **Server 1 (High-Speed Direct CDN)**: Direct origin stream for lowest latency.
  - **Server 2 (Turbo Buffer-Free Proxy)**: Persistent TCP Keep-Alive connection pooling with 128KB chunk buffers to eliminate buffering.
  - **Server 3 (Edge Bypass Route)**: AppleCoreMedia / iPad headers to bypass CORS and CDN anti-hotlinking.
  - **Server 4 (Backup Cloud Proxy / Alt Source)**: Failover cloud transmission line.
  - **Interactive Server Switcher**: Dropdown in the player controls allowing users to switch servers with 1 click.
  - **Smart Auto-Failover & Stall Watchdog**: If a stream stalls or buffers for > 4.5s, the player automatically switches to the next available server with an animated toast notification.
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
  - Powered by **HLS.js** with tuned 30s buffer window, PTS micro-hole jumping, and safe live-sync margin.
  - Live blinking status dot (Online, Buffering, Offline).
  - Dynamic simulated live viewer counter.
  - Controls: Server Selector, Play/Pause, Mute/Volume slider, Resolution Selector, Picture-in-Picture (PiP), Theater Mode, Fullscreen, and Stream Reload.
  - Graceful stream error fallback card with 1-click Next Server switcher and verified test streams.
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
