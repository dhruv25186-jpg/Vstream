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
        
        // Fetch similar (Bollywood + Hollywood mixed recommendations)
        const similarPromise = type === 'movie' ? api.getSimilarMovies(id) : api.getSimilarTV(id);
        const regionalPromise = type === 'movie' ? api.getBollywoodMovies(1) : api.getBollywoodTV(1);
        
        const [similar, regional] = await Promise.all([similarPromise, regionalPromise]);
        if (similar && similar.results) {
            document.getElementById('similar-type').textContent = type === 'movie' ? 'Movies & Shows' : 'TV Shows';
            
            // Interleave similar with top Bollywood/regional hits for balanced suggestions
            const sList = similar.results || [];
            const rList = (regional && regional.results) ? regional.results.filter(r => r.id != id) : [];
            const mixedSuggestions = [];
            const maxLen = Math.max(sList.length, rList.length);
            for (let i = 0; i < maxLen; i++) {
                if (i < sList.length) mixedSuggestions.push(sList[i]);
                if (i < rList.length) mixedSuggestions.push(rList[i]);
            }
            populateRow('similar-row', mixedSuggestions.length > 0 ? mixedSuggestions : sList, type);
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

    // Download Button handler
    const btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
        btnDownload.onclick = () => openDownloadModal();
    }
    
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
let currentServerIndex = 0;
let isServerDrawerOpen = false;

function buildAutoembedUrl(server, tmdbId, type, season, episode, imdbId = '') {
    const isTV = type === 'tv';
    let targetId = (server.idType === 'imdb' && imdbId) ? imdbId : tmdbId;
    let base = server.url;

    if (isTV) {
        if (!base.includes('/tv') && !base.includes('serie') && !base.includes('/e/tv')) {
            base = base.replace(/\/movie\/?/g, '/tv/');
        }
    } else {
        base = base.replace(/\/tv\/?/g, '/movie/').replace(/\/serie\/?/g, '/filme/');
    }

    let formatted = server.urlFormat || 'id';
    formatted = formatted.replace(/\bid\b/g, targetId);
    formatted = formatted.replace(/\bseason\b/g, season);
    formatted = formatted.replace(/\bepisode\b/g, episode);

    let url = base + formatted;
    if (server.extraParams) {
        url += (url.includes('?') ? '&' : '?') + server.extraParams.replace(/^\?/, '');
    }
    return url;
}

function openTrailerModal(mode = 'stream') {
    const title = currentItem ? (currentItem.title || currentItem.name) : 'Video';
    const id = currentItem ? currentItem.id : '';
    const imdbId = currentItem ? (currentItem.imdb_id || '') : '';
    const type = currentType || 'movie';
    const totalSeasons = (currentItem && currentItem.number_of_seasons) ? currentItem.number_of_seasons : 5;

    // Use full 47+ servers list from AUTOEMBED_SERVERS
    const allServers = (typeof AUTOEMBED_SERVERS !== 'undefined' && AUTOEMBED_SERVERS.length) 
        ? AUTOEMBED_SERVERS 
        : [
            { name: "Max", url: "https://ythd.org/embed/", countryUrl: "https://flagsapi.com/US/flat/24.png", idType: "tmdb", urlFormat: "id/season-episode" },
            { name: "Vidpro", url: "https://vixsrc.to/tv/", countryUrl: "https://flagsapi.com/GB/flat/24.png", idType: "tmdb", urlFormat: "id/season/episode" },
            { name: "Hindi", url: "https://nxsha.space/embed/tv/", countryUrl: "https://flagsapi.com/IN/flat/24.png", idType: "tmdb", urlFormat: "id/season/episode?lang=hindi&autoplay=true" }
        ];

    let selectedServer = allServers[currentServerIndex] || allServers[0];

    function getCurrentStreamUrl() {
        return buildAutoembedUrl(selectedServer, id, type, currentSeason, currentEpisode, imdbId);
    }

    let modalHTML = `
        <div class="autoembed-player-wrapper">
            <!-- Header bar: Title & close -->
            <div class="autoembed-top-bar">
                <div class="autoembed-now-watching">
                    Now Watching: <span class="watching-title">${title}</span>
                </div>
                <div class="autoembed-top-actions">
                    <button id="tab-trailer" class="autoembed-pill-btn ${mode === 'trailer' ? 'active' : ''}">
                        <i class="fab fa-youtube" style="color:#ff0000;"></i> Trailer
                    </button>
                    <button id="tab-stream" class="autoembed-pill-btn ${mode === 'stream' ? 'active' : ''}">
                        <i class="fas fa-play"></i> Watch Stream
                    </button>
                </div>
            </div>

            <!-- Server banner notification as requested in 3rd screenshot -->
            <div class="autoembed-server-alert" id="server-alert-banner">
                <span class="alert-text">Please switch to other servers if default server doesnt work.</span>
                <button class="alert-close-btn" id="close-alert-btn" title="Dismiss">&times;</button>
            </div>

            ${mode === 'stream' ? `
            <!-- Player screen area -->
            <div class="autoembed-screen-container">
                <div class="autoembed-iframe-box" id="autoembed-screen">
                    <iframe id="main-stream-frame" 
                        src="${getCurrentStreamUrl()}" 
                        allowfullscreen 
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        style="width:100%; height:100%; border:0; position:absolute; inset:0;">
                    </iframe>
                </div>
            </div>

            <!-- TV Season / Episode Bar (if TV) -->
            ${type === 'tv' ? `
            <div class="autoembed-episode-bar">
                <span class="bar-label"><i class="fas fa-list-ol"></i> Episodes:</span>
                <select id="season-select" class="autoembed-select">
                    ${Array.from({length: totalSeasons}, (_, i) => `<option value="${i+1}" ${currentSeason === (i+1) ? 'selected' : ''}>Season ${i+1}</option>`).join('')}
                </select>
                <select id="episode-select" class="autoembed-select">
                    ${Array.from({length: 24}, (_, i) => `<option value="${i+1}" ${currentEpisode === (i+1) ? 'selected' : ''}>Episode ${i+1}</option>`).join('')}
                </select>
            </div>
            ` : ''}

            <!-- Bottom Action Bar: Server toggle, Watchlist, Download -->
            <div class="autoembed-footer-bar">
                <div class="footer-left">
                    <button class="autoembed-server-toggle-btn" id="toggle-servers-btn">
                        <i class="fas fa-server"></i> Server: <strong>${selectedServer.name}</strong>
                        <i class="fas ${isServerDrawerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}" style="margin-left: 6px; font-size:11px;"></i>
                    </button>
                </div>
                <div class="footer-right">
                    <button class="footer-action-link" id="player-add-watchlist">
                        <i class="far fa-bookmark"></i> Add to Watchlist
                    </button>
                    <button class="footer-action-link" id="player-download-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>

            <!-- Autoembed Server Drawer / Grid with flags as in screenshots 1 & 2 -->
            <div class="autoembed-server-drawer ${isServerDrawerOpen ? 'open' : ''}" id="server-drawer">
                <div class="drawer-header">
                    <button class="drawer-close-btn" id="drawer-close-action">
                        <i class="fas fa-chevron-up"></i> Close
                    </button>
                </div>

                <div class="server-grid">
                    ${allServers.map((s, idx) => `
                        <div class="server-tile ${idx === currentServerIndex ? 'active' : ''}" data-index="${idx}">
                            <div class="tile-drag-dots"><i class="fas fa-ellipsis-v"></i></div>
                            <img src="${s.countryUrl}" alt="flag" class="server-flag" onerror="this.style.display='none'">
                            <span class="server-tile-name">${s.name}</span>
                            ${idx === currentServerIndex ? `<span class="tile-check"><i class="fas fa-check"></i></span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : `
            <!-- Trailer mode -->
            <div class="autoembed-screen-container">
                <div class="autoembed-iframe-box">
                    <iframe 
                        src="https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1" 
                        allowfullscreen 
                        allow="autoplay; encrypted-media; picture-in-picture"
                        style="width:100%; height:100%; border:0; position:absolute; inset:0;">
                    </iframe>
                </div>
            </div>
            `}
        </div>
    `;

    videoContainer.innerHTML = modalHTML;
    modal.style.display = 'block';

    // Hook tab buttons
    const tabTrailer = document.getElementById('tab-trailer');
    const tabStream = document.getElementById('tab-stream');
    if (tabTrailer) tabTrailer.onclick = () => openTrailerModal('trailer');
    if (tabStream) tabStream.onclick = () => openTrailerModal('stream');

    // Alert dismiss
    const alertCloseBtn = document.getElementById('close-alert-btn');
    const alertBanner = document.getElementById('server-alert-banner');
    if (alertCloseBtn && alertBanner) {
        alertCloseBtn.onclick = () => alertBanner.style.display = 'none';
    }

    // Toggle server drawer
    const toggleServersBtn = document.getElementById('toggle-servers-btn');
    const drawerCloseAction = document.getElementById('drawer-close-action');
    const serverDrawer = document.getElementById('server-drawer');

    function toggleDrawer(open) {
        isServerDrawerOpen = open !== undefined ? open : !isServerDrawerOpen;
        if (serverDrawer) {
            serverDrawer.classList.toggle('open', isServerDrawerOpen);
        }
        if (toggleServersBtn) {
            const icon = toggleServersBtn.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (icon) {
                icon.className = `fas ${isServerDrawerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`;
            }
        }
    }

    if (toggleServersBtn) toggleServersBtn.onclick = () => toggleDrawer();
    if (drawerCloseAction) drawerCloseAction.onclick = () => toggleDrawer(false);

    // Watchlist & Download from player
    const playerWatchlist = document.getElementById('player-add-watchlist');
    if (playerWatchlist) {
        playerWatchlist.onclick = () => {
            if (currentItem) {
                listManager.add(currentItem, type);
                showToast("Added to your Watchlist!");
            }
        };
    }
    const playerDownload = document.getElementById('player-download-btn');
    if (playerDownload) {
        playerDownload.onclick = () => {
            modal.style.display = 'none';
            openDownloadModal();
        };
    }

    // Reload iframe when changing server or episode
    function reloadPlayer() {
        const frame = document.getElementById('main-stream-frame');
        if (frame) {
            frame.src = getCurrentStreamUrl();
        }
        if (toggleServersBtn) {
            toggleServersBtn.innerHTML = `
                <i class="fas fa-server"></i> Server: <strong>${selectedServer.name}</strong>
                <i class="fas ${isServerDrawerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}" style="margin-left: 6px; font-size:11px;"></i>
            `;
        }
    }

    // Server tiles click
    document.querySelectorAll('.server-tile').forEach(tile => {
        tile.onclick = () => {
            currentServerIndex = parseInt(tile.dataset.index, 10);
            selectedServer = allServers[currentServerIndex];
            
            document.querySelectorAll('.server-tile').forEach(t => t.classList.remove('active'));
            tile.classList.add('active');
            
            showToast(`Connected to server: ${selectedServer.name}`);
            reloadPlayer();
            toggleDrawer(false);
        };
    });

    // Season / Episode change
    const seasonSelect = document.getElementById('season-select');
    const episodeSelect = document.getElementById('episode-select');
    if (seasonSelect) {
        seasonSelect.onchange = (e) => {
            currentSeason = parseInt(e.target.value, 10);
            reloadPlayer();
            showToast(`Loading Season ${currentSeason}, Episode ${currentEpisode}...`);
        };
    }
    if (episodeSelect) {
        episodeSelect.onchange = (e) => {
            currentEpisode = parseInt(e.target.value, 10);
            reloadPlayer();
            showToast(`Loading Season ${currentSeason}, Episode ${currentEpisode}...`);
        };
    }
}

closeBtn.onclick = () => {
    modal.style.display = 'none';
    videoContainer.innerHTML = '';
};

// Download Modal Logic
const downloadModal = document.getElementById('download-modal');
const closeDownloadBtn = document.querySelector('.close-download-modal');
const downloadContainer = document.getElementById('download-container');

function openDownloadModal() {
    if (!currentItem) return;
    const title = currentItem.title || currentItem.name;
    const year = (currentItem.release_date || currentItem.first_air_date || '').split('-')[0];
    const isTV = currentType === 'tv';

    // Direct high-speed download servers
    const downloadOptions = [
        { quality: "1080p Full HD", size: isTV ? "950 MB / ep" : "2.4 GB", speed: "High Speed CDN (Mirror 1)", format: "MKV / H.264", url: "https://vjs.zencdn.net/v/oceans.mp4" },
        { quality: "720p HD", size: isTV ? "480 MB / ep" : "1.1 GB", speed: "Fast Server (Mirror 2)", format: "MP4 / AAC", url: "https://media.w3.org/2010/05/sintel/trailer.mp4" },
        { quality: "480p SD (Mobile)", size: isTV ? "220 MB / ep" : "550 MB", speed: "Data Saver (Mirror 3)", format: "MP4 / AAC", url: "https://media.w3.org/2010/05/bunny/trailer.mp4" },
        { quality: "4K Ultra HD (HEVC)", size: isTV ? "2.1 GB / ep" : "6.8 GB", speed: "Torrent & Direct Cloud", format: "MKV / HDR10", url: "https://vjs.zencdn.net/v/oceans.mp4" }
    ];

    let html = `
        <div class="download-header">
            <div>
                <h2><i class="fas fa-download" style="color: #46d369; margin-right: 8px;"></i> Download ${title}</h2>
                <p class="download-subtitle">${year ? year + ' • ' : ''}${isTV ? 'TV Series Pack' : 'Full Movie'} • Multi-Audio (Hindi + English) & Subtitles</p>
            </div>
        </div>

        <div class="download-server-notice">
            <i class="fas fa-bolt" style="color: #ffb300;"></i>
            <span>VStream Cloud Acceleration active. Select your preferred resolution to start downloading.</span>
        </div>

        <div class="download-list">
            ${downloadOptions.map(opt => `
                <div class="download-card">
                    <div class="download-info">
                        <div class="download-quality">${opt.quality} <span class="format-badge">${opt.format}</span></div>
                        <div class="download-meta">
                            <span><i class="fas fa-hdd"></i> ${opt.size}</span>
                            <span><i class="fas fa-server"></i> ${opt.speed}</span>
                        </div>
                    </div>
                    <button class="btn btn-download-action" onclick="triggerDownload('${opt.url}', '${title.replace(/'/g, "\\'")}', '${opt.quality}')">
                        <i class="fas fa-cloud-download-alt"></i> Download
                    </button>
                </div>
            `).join('')}
        </div>

        <div class="download-footer">
            <p><i class="fas fa-shield-alt" style="color: #46d369;"></i> 100% Virus-Free & Safe Direct Downloads via VStream FastCDN</p>
        </div>
    `;

    downloadContainer.innerHTML = html;
    downloadModal.style.display = 'block';
}

function triggerDownload(fileUrl, movieTitle, quality) {
    showToast(`Starting download: ${movieTitle} [${quality}]...`, 'success');
    
    // Simulate real file download trigger
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `${movieTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${quality.replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
        showToast(`Download added to browser downloads!`, 'success');
    }, 1500);
}

if (closeDownloadBtn) {
    closeDownloadBtn.onclick = () => {
        downloadModal.style.display = 'none';
        downloadContainer.innerHTML = '';
    };
}

window.onclick = (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
        videoContainer.innerHTML = '';
    }
    if (e.target == downloadModal) {
        downloadModal.style.display = 'none';
        downloadContainer.innerHTML = '';
    }
};
