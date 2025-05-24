        // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // API Configuration
        const API_BASE_URL = 'https://api.jikan.moe/v4';
        let currentSlide = 0;
        let featuredAnime = [];
        let currentAnimeId = null;
        let apiKey = localStorage.getItem('animehub_api_key') || '';

        // Initialize API key input
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKeyBtn = document.getElementById('apiKeyBtn');
        
        if (apiKey) {
            apiKeyInput.value = apiKey;
        }
        
        apiKeyBtn.addEventListener('click', () => {
            apiKey = apiKeyInput.value.trim();
            localStorage.setItem('animehub_api_key', apiKey);
            alert('API key saved successfully!');
        });

        // Enhanced fetch function with API key
        async function fetchWithKey(url) {
            try {
                const headers = {};
                if (apiKey) {
                    headers['X-API-Key'] = apiKey;
                }
                
                const response = await fetch(url, { headers });
                
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Fetch error:', error);
                throw error;
            }
        }

        // Fetch Popular Anime
        async function fetchPopularAnime() {
            try {
                const data = await fetchWithKey(`${API_BASE_URL}/top/anime?filter=airing&limit=8`);
                displayAnime(data.data, 'popularAnime');
            } catch (error) {
                console.error('Error fetching popular anime:', error);
                document.getElementById('popularAnime').innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                        <p>Failed to load popular anime. ${error.message}</p>
                    </div>
                `;
            }
        }

        // Fetch Top Rated Anime
        async function fetchTopAnime() {
            try {
                const data = await fetchWithKey(`${API_BASE_URL}/top/anime?limit=8`);
                displayAnime(data.data, 'topAnime');
            } catch (error) {
                console.error('Error fetching top anime:', error);
                document.getElementById('topAnime').innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                        <p>Failed to load top anime. ${error.message}</p>
                    </div>
                `;
            }
        }

        // Fetch Upcoming Anime
        async function fetchUpcomingAnime() {
            try {
                const data = await fetchWithKey(`${API_BASE_URL}/seasons/upcoming?limit=8`);
                displayAnime(data.data, 'upcomingAnime');
            } catch (error) {
                console.error('Error fetching upcoming anime:', error);
                document.getElementById('upcomingAnime').innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                        <p>Failed to load upcoming anime. ${error.message}</p>
                    </div>
                `;
            }
        }

        // Fetch Featured Anime for Slider
        async function fetchFeaturedAnime() {
            try {
                const data = await fetchWithKey(`${API_BASE_URL}/top/anime?filter=airing&limit=5`);
                featuredAnime = data.data;
                initSlider();
            } catch (error) {
                console.error('Error fetching featured anime:', error);
                document.querySelector('.slider-container').innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                        <p>Failed to load featured anime. ${error.message}</p>
                    </div>
                `;
            }
        }

        // Search Anime
        async function searchAnime(query) {
            try {
                document.getElementById('searchResultsContainer').innerHTML = `
                    <div class="loading">
                        <div class="spinner"></div>
                        Searching for "${query}"...
                    </div>
                `;
                
                // Hide other sections and show search results
                document.querySelectorAll('.container:not(.search-results)').forEach(el => {
                    el.style.display = 'none';
                });
                document.getElementById('searchResults').style.display = 'block';
                
                const data = await fetchWithKey(`${API_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=12`);
                
                if (data.data.length === 0) {
                    document.getElementById('searchResultsContainer').innerHTML = `
                        <div class="card" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                            <i class="fas fa-search" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                            <p>No results found for "${query}". Try a different search term.</p>
                        </div>
                    `;
                } else {
                    displayAnime(data.data, 'searchResultsContainer');
                    document.getElementById('resultsCount').textContent = `Found ${data.pagination.items.total} results for "${query}"`;
                }
            } catch (error) {
                console.error('Error searching anime:', error);
                document.getElementById('searchResultsContainer').innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                        <p>Search failed. ${error.message}</p>
                    </div>
                `;
            }
        }

        // Display Anime in Gallery
        function displayAnime(animeList, containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            
            animeList.forEach(anime => {
                const animeCard = document.createElement('div');
                animeCard.className = 'anime-card';
                animeCard.innerHTML = `
                    <img src="${anime.images?.jpg?.large_image_url || 'https://via.placeholder.com/300x450'}" alt="${anime.title}" class="anime-card-img">
                    <div class="anime-card-content">
                        <h3 class="anime-card-title">${anime.title}</h3>
                        <div class="anime-card-meta">
                            <span>${anime.type || 'Unknown'} • ${anime.episodes || '?'} eps</span>
                            <span class="anime-card-score"><i class="fas fa-star"></i> ${anime.score || 'N/A'}</span>
                        </div>
                        <p class="anime-card-synopsis">${anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'No synopsis available.'}</p>
                        <button class="anime-card-btn" onclick="showAnimeDetails(${anime.mal_id})">View Details</button>
                    </div>
                `;
                container.appendChild(animeCard);
            });
        }

        // Initialize Slider
        function initSlider() {
            const slider = document.getElementById('featuredSlider');
            const dotsContainer = document.getElementById('sliderDots');
            
            slider.innerHTML = '';
            dotsContainer.innerHTML = '';
            
            featuredAnime.forEach((anime, index) => {
                // Create slider item
                const sliderItem = document.createElement('div');
                sliderItem.className = 'slider-item';
                sliderItem.innerHTML = `
                    <img src="${anime.images?.jpg?.large_image_url || 'https://via.placeholder.com/1200x400'}" alt="${anime.title}" class="slider-img">
                    <div class="slider-content">
                        <h2 class="slider-title">${anime.title}</h2>
                        <div class="slider-meta">
                            <span class="slider-meta-item"><i class="fas fa-tv"></i> ${anime.type || 'Unknown'}</span>
                            <span class="slider-meta-item"><i class="fas fa-star"></i> ${anime.score || 'N/A'}</span>
                            <span class="slider-meta-item"><i class="fas fa-calendar-alt"></i> ${anime.aired?.string || 'Unknown'}</span>
                        </div>
                        <p class="slider-description">${anime.synopsis ? anime.synopsis.substring(0, 200) + '...' : ''}</p>
                        <button class="slider-btn" onclick="showAnimeDetails(${anime.mal_id})">View Details</button>
                    </div>
                `;
                slider.appendChild(sliderItem);
                
                // Create dot
                const dot = document.createElement('div');
                dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => {
                    goToSlide(index);
                });
                dotsContainer.appendChild(dot);
            });
            
            // Set initial slide
            goToSlide(0);
        }

        // Go to specific slide
        function goToSlide(index) {
            const slides = document.querySelectorAll('.slider-item');
            const dots = document.querySelectorAll('.slider-dot');
            
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;
            
            currentSlide = index;
            
            slides.forEach((slide, i) => {
                slide.style.transform = `translateX(${100 * (i - index)}%)`;
            });
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        // Next slide
        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        // Previous slide
        function prevSlide() {
            goToSlide(currentSlide - 1);
        }

        // Show anime details in modal
        async function showAnimeDetails(animeId) {
            try {
                currentAnimeId = animeId;
                const modal = document.getElementById('animeModal');
                const { data } = await fetchWithKey(`${API_BASE_URL}/anime/${animeId}/full`);
                
                // Set basic info
                document.getElementById('modalTitle').textContent = data.title || 'Unknown Title';
                document.getElementById('modalBackdrop').src = data.images?.jpg?.large_image_url || 'https://via.placeholder.com/900x300';
                document.getElementById('modalPoster').src = data.images?.jpg?.image_url || 'https://via.placeholder.com/150x220';
                document.getElementById('modalDescription').textContent = data.synopsis || 'No synopsis available.';
                
                // Set meta info
                const metaContainer = document.getElementById('modalMeta');
                metaContainer.innerHTML = `
                    <div class="modal-meta-item">
                        <i class="fas fa-tv"></i> ${data.type || 'Unknown'}
                    </div>
                    <div class="modal-meta-item">
                        <i class="fas fa-star"></i> ${data.score || 'N/A'}
                    </div>
                    <div class="modal-meta-item">
                        <i class="fas fa-calendar-alt"></i> ${data.aired?.string || 'Unknown date'}
                    </div>
                    <div class="modal-meta-item">
                        <i class="fas fa-clock"></i> ${data.duration || 'Unknown duration'}
                    </div>
                `;
                
                // Set stats
                const statsContainer = document.getElementById('modalStats');
                statsContainer.innerHTML = `
                    <div class="stat-item">
                        <div class="stat-value">${data.rank || 'N/A'}</div>
                        <div class="stat-label">Rank</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${data.popularity || 'N/A'}</div>
                        <div class="stat-label">Popularity</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${data.members ? data.members.toLocaleString() : 'N/A'}</div>
                        <div class="stat-label">Members</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${data.favorites ? data.favorites.toLocaleString() : 'N/A'}</div>
                        <div class="stat-label">Favorites</div>
                    </div>
                `;
                
                // Set trailer if available
                const trailerSection = document.getElementById('trailerSection');
                const trailer = document.getElementById('modalTrailer');
                if (data.trailer?.embed_url) {
                    trailer.src = data.trailer.embed_url;
                    trailerSection.style.display = 'block';
                } else {
                    trailerSection.style.display = 'none';
                }
                
                // Load episodes
                await loadEpisodes(animeId);
                
                // Show modal
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } catch (error) {
                console.error('Error fetching anime details:', error);
                alert(`Failed to load anime details. ${error.message}`);
            }
        }

        // Load episodes for anime
        async function loadEpisodes(animeId) {
            try {
                const episodeList = document.getElementById('episodeList');
                episodeList.innerHTML = `
                    <div class="loading">
                        <div class="spinner"></div>
                        Loading episodes...
                    </div>
                `;
                
                // First try to get episodes from the API
                try {
                    const { data } = await fetchWithKey(`${API_BASE_URL}/anime/${animeId}/episodes`);
                    
                    if (data && data.length > 0) {
                        displayEpisodes(data);
                        return;
                    }
                } catch (episodeError) {
                    console.log('Official episodes not available, trying alternative');
                }
                
                // Fallback to generating placeholder episodes
                const animeData = await fetchWithKey(`${API_BASE_URL}/anime/${animeId}`);
                const episodesCount = animeData.data.episodes || 12;
                const placeholderEpisodes = [];
                
                for (let i = 1; i <= episodesCount; i++) {
                    placeholderEpisodes.push({
                        mal_id: i,
                        title: `Episode ${i}`,
                        episode: i,
                        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(animeData.data.title + ' episode ' + i)}`
                    });
                }
                
                displayEpisodes(placeholderEpisodes);
            } catch (error) {
                console.error('Error loading episodes:', error);
                document.getElementById('episodeList').innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                        <p>Failed to load episodes. ${error.message}</p>
                    </div>
                `;
            }
        }

        // Display episodes
        function displayEpisodes(episodes) {
            const episodeList = document.getElementById('episodeList');
            episodeList.innerHTML = '';
            
            if (!episodes || episodes.length === 0) {
                episodeList.innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                        <i class="fas fa-info-circle" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                        <p>No episodes information available.</p>
                    </div>
                `;
                return;
            }
            
            episodes.slice(0, 24).forEach(ep => {
                const episodeCard = document.createElement('div');
                episodeCard.className = 'episode-card';
                
                // Try to find a YouTube URL in the episode data
                let youtubeUrl = '';
                if (ep.url && ep.url.includes('youtube.com')) {
                    youtubeUrl = ep.url;
                } else {
                    // Fallback to search query
                    const animeTitle = document.getElementById('modalTitle').textContent;
                    youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(animeTitle + ' episode ' + ep.episode)}`;
                }
                
                episodeCard.innerHTML = `
                    <img src="https://via.placeholder.com/300x150?text=Episode+${ep.episode}" alt="Episode ${ep.episode}" class="episode-thumbnail" onclick="playEpisode('${youtubeUrl}')">
                    <div class="episode-content">
                        <h3 class="episode-title">${ep.title || `Episode ${ep.episode}`}</h3>
                        <div class="episode-meta">
                            <span>Episode ${ep.episode}</span>
                            <span>${ep.aired ? new Date(ep.aired).toLocaleDateString() : ''}</span>
                        </div>
                        <button class="watch-btn" onclick="playEpisode('${youtubeUrl}')">
                            <i class="fas fa-play"></i> Watch
                        </button>
                    </div>
                `;
                episodeList.appendChild(episodeCard);
            });
            
            // Show "View More" if there are more episodes
            if (episodes.length > 24) {
                const viewMoreCard = document.createElement('div');
                viewMoreCard.className = 'episode-card';
                viewMoreCard.style.display = 'flex';
                viewMoreCard.style.alignItems = 'center';
                viewMoreCard.style.justifyContent = 'center';
                viewMoreCard.style.flexDirection = 'column';
                viewMoreCard.style.cursor = 'pointer';
                viewMoreCard.innerHTML = `
                    <div style="font-size: 2rem; margin-bottom: 10px;"><i class="fas fa-ellipsis-h"></i></div>
                    <div>View ${episodes.length - 24} more episodes</div>
                `;
                viewMoreCard.addEventListener('click', () => {
                    displayEpisodes(episodes);
                });
                episodeList.appendChild(viewMoreCard);
            }
        }

        // Play episode in video modal
        function playEpisode(url) {
            const videoModal = document.getElementById('videoModal');
            const videoPlayer = document.getElementById('videoPlayer');
            
            // Extract video ID if it's a direct YouTube URL
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
                videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
                videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            } else {
                // For search results, we'll just open in new tab
                window.open(url, '_blank');
                return;
            }
            
            videoModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Close video modal
        function closeVideoModal() {
            const videoModal = document.getElementById('videoModal');
            const videoPlayer = document.getElementById('videoPlayer');
            
            videoPlayer.src = '';
            videoModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Close anime modal
        function closeModal() {
            const modal = document.getElementById('animeModal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Pause trailer if it's playing
            const trailer = document.getElementById('modalTrailer');
            trailer.src = '';
        }

        // Event Listeners
        document.getElementById('prevSlide').addEventListener('click', prevSlide);
        document.getElementById('nextSlide').addEventListener('click', nextSlide);
        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('videoClose').addEventListener('click', closeVideoModal);
        
        // Main search functionality
        document.getElementById('mainSearchBtn').addEventListener('click', () => {
            const query = document.getElementById('mainSearchInput').value.trim();
            if (query) {
                searchAnime(query);
            }
        });
        
        document.getElementById('mainSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = document.getElementById('mainSearchInput').value.trim();
                if (query) {
                    searchAnime(query);
                }
            }
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('animeModal');
            const videoModal = document.getElementById('videoModal');
            
            if (e.target === modal) {
                closeModal();
            }
            
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'Escape') {
                closeModal();
                closeVideoModal();
            }
        });

        // Auto-advance slider
        let slideInterval = setInterval(nextSlide, 5000);

        // Pause auto-advance when hovering over slider
        const sliderContainer = document.querySelector('.slider-container');
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });

        // Initialize the page
        document.addEventListener('DOMContentLoaded', () => {
            fetchPopularAnime();
            fetchTopAnime();
            fetchUpcomingAnime();
            fetchFeaturedAnime();
        });