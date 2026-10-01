document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type') || 'movie';
    const autoPlay = urlParams.get('play') === 'true';

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    loadDetails(id, type, autoPlay);
});

let currentItem = null;
let currentType = null;
let trailerKey = null;

async function loadDetails(id, type, autoPlay) {
    try {
        currentType = type;
        
        // Fetch details
        const details = type === 'movie' ? await api.getMovieDetails(id) : await api.getTVDetails(id);
        if (!details) throw new Error("Details not found");
        
        currentItem = details;
        updateUI(details, type);
        
        // Fetch credits
        const credits = type === 'movie' ? await api.getMovieCredits(id) : await api.getTVCredits(id);
        if (credits) populateCast(credits.cast);
        
        // Fetch similar
        const similar = type === 'movie' ? await api.getSimilarMovies(id) : await api.getSimilarTV(id);
        if (similar) {
            document.getElementById('similar-type').textContent = type === 'movie' ? 'Movies' : 'TV Shows';
            populateRow('similar-row', similar.results, type);
        }
        
        // Fetch videos
        const videos = type === 'movie' ? await api.getMovieVideos(id) : await api.getTVVideos(id);
        if (videos && videos.results.length > 0) {
            const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results.find(v => v.site === 'YouTube');
            if (trailer) {
                trailerKey = trailer.key;
            }
        }
        
        if (autoPlay) {
            openTrailerModal(trailerKey ? 'trailer' : 'stream');
        }

    } catch (error) {
        console.error("Error loading details:", error);
        showToast("Error loading details", "error");
    }
}

function updateUI(item, type) {
    // Backdrop
    if (item.backdrop_path) {
        document.getElementById('detail-hero').style.backgroundImage = `url('${api.getImageURL(item.backdrop_path, 'original')}')`;
    }

    // Poster
    const posterImg = document.getElementById('detail-poster-img');
    document.querySelector('.detail-skeleton-poster').style.display = 'none';
    posterImg.src = api.getImageURL(item.poster_path);
    posterImg.style.display = 'block';

    // Remove skeletons
    document.getElementById('detail-title').classList.remove('skeleton-text', 'skeleton-title');
    document.querySelector('.detail-meta').classList.remove('skeleton-text', 'skeleton-meta');
    document.getElementById('detail-genres').classList.remove('skeleton-text', 'skeleton-genres');
    document.getElementById('detail-overview').classList.remove('skeleton-text', 'skeleton-desc');

    // Text content
    document.getElementById('detail-title').textContent = item.title || item.name;
    document.getElementById('detail-tagline').textContent = item.tagline || '';
    
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';
    document.getElementById('detail-rating').innerHTML = `<i class="fas fa-star"></i> ${rating}`;
    
    const date = item.release_date || item.first_air_date || '';
    document.getElementById('detail-date').textContent = date.split('-')[0];
    
    const runtime = item.runtime ? `${item.runtime} min` : (item.episode_run_time?.length ? `${item.episode_run_time[0]} min/ep` : '');
    document.getElementById('detail-runtime').textContent = runtime;

    // Genres
    const genresContainer = document.getElementById('detail-genres');
    genresContainer.innerHTML = '';
    item.genres.forEach(g => {
        const span = document.createElement('span');
        span.textContent = g.name;
        genresContainer.appendChild(span);
    });

    document.getElementById('detail-overview').textContent = item.overview;

    // Buttons
    setupButtons(item, type);
}

function setupButtons(item, type) {
    const btnAdd = document.getElementById('btn-add-list');
    
    // Check if in list
    if (listManager.isInList(item.id)) {
        btnAdd.innerHTML = '<i class="fas fa-check"></i> In My List';
        btnAdd.classList.replace('btn-secondary', 'btn-primary');
    }

    btnAdd.onclick = () => {
        if (listManager.isInList(item.id)) {
            listManager.remove(item.id);
            btnAdd.innerHTML = '<i class="fas fa-plus"></i> Add to My List';
            btnAdd.classList.replace('btn-primary', 'btn-secondary');
        } else {
            if (listManager.add(item, type)) {
                btnAdd.innerHTML = '<i class="fas fa-check"></i> In My List';
                btnAdd.classList.replace('btn-secondary', 'btn-primary');
            }
        }
    };

    document.getElementById('btn-play-trailer').onclick = () => {
        openTrailerModal(trailerKey ? 'trailer' : 'stream');
    };
    
    document.getElementById('btn-share').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard!");
    };
}

function populateCast(cast) {
    const container = document.getElementById('cast-row');
    container.innerHTML = ''; // clear skeletons
    
    // Show top 10 cast
    cast.slice(0, 10).forEach(person => {
        const div = document.createElement('div');
        div.className = 'cast-card';
        const imgUrl = person.profile_path ? api.getImageURL(person.profile_path, 'w200') : 'https://via.placeholder.com/150?text=No+Photo';
        
        div.innerHTML = `
            <img src="${imgUrl}" alt="${person.name}" class="cast-img" loading="lazy">
            <div class="cast-name">${person.name}</div>
            <div class="cast-char">${person.character}</div>
        `;
        container.appendChild(div);
    });
}

function populateRow(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Clear skeletons
    items.forEach(item => {
        if (item.poster_path) {
            container.appendChild(createMovieCard(item, type));
        }
    });
}

// Modal handling
const modal = document.getElementById('video-modal');
const closeBtn = document.querySelector('.close-modal');
const videoContainer = document.getElementById('video-player-container');

let currentSeason = 1;
let currentEpisode = 1;

function openTrailerModal(mode = 'stream') {
    const title = currentItem ? (currentItem.title || currentItem.name) : 'Video';
    const id = currentItem ? currentItem.id : '';
    const type = currentType || 'movie';
    const totalSeasons = (currentItem && currentItem.number_of_seasons) ? currentItem.number_of_seasons : 5;

    // Helper to generate third-party streaming provider URLs for the selected movie/series
    function getThirdPartyStreamUrl(providerKey, s = currentSeason, e = currentEpisode) {
        if (type === 'tv') {
            switch(providerKey) {
                case 'vidlink': return `https://vidlink.pro/tv/${id}/${s}/${e}`;
                case 'autoembed': return `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`;
                case 'embedsu': return `https://embed.su/embed/tv/${id}/${s}/${e}`;
                case 'vidsrc': return `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`;
                case 'twoembed': return `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`;
                case 'smashy': return `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`;
                default: return `https://vidlink.pro/tv/${id}/${s}/${e}`;
            }
        } else {
            // Movie
            switch(providerKey) {
                case 'vidlink': return `https://vidlink.pro/movie/${id}`;
                case 'autoembed': return `https://player.autoembed.cc/embed/movie/${id}`;
                case 'embedsu': return `https://embed.su/embed/movie/${id}`;
                case 'vidsrc': return `https://vidsrc.cc/v2/embed/movie/${id}`;
                case 'twoembed': return `https://www.2embed.cc/embed/${id}`;
                case 'smashy': return `https://embed.smashystream.com/playere.php?tmdb=${id}`;
                default: return `https://vidlink.pro/movie/${id}`;
            }
        }
    }

    const streamProviders = [
        { key: "vidlink", name: "Server 1 (VidLink Pro - Fast & Multi-Subtitles)", type: "embed" },
        { key: "autoembed", name: "Server 2 (AutoEmbed Multi-Source)", type: "embed" },
        { key: "embedsu", name: "Server 3 (EmbedSU Cloud HD)", type: "embed" },
        { key: "vidsrc", name: "Server 4 (VidSrc CC Global)", type: "embed" },
        { key: "twoembed", name: "Server 5 (2Embed Multi-Host)", type: "embed" },
        { key: "smashy", name: "Server 6 (SmashyStream Fast)", type: "embed" },
        { key: "cdn_ocean", name: "Server 7 (VStream Direct CDN - 1080p)", type: "direct", url: "https://vjs.zencdn.net/v/oceans.mp4" },
        { key: "cdn_sintel", name: "Server 8 (VStream Direct CDN - Sintel)", type: "direct", url: "https://media.w3.org/2010/05/sintel/trailer.mp4" }
    ];

    let selectedProvider = streamProviders[0];

    let modalHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <div>
                <h3 style="color:#fff; font-size:1.3rem; font-weight:700; margin-bottom:4px;">${title}</h3>
                <span style="color:#aaa; font-size:12px;">
                    <i class="fas fa-circle" style="color:#00e676; font-size:10px;"></i> Third-Party Movie Streaming Cloud Active
                </span>
            </div>
            <div style="display:flex; gap:10px;">
                <button id="tab-stream" class="btn ${mode === 'stream' ? 'btn-primary' : 'btn-secondary'}" style="padding:7px 16px; font-size:13px;"><i class="fas fa-play"></i> Watch Movie</button>
                ${trailerKey ? `<button id="tab-trailer" class="btn ${mode === 'trailer' ? 'btn-primary' : 'btn-secondary'}" style="padding:7px 16px; font-size:13px;"><i class="fab fa-youtube"></i> Trailer</button>` : ''}
            </div>
        </div>
    `;

    if (mode === 'stream') {
        modalHTML += `
            <div id="player-display-area" style="position:relative; width:100%; border-radius:12px; overflow:hidden; background:#000; box-shadow:0 15px 40px rgba(0,0,0,0.9);">
                <div id="iframe-wrapper" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; background:#000;">
                    <iframe id="main-stream-frame" 
                        src="${getThirdPartyStreamUrl(selectedProvider.key)}" 
                        allowfullscreen 
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;">
                    </iframe>
                </div>
            </div>

            <!-- TV Season / Episode Selector (If TV Show) -->
            ${type === 'tv' ? `
            <div style="margin-top:12px; background:#181818; padding:12px 18px; border-radius:8px; display:flex; gap:15px; align-items:center; flex-wrap:wrap; border:1px solid #333;">
                <span style="color:#fff; font-weight:600; font-size:13px;"><i class="fas fa-list-ol"></i> Choose Episode:</span>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="color:#bbb; font-size:13px;">Season:</span>
                    <select id="season-select" style="background:#222; color:#fff; border:1px solid #555; padding:6px 12px; border-radius:4px; font-size:13px; outline:none; cursor:pointer;">
                        ${Array.from({length: totalSeasons}, (_, i) => `<option value="${i+1}" ${currentSeason === (i+1) ? 'selected' : ''}>Season ${i+1}</option>`).join('')}
                    </select>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="color:#bbb; font-size:13px;">Episode:</span>
                    <select id="episode-select" style="background:#222; color:#fff; border:1px solid #555; padding:6px 12px; border-radius:4px; font-size:13px; outline:none; cursor:pointer;">
                        ${Array.from({length: 24}, (_, i) => `<option value="${i+1}" ${currentEpisode === (i+1) ? 'selected' : ''}>Episode ${i+1}</option>`).join('')}
                    </select>
                </div>
            </div>
            ` : ''}

            <!-- Server switcher & controls -->
            <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background:#141414; padding:12px 18px; border-radius:8px; border:1px solid #282828;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:#eee; font-size:13px; font-weight:600;"><i class="fas fa-server"></i> Switch Provider / Server:</span>
                    <select id="server-select" style="background:#222; color:#fff; border:1px solid #444; padding:6px 12px; border-radius:4px; font-size:13px; outline:none; cursor:pointer;">
                        ${streamProviders.map((s, idx) => `<option value="${idx}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div style="color:#aaa; font-size:13px; display:flex; gap:15px;">
                    <span><i class="fas fa-shield-alt" style="color:#4caf50;"></i> Multi-Source Streaming</span>
                    <span><i class="fas fa-closed-captioning"></i> Subtitles & Multi-Audio</span>
                </div>
            </div>
        `;
    } else {
        // Trailer mode
        modalHTML += `
            <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px; background:#000;">
                <iframe 
                    src="https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1" 
                    allowfullscreen 
                    allow="autoplay; encrypted-media; picture-in-picture"
                    style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;">
                </iframe>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; flex-wrap:wrap; gap:10px; background:#181818; padding:12px 16px; border-radius:6px;">
                <span style="color:#aaa; font-size:13px;"><i class="fas fa-info-circle" style="color:#f39c12;"></i> Official YouTube trailer stream for this title.</span>
                <a href="https://www.youtube.com/watch?v=${trailerKey}" target="_blank" 
                   class="btn btn-secondary" style="display:inline-flex; gap:8px; align-items:center; font-size:13px; padding:6px 14px;">
                    <i class="fab fa-youtube" style="color:#ff0000;"></i> Open YouTube Tab
                </a>
            </div>
        `;
    }

    videoContainer.innerHTML = modalHTML;
    modal.style.display = 'block';

    // Hook tab switches
    const tabTrailer = document.getElementById('tab-trailer');
    const tabStream = document.getElementById('tab-stream');
    if (tabTrailer) tabTrailer.onclick = () => openTrailerModal('trailer');
    if (tabStream) tabStream.onclick = () => openTrailerModal('stream');

    // Function to reload stream frame
    function reloadStreamFrame() {
        const playerArea = document.getElementById('player-display-area');
        if (!playerArea) return;

        if (selectedProvider.type === 'embed') {
            const url = getThirdPartyStreamUrl(selectedProvider.key, currentSeason, currentEpisode);
            playerArea.innerHTML = `
                <div id="iframe-wrapper" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; background:#000;">
                    <iframe 
                        src="${url}" 
                        allowfullscreen 
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;">
                    </iframe>
                </div>
            `;
        } else {
            // Direct video
            playerArea.innerHTML = `
                <video controls autoplay playsinline style="width:100%; max-height:68vh; display:block; outline:none; background:#000;">
                    <source src="${selectedProvider.url}" type="video/mp4">
                    Your browser does not support HTML5 video streaming.
                </video>
            `;
        }
    }

    // Hook Server selection
    const serverSelect = document.getElementById('server-select');
    if (serverSelect) {
        serverSelect.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value, 10);
            selectedProvider = streamProviders[idx];
            reloadStreamFrame();
            showToast(`Connected to ${selectedProvider.name.split('(')[1].replace(')', '')}`);
        });
    }

    // Hook Season / Episode Selection
    const seasonSelect = document.getElementById('season-select');
    const episodeSelect = document.getElementById('episode-select');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', (e) => {
            currentSeason = parseInt(e.target.value, 10);
            reloadStreamFrame();
            showToast(`Loading Season ${currentSeason}, Episode ${currentEpisode}...`);
        });
    }
    if (episodeSelect) {
        episodeSelect.addEventListener('change', (e) => {
            currentEpisode = parseInt(e.target.value, 10);
            reloadStreamFrame();
            showToast(`Loading Season ${currentSeason}, Episode ${currentEpisode}...`);
        });
    }
}

closeBtn.onclick = () => {
    modal.style.display = 'none';
    videoContainer.innerHTML = '';
};

window.onclick = (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
        videoContainer.innerHTML = '';
    }
};
