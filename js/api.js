// TMDB API wrapper
const API_KEY = '4429a49b799912068da95f47179e7acb';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/';

// Fetch data from API
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Get image URL
function getImageURL(path, size = 'w500') {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return `${IMG_URL}${size}${path}`;
}

const api = {
    // Trending
    getTrending: (timeWindow = 'day', page = 1) => fetchAPI(`/trending/all/${timeWindow}?api_key=${API_KEY}&page=${page}`),
    
    // Movies
    getPopularMovies: (page = 1) => fetchAPI(`/movie/popular?api_key=${API_KEY}&page=${page}`),
    getTopRated: (page = 1) => fetchAPI(`/movie/top_rated?api_key=${API_KEY}&page=${page}`),
    getUpcoming: (page = 1) => fetchAPI(`/movie/upcoming?api_key=${API_KEY}&page=${page}`),
    getMovieDetails: (id) => fetchAPI(`/movie/${id}?api_key=${API_KEY}`),
    getMovieCredits: (id) => fetchAPI(`/movie/${id}/credits?api_key=${API_KEY}`),
    getSimilarMovies: (id) => fetchAPI(`/movie/${id}/similar?api_key=${API_KEY}`),
    getMovieVideos: (id) => fetchAPI(`/movie/${id}/videos?api_key=${API_KEY}`),
    
    // TV Shows
    getPopularTV: (page = 1) => fetchAPI(`/tv/popular?api_key=${API_KEY}&page=${page}`),
    getTVDetails: (id) => fetchAPI(`/tv/${id}?api_key=${API_KEY}`),
    getTVCredits: (id) => fetchAPI(`/tv/${id}/credits?api_key=${API_KEY}`),
    getSimilarTV: (id) => fetchAPI(`/tv/${id}/similar?api_key=${API_KEY}`),
    getTVVideos: (id) => fetchAPI(`/tv/${id}/videos?api_key=${API_KEY}`),
    
    // Search & Explore
    searchMulti: (query, page = 1) => fetchAPI(`/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`),
    getGenres: (type = 'movie') => fetchAPI(`/genre/${type}/list?api_key=${API_KEY}`),
    getByGenre: (genreId, type = 'movie', page = 1) => fetchAPI(`/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`),
    
    getImageURL
};

// Global utilities for UI
function createMovieCard(item, type = null) {
    const itemType = type || item.media_type || (item.name ? 'tv' : 'movie');
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date || '';
    const year = date ? date.split('-')[0] : '';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => window.location.href = `movie.html?id=${item.id}&type=${itemType}`;
    
    card.innerHTML = `
        <img src="${getImageURL(item.poster_path)}" alt="${title}" loading="lazy">
        <div class="card-overlay">
            <div class="card-title">${title}</div>
            <div class="card-meta">
                <span class="rating"><i class="fas fa-star"></i> ${rating}</span>
                <span>${year}</span>
            </div>
        </div>
    `;
    return card;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Local Storage for My List
const listManager = {
    getList: () => JSON.parse(localStorage.getItem('vstream_list')) || [],
    add: (item, type) => {
        const list = listManager.getList();
        if (!list.find(i => i.id === item.id)) {
            list.push({ ...item, media_type: type });
            localStorage.setItem('vstream_list', JSON.stringify(list));
            showToast('Added to My List');
            return true;
        }
        showToast('Already in My List', 'error');
        return false;
    },
    remove: (id) => {
        let list = listManager.getList();
        list = list.filter(i => i.id !== id);
        localStorage.setItem('vstream_list', JSON.stringify(list));
        showToast('Removed from My List');
    },
    isInList: (id) => {
        const list = listManager.getList();
        return list.some(i => i.id == id); // loose check for str/int
    }
};
