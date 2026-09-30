# VStream

A complete, premium video streaming frontend mimicking platforms like Netflix, built using HTML, CSS, JavaScript, and the TMDB API.

## Features
- **Modern UI/UX**: Dark theme inspired by top streaming services, with glossy cards and smooth transitions.
- **Real Data**: Integration with the TMDB API for movies, TV shows, cast details, trailers, and more.
- **Responsive Design**: Works perfectly across mobile, tablet, and desktop.
- **Search**: Search for any movie or TV show.
- **Browse Categories**: Filter content by genre and media type.
- **Trailers**: Play trailers directly in a modal using YouTube embeds.
- **My List**: Add your favorite movies/shows to a local-storage based watchlist.

## Tech Stack
- HTML5
- CSS3 (Vanilla, CSS Variables, Flexbox, Grid)
- JavaScript (Vanilla, ES6+, Fetch API)
- FontAwesome (Icons)
- Google Fonts (Inter & Montserrat)

## Setup Instructions

1. **Get a TMDB API Key**:
   - Go to [The Movie Database (TMDB)](https://www.themoviedb.org/) and create an account.
   - Navigate to Settings -> API -> Request an API Key.
   - Copy your v3 API Key.

2. **Configure API Key**:
   - Open `js/api.js`.
   - Replace `'YOUR_TMDB_API_KEY'` on line 2 with your actual TMDB API key.
   ```javascript
   const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
   ```

3. **Run Locally**:
   - This is a purely static site.
   - Simply open `index.html` in your web browser.
   - *For best experience with API fetching, use a local server (like Live Server extension in VS Code).*

## Folder Structure
```
project_v/
│
├── index.html        # Home page
├── movie.html        # Details page
├── search.html       # Search results
├── category.html     # Browse/Genres page
├── mylist.html       # Watchlist
│
├── css/
│   ├── style.css       # Main styles
│   └── responsive.css  # Media queries
│
└── js/
    ├── api.js        # TMDB interactions and shared logic
    ├── app.js        # Home page logic
    ├── movie.js      # Details page logic
    ├── search.js     # Search logic
    ├── category.js   # Browse page logic
    └── mylist.js     # Watchlist logic
```

## Credits
- Data provided by [TMDB](https://www.themoviedb.org/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Icons from [Font Awesome](https://fontawesome.com/)

## License
MIT License
