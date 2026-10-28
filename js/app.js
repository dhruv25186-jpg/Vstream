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

// Interleave Hollywood & Bollywood arrays for an exciting mix
function interleaveContent(arr1, arr2) {
    const list1 = arr1 || [];
    const list2 = arr2 || [];
    const mixed = [];
    const maxLen = Math.max(list1.length, list2.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < list1.length) mixed.push(list1[i]);
        if (i < list2.length) mixed.push(list2[i]);
    }
    return mixed;
}

async function loadHomePage() {
    try {
        // Fetch trending global and bollywood concurrently
        const [trendingRes, bollywoodMovies, bollywoodTV] = await Promise.all([
            api.getTrending('day'),
            api.getBollywoodMovies(),
            api.getBollywoodTV()
        ]);

        if (trendingRes && trendingRes.results.length > 0) {
            // Mix trending with top Bollywood hits
            const mixedTrending = interleaveContent(trendingRes.results, bollywoodMovies ? bollywoodMovies.results : []);
            
            // Pick a random highlight from top 6 mixed items
            const randomIdx = Math.floor(Math.random() * Math.min(6, mixedTrending.length));
            const heroItem = mixedTrending[randomIdx];
            populateHero(heroItem);
            
            // Populate trending row with balanced Hollywood + Bollywood
            populateRow('trending-row', mixedTrending);
        }

        // Fetch other rows concurrently
        Promise.all([
            api.getPopularMovies(),
            api.getTopRated(),
            api.getPopularTV(),
            api.getUpcoming(),
            api.getIndianUpcoming()
        ]).then(([popularMovies, topRated, popularTV, upcoming, indianUpcoming]) => {
            // 1. Dedicated Hollywood Blockbusters Row
            if (popularMovies && popularMovies.results) {
                populateRow('hollywood-movies-row', popularMovies.results, 'movie');
            }

            // 2. Dedicated Bollywood & Indian Cinema Row
            if (bollywoodMovies && bollywoodMovies.results) {
                populateRow('bollywood-movies-row', bollywoodMovies.results, 'movie');
            }

            // 3. Mixed Popular Movies (Hollywood + Bollywood alternating)
            const mixedPopular = interleaveContent(
                popularMovies ? popularMovies.results : [],
                bollywoodMovies ? bollywoodMovies.results : []
            );
            if (mixedPopular.length > 0) populateRow('popular-movies-row', mixedPopular, 'movie');

            // 3. Top Rated (Mixed Global & Top Indian Classics)
            if (topRated) populateRow('top-rated-row', topRated.results, 'movie');

            // 4. Popular TV Shows (Mixed Hollywood & Indian series)
            const mixedTV = interleaveContent(
                popularTV ? popularTV.results : [],
                bollywoodTV ? bollywoodTV.results : []
            );
            if (mixedTV.length > 0) populateRow('popular-tv-row', mixedTV, 'tv');

            // 5. Upcoming Releases (Hollywood & Bollywood upcoming)
            const mixedUpcoming = interleaveContent(
                upcoming ? upcoming.results : [],
                indianUpcoming ? indianUpcoming.results : []
            );
            if (mixedUpcoming.length > 0) populateRow('upcoming-row', mixedUpcoming, 'movie');
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
