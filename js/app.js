document.addEventListener('DOMContentLoaded', () => {
    // --- UI Interactions ---
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isShowing = mobileMenu.style.display === 'flex';
            mobileMenu.style.display = isShowing ? 'none' : 'flex';
            hamburger.innerHTML = isShowing ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
        });
    }

    // Search functionality
    const setupSearch = (formId, inputId) => {
        const form = document.getElementById(formId);
        const input = document.getElementById(inputId);
        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (input.value.trim()) {
                    window.location.href = `search.html?q=${encodeURIComponent(input.value.trim())}`;
                }
            });
        }
    };
    setupSearch('search-form', 'search-input');
    setupSearch('mobile-search-form', 'mobile-search-input');

    // Scroll to top button
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.style.display = 'flex';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Carousel scrolling
    document.querySelectorAll('.carousel-container').forEach(container => {
        const carousel = container.querySelector('.carousel');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        
        if (carousel && prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: -carousel.offsetWidth + 100, behavior: 'smooth' });
            });
            nextBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: carousel.offsetWidth - 100, behavior: 'smooth' });
            });
        }
    });

    // --- Load Home Page Data ---
    if (document.getElementById('hero-banner')) {
        loadHomePage();
    }
});

async function loadHomePage() {
    try {
        // Fetch trending for hero
        const trendingRes = await api.getTrending('day');
        if (trendingRes && trendingRes.results.length > 0) {
            // Pick a random movie/show from top 5
            const randomIdx = Math.floor(Math.random() * Math.min(5, trendingRes.results.length));
            const heroItem = trendingRes.results[randomIdx];
            populateHero(heroItem);
            
            // Populate trending row
            populateRow('trending-row', trendingRes.results);
        }

        // Fetch other rows concurrently
        Promise.all([
            api.getPopularMovies(),
            api.getTopRated(),
            api.getPopularTV(),
            api.getUpcoming()
        ]).then(([popularMovies, topRated, popularTV, upcoming]) => {
            if (popularMovies) populateRow('popular-movies-row', popularMovies.results, 'movie');
            if (topRated) populateRow('top-rated-row', topRated.results, 'movie');
            if (popularTV) populateRow('popular-tv-row', popularTV.results, 'tv');
            if (upcoming) populateRow('upcoming-row', upcoming.results, 'movie');
        });

    } catch (error) {
        console.error("Failed to load home page:", error);
    }
}

function populateHero(item) {
    const heroBanner = document.getElementById('hero-banner');
    const heroTitle = document.getElementById('hero-title');
    const heroDesc = document.getElementById('hero-description');
    const type = item.media_type || (item.name ? 'tv' : 'movie');

    // Remove skeletons
    document.querySelector('.hero-skeleton')?.remove();
    heroTitle.classList.remove('skeleton-text', 'skeleton-title');
    heroDesc.classList.remove('skeleton-text', 'skeleton-desc');
    document.querySelector('.hero-buttons').classList.remove('skeleton-btn-group');

    // Set content
    const backdropUrl = api.getImageURL(item.backdrop_path, 'original');
    heroBanner.style.backgroundImage = `url('${backdropUrl}')`;
    
    heroTitle.textContent = item.title || item.name;
    heroDesc.textContent = item.overview;

    // Buttons
    document.getElementById('hero-play').onclick = () => {
        window.location.href = `movie.html?id=${item.id}&type=${type}&play=true`;
    };
    document.getElementById('hero-info').onclick = () => {
        window.location.href = `movie.html?id=${item.id}&type=${type}`;
    };
}

function populateRow(containerId, items, type = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Clear skeletons
    
    items.forEach(item => {
        if (item.poster_path) {
            container.appendChild(createMovieCard(item, type));
        }
    });
}
