# 🎬 VStream - Modern Video Streaming Web Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_VStream_Online-e50914?style=for-the-badge&logo=netflix)](https://dhruv25186-jpg.github.io/Vstream/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-dhruv25186--jpg%2FVstream-181717?style=for-the-badge&logo=github)](https://github.com/dhruv25186-jpg/Vstream)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 🚀 **Live Website Link:** **[https://dhruv25186-jpg.github.io/Vstream/](https://dhruv25186-jpg.github.io/Vstream/)**

---

## 🌟 Overview
**VStream** is a responsive, feature-rich video streaming web application mimicking top streaming platforms like Netflix. Built with pure modern web technologies (HTML5, CSS3, Vanilla ES6+ JavaScript) and powered by the **TMDB (The Movie Database) REST API**, it features real-time movie/TV metadata, custom HTML5 video streaming player controls, responsive UI carousels, genre filtering, search, and a persistent local storage watchlist.

---

## ✨ Key Features

- 🎥 **Hero Banner Spotlight**: Dynamic trending title showcase with backdrop art and instant action buttons.
- 📺 **Custom Built-in Video Player**: Netflix-style HTML5 video player with interactive seekbar, timestamp display, 10s skip/rewind, volume slider, playback speed controls (0.75x–2.0x), and fullscreen mode.
- 📡 **Multi-Source Fast CDN Streaming**: Cloud streaming servers providing buffer-free 1080p FHD video playback.
- 🎬 **Official YouTube Trailer Integration**: Seamless official trailer playback with smart fallback handling.
- 🔍 **Live Search with Filtering**: Instant search across Movies & TV Shows with media-type filters.
- 🎭 **Genre-Based Category Discovery**: Browse content filtered dynamically by genres (Action, Sci-Fi, Drama, Anime, etc.).
- 📋 **My List Watchlist**: Save favorite movies and series directly to browser `localStorage`.
- 📱 **100% Mobile & Tablet Responsive**: Custom hamburger navigation and touch-optimized carousels across all viewports.
- ⚡ **Skeleton Loading & Micro-animations**: Smooth shimmer skeletons, glossy hover elevations, and slide-in toast notifications.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (CSS Variables, Flexbox, CSS Grid)
- **Programming Language**: Vanilla JavaScript (ES6+, Async/Await, Fetch API)
- **Data Source / API**: [TMDB REST API v3](https://www.themoviedb.org/)
- **Typography & Icons**: Google Fonts (*Montserrat* & *Inter*), Font Awesome 6.5
- **Hosting / Deployment**: GitHub Pages

---

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dhruv25186-jpg/Vstream.git
   cd Vstream
   ```

2. **Launch the site:**
   - **Option A (Windows 1-Click):** Double-click `start_server.bat`
   - **Option B (Python Server):** Run `python -m http.server 8000` and open `http://localhost:8000`
   - **Option C (VS Code):** Right click `index.html` -> *Open with Live Server*

---

## 📂 Project Structure

```
Vstream/
│
├── index.html          # Main Homepage with hero spotlight & content carousels
├── movie.html          # Details page with custom video player & cast
├── search.html         # Live search results page with filters
├── category.html       # Genre category browsing page
├── mylist.html         # User watchlist page (localStorage)
├── start_server.bat    # 1-click Windows local server launcher
│
├── css/
│   ├── style.css       # Core design system, variables & custom player styling
│   └── responsive.css  # Breakpoints for mobile, tablet, and desktop
│
└── js/
    ├── api.js          # TMDB API wrapper & shared utilities
    ├── app.js          # Homepage logic, navigation & UI events
    ├── movie.js        # Video playback engine & details rendering
    ├── search.js       # Search execution & filter tabs
    ├── category.js     # Genre fetching & content rendering
    └── mylist.js       # Watchlist storage manager
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
