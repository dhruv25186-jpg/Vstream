document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (!query) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('search-query-display').textContent = query;
    
    let currentPage = 1;
    let currentFilter = 'multi'; // multi, movie, tv
    let allResults = [];
    let isLoading = false;

    const resultsContainer = document.getElementById('search-results');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const noResults = document.getElementById('no-results');

    async function performSearch(page = 1) {
        if (isLoading) return;
        isLoading = true;
        
        try {
            const res = await api.searchMulti(query, page);
            if (!res) throw new Error("Search failed");
            
            if (page === 1) allResults = [];
            
            // Filter out people, keep only movies and tv shows with posters
            const filtered = res.results.filter(item => 
                (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
            );
            
            allResults = [...allResults, ...filtered];
            
            renderResults();
            
            if (res.page < res.total_pages) {
                loadMoreBtn.style.display = 'inline-block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
            
        } catch (error) {
            console.error(error);
        } finally {
            isLoading = false;
        }
    }

    function renderResults() {
        resultsContainer.innerHTML = '';
        
        let toDisplay = allResults;
        if (currentFilter !== 'multi') {
            toDisplay = allResults.filter(item => item.media_type === currentFilter);
        }
        
        if (toDisplay.length === 0) {
            noResults.style.display = 'block';
            resultsContainer.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            resultsContainer.style.display = 'grid';
            
            toDisplay.forEach(item => {
                resultsContainer.appendChild(createMovieCard(item));
            });
        }
    }

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderResults();
        });
    });

    // Load More
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        performSearch(currentPage);
    });

    // Initial search
    performSearch(currentPage);
});
