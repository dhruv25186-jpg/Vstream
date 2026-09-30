document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') === 'tv' ? 'tv' : 'movie'; // default to movie
    
    document.getElementById('category-title').textContent = type === 'movie' ? 'Movies' : 'TV Shows';
    
    // Update nav active state
    if(type === 'movie') document.getElementById('nav-movies').classList.add('active');
    if(type === 'tv') document.getElementById('nav-tv').classList.add('active');

    let currentPage = 1;
    let currentGenre = '';
    let isLoading = false;
    let totalPages = 1;

    const resultsContainer = document.getElementById('category-results');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const genreList = document.getElementById('genre-list');

    async function init() {
        // Load Genres
        const genresRes = await api.getGenres(type);
        if (genresRes && genresRes.genres) {
            renderGenres(genresRes.genres);
        }
        
        // Initial load
        loadContent();
    }

    function renderGenres(genres) {
        // All pill
        const allPill = document.createElement('div');
        allPill.className = 'genre-pill active';
        allPill.textContent = 'All';
        allPill.dataset.id = '';
        allPill.onclick = () => selectGenre(allPill);
        genreList.appendChild(allPill);

        genres.forEach(genre => {
            const pill = document.createElement('div');
            pill.className = 'genre-pill';
            pill.textContent = genre.name;
            pill.dataset.id = genre.id;
            pill.onclick = () => selectGenre(pill);
            genreList.appendChild(pill);
        });
    }

    function selectGenre(element) {
        document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
        element.classList.add('active');
        
        currentGenre = element.dataset.id;
        currentPage = 1;
        resultsContainer.innerHTML = '';
        loadContent();
    }

    async function loadContent() {
        if (isLoading) return;
        isLoading = true;
        
        try {
            let res;
            if (currentGenre) {
                res = await api.getByGenre(currentGenre, type, currentPage);
            } else {
                res = type === 'movie' ? await api.getPopularMovies(currentPage) : await api.getPopularTV(currentPage);
            }
            
            if (res && res.results) {
                totalPages = res.total_pages;
                
                res.results.forEach(item => {
                    if (item.poster_path) {
                        resultsContainer.appendChild(createMovieCard(item, type));
                    }
                });
                
                if (currentPage < totalPages) {
                    loadMoreBtn.style.display = 'inline-block';
                } else {
                    loadMoreBtn.style.display = 'none';
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            isLoading = false;
        }
    }

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadContent();
    });

    init();
});
