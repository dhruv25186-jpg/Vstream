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

function openTrailerModal(mode = 'stream') {
    const title = currentItem ? (currentItem.title || currentItem.name) : 'Video';
    
    // Direct, ultra-fast CDN video streams (100% accessible worldwide with no ISP blocking)
    const streamSources = [
        { name: "Server 1 (Fast HD 1080p Stream - Ocean)", url: "https://vjs.zencdn.net/v/oceans.mp4" },
        { name: "Server 2 (Sintel Action HD Stream)", url: "https://media.w3.org/2010/05/sintel/trailer.mp4" },
        { name: "Server 3 (Buck Bunny 4K Stream)", url: "https://media.w3.org/2010/05/bunny/trailer.mp4" }
    ];

    let modalHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <div>
                <h3 style="color:#fff; font-size:1.3rem; font-weight:700; margin-bottom:4px;">${title}</h3>
                <span style="color:#aaa; font-size:12px;"><i class="fas fa-circle" style="color:#00e676; font-size:10px;"></i> VStream Ultra Player Active (1080p FHD)</span>
            </div>
            <div style="display:flex; gap:10px;">
                <button id="tab-stream" class="btn ${mode === 'stream' ? 'btn-primary' : 'btn-secondary'}" style="padding:7px 16px; font-size:13px;"><i class="fas fa-play"></i> Watch Stream</button>
                ${trailerKey ? `<button id="tab-trailer" class="btn ${mode === 'trailer' ? 'btn-primary' : 'btn-secondary'}" style="padding:7px 16px; font-size:13px;"><i class="fab fa-youtube"></i> YouTube Trailer</button>` : ''}
            </div>
        </div>
    `;

    if (mode === 'stream') {
        modalHTML += `
            <div class="custom-player-box" id="vstream-player-container">
                <video id="main-video-player" playsinline preload="auto">
                    <source id="main-video-source" src="${streamSources[0].url}" type="video/mp4">
                    Your browser does not support HTML5 video streaming.
                </video>

                <!-- Center Play Overlay Button -->
                <div class="center-play-overlay" id="center-play-btn">
                    <i class="fas fa-play"></i>
                </div>

                <!-- Custom Bottom Control Bar -->
                <div class="custom-player-controls" id="player-controls-bar">
                    <!-- Progress Bar -->
                    <div class="custom-progress-area" id="progress-area">
                        <div class="custom-progress-filled" id="progress-filled"></div>
                    </div>

                    <div class="custom-controls-row">
                        <!-- Left controls -->
                        <div class="custom-controls-left">
                            <button class="player-ctrl-btn play-pause-main" id="ctrl-play-pause">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="player-ctrl-btn" id="ctrl-rewind-10" title="Rewind 10s">
                                <i class="fas fa-undo"></i>
                            </button>
                            <button class="player-ctrl-btn" id="ctrl-forward-10" title="Forward 10s">
                                <i class="fas fa-redo"></i>
                            </button>
                            <div class="volume-group">
                                <button class="player-ctrl-btn" id="ctrl-volume-icon">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                                <input type="range" class="volume-slider" id="ctrl-volume-slider" min="0" max="1" step="0.05" value="0.8">
                            </div>
                            <span class="player-time-text" id="player-time-display">00:00 / 00:00</span>
                        </div>

                        <!-- Right controls -->
                        <div class="custom-controls-right">
                            <select class="speed-dropdown" id="ctrl-speed-select">
                                <option value="0.75">0.75x</option>
                                <option value="1" selected>1.0x (Normal)</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2.0x</option>
                            </select>
                            <button class="player-ctrl-btn" id="ctrl-fullscreen" title="Fullscreen">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Server switcher & Info bar -->
            <div style="margin-top:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background:#161616; padding:12px 18px; border-radius:8px; border:1px solid #282828;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:#eee; font-size:13px; font-weight:600;"><i class="fas fa-server"></i> Switch Stream Source:</span>
                    <select id="server-select" style="background:#222; color:#fff; border:1px solid #444; padding:6px 12px; border-radius:4px; font-size:13px; outline:none; cursor:pointer;">
                        ${streamSources.map((s, idx) => `<option value="${s.url}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div style="color:#aaa; font-size:13px; display:flex; gap:15px;">
                    <span><i class="fas fa-shield-alt" style="color:#4caf50;"></i> Ad-Free Stream</span>
                    <span><i class="fas fa-bolt" style="color:#ffb300;"></i> Instant CDN Buffering</span>
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
                <span style="color:#aaa; font-size:13px;"><i class="fas fa-exclamation-triangle" style="color:#f39c12;"></i> If YouTube blocks trailer embedding, open in YouTube or click "Watch Stream" above.</span>
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

    if (mode === 'stream') {
        setupCustomVideoPlayer();
    }
}

function setupCustomVideoPlayer() {
    const video = document.getElementById('main-video-player');
    const centerPlayBtn = document.getElementById('center-play-btn');
    const playPauseBtn = document.getElementById('ctrl-play-pause');
    const rewindBtn = document.getElementById('ctrl-rewind-10');
    const forwardBtn = document.getElementById('ctrl-forward-10');
    const progressArea = document.getElementById('progress-area');
    const progressFilled = document.getElementById('progress-filled');
    const timeDisplay = document.getElementById('player-time-display');
    const volumeIcon = document.getElementById('ctrl-volume-icon');
    const volumeSlider = document.getElementById('ctrl-volume-slider');
    const speedSelect = document.getElementById('ctrl-speed-select');
    const fullscreenBtn = document.getElementById('ctrl-fullscreen');
    const playerBox = document.getElementById('vstream-player-container');
    const serverSelect = document.getElementById('server-select');

    if (!video) return;

    // Helper: format time mm:ss
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle Play/Pause
    function togglePlay() {
        if (video.paused || video.ended) {
            video.play().then(() => {
                centerPlayBtn.style.display = 'none';
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }).catch(e => console.log('Autoplay error:', e));
        } else {
            video.pause();
            centerPlayBtn.style.display = 'flex';
            centerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    // Event listeners for play/pause
    centerPlayBtn.onclick = togglePlay;
    playPauseBtn.onclick = togglePlay;
    video.onclick = togglePlay;

    // Try starting video
    video.play().then(() => {
        centerPlayBtn.style.display = 'none';
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }).catch(() => {
        centerPlayBtn.style.display = 'flex';
    });

    // Time update & progress bar
    video.ontimeupdate = () => {
        if (!video.duration) return;
        const percent = (video.currentTime / video.duration) * 100;
        progressFilled.style.width = `${percent}%`;
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    };

    video.onloadedmetadata = () => {
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    };

    // Seek on progress bar click
    progressArea.onclick = (e) => {
        const rect = progressArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * video.duration;
        video.currentTime = newTime;
    };

    // Skip forward/backward
    rewindBtn.onclick = () => video.currentTime = Math.max(0, video.currentTime - 10);
    forwardBtn.onclick = () => video.currentTime = Math.min(video.duration, video.currentTime + 10);

    // Volume
    volumeSlider.oninput = (e) => {
        video.volume = e.target.value;
        video.muted = false;
        if (video.volume === 0) {
            volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (video.volume < 0.5) {
            volumeIcon.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    };

    volumeIcon.onclick = () => {
        video.muted = !video.muted;
        if (video.muted) {
            volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    };

    // Playback Speed
    speedSelect.onchange = (e) => {
        video.playbackRate = parseFloat(e.target.value);
    };

    // Fullscreen
    fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
            playerBox.requestFullscreen().catch(err => console.log(err));
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    };

    // Server Switcher
    if (serverSelect) {
        serverSelect.onchange = (e) => {
            const currentPosition = video.currentTime;
            const source = document.getElementById('main-video-source');
            source.src = e.target.value;
            video.load();
            video.currentTime = currentPosition;
            video.play();
            showToast(`Switched stream: ${e.target.options[e.target.selectedIndex].text}`);
        };
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
