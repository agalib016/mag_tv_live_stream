/**
 * Main LiveTV Stream Application Controller
 * Handles state, channel rendering, filtering, search, theme toggle, and favorites.
 */

class LiveTvApp {
  constructor() {
    this.allChannels = [];
    this.filteredChannels = [];
    this.favorites = JSON.parse(localStorage.getItem('liveTvFavorites') || '[]');
    this.recentChannels = JSON.parse(localStorage.getItem('liveTvRecent') || '[]');
    
    this.activeCategory = 'all';
    this.activeCountry = 'all';
    this.searchQuery = '';
    this.showingFavoritesOnly = false;
    this.currentTheme = localStorage.getItem('liveTvTheme') || 'dark';

    this.player = null;
    this.itemsPerPage = 48;
    this.currentPage = 1;

    this.init();
  }

  async init() {
    this.applyTheme(this.currentTheme);
    this.initLanguage();
    this.initPlayer();
    this.bindDomEvents();
    this.setupKeyboardShortcuts();
    await this.fetchChannels();
    this.renderRecentChannels();
  }

  initLanguage() {
    const savedLang = localStorage.getItem('liveTvLang') || 'en';
    const langSelect = document.getElementById('languageSelector');
    if (langSelect) {
      langSelect.value = savedLang;
      langSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    }
    setLanguage(savedLang);

    window.addEventListener('languageChanged', () => {
      this.updateStaticTranslations();
      this.renderChannels();
      this.renderRecentChannels();
      if (this.player && this.player.currentChannel) {
        this.player.loadChannel(this.player.currentChannel, this.player.currentServerIndex || 0);
      }
    });
  }

  initPlayer() {
    const video = document.getElementById('liveVideo');
    const container = document.getElementById('playerContainer');
    if (video && container) {
      this.player = new LivePlayer(video, container);
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('liveTvTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      const sunIcon = themeBtn.querySelector('.sun-icon');
      const moonIcon = themeBtn.querySelector('.moon-icon');
      const textSpan = themeBtn.querySelector('.theme-text');
      
      if (theme === 'dark') {
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (moonIcon) moonIcon.classList.add('hidden');
        if (textSpan) textSpan.textContent = t('dayMode');
      } else {
        if (sunIcon) sunIcon.classList.add('hidden');
        if (moonIcon) moonIcon.classList.remove('hidden');
        if (textSpan) textSpan.textContent = t('nightMode');
      }
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  async fetchChannels() {
    const grid = document.getElementById('channelGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading channels from Bangladesh, India, and Pakistan...</p>
        </div>
      `;
    }

    try {
      const res = await fetch('/api/channels');
      const data = await res.json();
      this.allChannels = data.channels || [];
      
      this.updateCounts();
      this.filterAndRender();

      // Autoload a featured channel on initial startup
      if (this.allChannels.length > 0 && this.player) {
        const initial = this.allChannels.find(c => c.featured) || this.allChannels[0];
        this.player.loadChannel(initial, 0);
      }
    } catch (e) {
      console.error('Failed to load channels:', e);
      if (grid) {
        grid.innerHTML = `
          <div class="empty-state">
            <p>Failed to connect to backend. Please reload the page.</p>
          </div>
        `;
      }
    }
  }

  updateCounts() {
    const catCounts = { all: this.allChannels.length, sports: 0, news: 0, religious: 0, entertainment: 0, others: 0 };
    this.allChannels.forEach(c => {
      const cat = (c.category || 'others').toLowerCase();
      if (catCounts[cat] !== undefined) {
        catCounts[cat]++;
      } else {
        catCounts.others++;
      }
    });

    // Update count badges on nav buttons if present
    document.querySelectorAll('[data-category-badge]').forEach(el => {
      const cat = el.getAttribute('data-category-badge');
      if (catCounts[cat] !== undefined) {
        el.textContent = catCounts[cat];
      }
    });
  }

  bindDomEvents() {
    // Theme toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Category navigation buttons (nav bar buttons requested)
    document.querySelectorAll('.nav-category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = btn.getAttribute('data-category');
        document.querySelectorAll('.nav-category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = cat;
        this.showingFavoritesOnly = false;
        const favFilterBtn = document.getElementById('filterFavoritesBtn');
        if (favFilterBtn) favFilterBtn.classList.remove('active');
        this.currentPage = 1;
        this.filterAndRender();
      });
    });

    // Country filter pills
    document.querySelectorAll('.country-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const country = pill.getAttribute('data-country');
        document.querySelectorAll('.country-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCountry = country;
        this.currentPage = 1;
        this.filterAndRender();
      });
    });

    // Search input
    const searchInput = document.getElementById('channelSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (clearSearchBtn) {
          clearSearchBtn.classList.toggle('hidden', this.searchQuery.length === 0);
        }
        this.currentPage = 1;
        this.filterAndRender();
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          clearSearchBtn.classList.add('hidden');
          this.currentPage = 1;
          this.filterAndRender();
        }
      });
    }

    // Favorites tab button
    const favFilterBtn = document.getElementById('filterFavoritesBtn');
    if (favFilterBtn) {
      favFilterBtn.addEventListener('click', () => {
        this.showingFavoritesOnly = !this.showingFavoritesOnly;
        favFilterBtn.classList.toggle('active', this.showingFavoritesOnly);
        if (this.showingFavoritesOnly) {
          document.querySelectorAll('.nav-category-btn').forEach(b => b.classList.remove('active'));
        } else {
          const defaultCatBtn = document.querySelector(`.nav-category-btn[data-category="${this.activeCategory}"]`);
          if (defaultCatBtn) defaultCatBtn.classList.add('active');
        }
        this.currentPage = 1;
        this.filterAndRender();
      });
    }

    // Reset filters button in empty state
    document.addEventListener('click', (e) => {
      if (e.target.matches('#resetFiltersBtn') || e.target.closest('#resetFiltersBtn')) {
        this.resetFilters();
      }
    });

    // Custom M3U8 modal
    this.setupCustomModal();
    this.setupShortcutsModal();
  }

  resetFilters() {
    this.activeCategory = 'all';
    this.activeCountry = 'all';
    this.searchQuery = '';
    this.showingFavoritesOnly = false;
    this.currentPage = 1;

    const searchInput = document.getElementById('channelSearchInput');
    if (searchInput) searchInput.value = '';
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');

    document.querySelectorAll('.nav-category-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-category') === 'all');
    });
    document.querySelectorAll('.country-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-country') === 'all');
    });
    const favFilterBtn = document.getElementById('filterFavoritesBtn');
    if (favFilterBtn) favFilterBtn.classList.remove('active');

    this.filterAndRender();
  }

  filterAndRender() {
    let result = this.allChannels;

    // Filter by favorites if toggled
    if (this.showingFavoritesOnly) {
      result = result.filter(c => this.favorites.includes(c.id));
    } else {
      // Filter by category
      if (this.activeCategory && this.activeCategory !== 'all') {
        result = result.filter(c => (c.category || '').toLowerCase() === this.activeCategory);
      }
    }

    // Filter by country
    if (this.activeCountry && this.activeCountry !== 'all') {
      result = result.filter(c => (c.country_code || '').toLowerCase() === this.activeCountry);
    }

    // Filter by search query
    if (this.searchQuery) {
      result = result.filter(c => {
        const name = (c.name || '').toLowerCase();
        const country = (c.country || '').toLowerCase();
        const category = (c.category || '').toLowerCase();
        const group = (c.group || '').toLowerCase();
        return name.includes(this.searchQuery) ||
               country.includes(this.searchQuery) ||
               category.includes(this.searchQuery) ||
               group.includes(this.searchQuery);
      });
    }

    this.filteredChannels = result;
    this.renderChannels();
  }

  renderChannels() {
    const grid = document.getElementById('channelGrid');
    const countLabel = document.getElementById('channelCountLabel');
    if (!grid) return;

    if (countLabel) {
      countLabel.textContent = t('showingChannels', { count: this.filteredChannels.length });
    }

    if (this.filteredChannels.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📺</div>
          <h3>${t('noChannelsFound')}</h3>
          <p>${this.showingFavoritesOnly ? t('noFavorites') : 'Try adjusting your search terms or category filters.'}</p>
          <button id="resetFiltersBtn" class="btn btn-primary">${t('resetFilters')}</button>
        </div>
      `;
      return;
    }

    // Pagination slice
    const totalToShow = this.currentPage * this.itemsPerPage;
    const items = this.filteredChannels.slice(0, totalToShow);

    let html = items.map(c => this.createChannelCard(c)).join('');

    // Append "Load More" button if more channels exist
    if (totalToShow < this.filteredChannels.length) {
      html += `
        <div class="load-more-wrapper">
          <button id="loadMoreChannelsBtn" class="btn btn-outline load-more-btn">
            Load More (${this.filteredChannels.length - totalToShow} remaining)
          </button>
        </div>
      `;
    }

    grid.innerHTML = html;

    // Attach card event listeners
    grid.querySelectorAll('.channel-card').forEach(card => {
      const channelId = card.getAttribute('data-id');
      const channel = this.allChannels.find(c => c.id === channelId);

      // Card click -> play
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-fav-btn')) return; // Ignore if heart clicked
        if (channel && this.player) {
          this.player.loadChannel(channel, 0);
          // Highlight current active card
          document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('now-playing-card'));
          card.classList.add('now-playing-card');
          // Smooth scroll player container into view on mobile
          if (window.innerWidth < 768) {
            document.getElementById('playerSection').scrollIntoView({ behavior: 'smooth' });
          }
        }
      });

      // Favorite toggle button on card
      const favBtn = card.querySelector('.card-fav-btn');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleFavorite(channelId);
          favBtn.classList.toggle('favorited', this.isFavorite(channelId));
          if (this.showingFavoritesOnly) {
            this.filterAndRender();
          }
        });
      }
    });

    const loadMoreBtn = document.getElementById('loadMoreChannelsBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.currentPage++;
        this.renderChannels();
      });
    }
  }

  createChannelCard(channel) {
    const isPlaying = this.player && this.player.currentChannel && this.player.currentChannel.id === channel.id;
    const isFav = this.isFavorite(channel.id);
    const catClass = `cat-${(channel.category || 'others').toLowerCase()}`;
    const localizedCat = t(channel.category) || channel.category;
    const localizedCountry = t((channel.country || '').toLowerCase()) || channel.country;
    const fallbackSeed = encodeURIComponent(channel.name);

    return `
      <div class="channel-card ${isPlaying ? 'now-playing-card' : ''}" data-id="${channel.id}">
        <div class="card-logo-container">
          <img 
            src="${channel.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${fallbackSeed}`}" 
            alt="${channel.name}" 
            class="channel-logo" 
            loading="lazy"
            onerror="this.src='https://api.dicebear.com/7.x/identicon/svg?seed=${fallbackSeed}'"
          />
          <button class="card-fav-btn ${isFav ? 'favorited' : ''}" title="${isFav ? t('unfavorite') : t('favorite')}">
            <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <div class="card-hover-overlay">
            <span class="play-icon-glow">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
          </div>
        </div>
        <div class="card-info">
          <h4 class="channel-title" title="${channel.name}">${channel.name}</h4>
          <div class="card-tags">
            <span class="tag-badge ${catClass}">${localizedCat}</span>
            <span class="country-tag">${channel.flag || '📺'} ${localizedCountry}</span>
          </div>
        </div>
      </div>
    `;
  }

  isFavorite(channelId) {
    return this.favorites.includes(channelId);
  }

  toggleFavorite(channelId) {
    const idx = this.favorites.indexOf(channelId);
    if (idx > -1) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.push(channelId);
    }
    localStorage.setItem('liveTvFavorites', JSON.stringify(this.favorites));
    
    // Update count indicator on favorites button
    const favCountBadge = document.getElementById('favCountBadge');
    if (favCountBadge) {
      favCountBadge.textContent = this.favorites.length;
    }

    if (this.player) {
      this.player.updateFavoriteState();
    }
  }

  addRecent(channel) {
    if (!channel || !channel.id) return;
    this.recentChannels = this.recentChannels.filter(c => c.id !== channel.id);
    this.recentChannels.unshift({
      id: channel.id,
      name: channel.name,
      logo: channel.logo,
      stream_url: channel.stream_url,
      category: channel.category,
      country: channel.country,
      flag: channel.flag
    });
    if (this.recentChannels.length > 8) {
      this.recentChannels = this.recentChannels.slice(0, 8);
    }
    localStorage.setItem('liveTvRecent', JSON.stringify(this.recentChannels));
    this.renderRecentChannels();
  }

  clearRecent() {
    this.recentChannels = [];
    localStorage.removeItem('liveTvRecent');
    this.renderRecentChannels();
  }

  renderRecentChannels() {
    const container = document.getElementById('recentChannelsList');
    const section = document.getElementById('recentChannelsSection');
    if (!container || !section) return;

    if (this.recentChannels.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    container.innerHTML = this.recentChannels.map(c => `
      <div class="recent-pill" data-id="${c.id}" title="${c.name}">
        <span class="recent-flag">${c.flag || '📺'}</span>
        <span class="recent-name">${c.name}</span>
      </div>
    `).join('');

    container.querySelectorAll('.recent-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const id = pill.getAttribute('data-id');
        const channel = this.allChannels.find(ch => ch.id === id) || this.recentChannels.find(ch => ch.id === id);
        if (channel && this.player) {
          this.player.loadChannel(channel, 0);
        }
      });
    });

    const clearBtn = document.getElementById('clearRecentBtn');
    if (clearBtn) {
      clearBtn.onclick = () => this.clearRecent();
    }
  }

  setupCustomModal() {
    const openBtn = document.getElementById('openCustomModalBtn');
    const modal = document.getElementById('customStreamModal');
    const closeBtn = document.getElementById('closeCustomModalBtn');
    const cancelBtn = document.getElementById('cancelCustomModalBtn');
    const form = document.getElementById('customStreamForm');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    const closeModal = () => modal && modal.classList.add('hidden');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('customChannelName').value.trim() || 'Custom Stream';
        const url = document.getElementById('customStreamUrl').value.trim();
        if (!url) return;

        const customChannel = {
          id: `custom_${Date.now()}`,
          name: name,
          stream_url: url,
          category: 'others',
          country: 'Custom',
          country_code: 'bd',
          flag: '⚡',
          logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`
        };

        this.allChannels.unshift(customChannel);
        this.filterAndRender();
        if (this.player) {
          this.player.loadChannel(customChannel, 0);
        }
        closeModal();
        form.reset();
      });
    }
  }

  setupShortcutsModal() {
    const openBtn = document.getElementById('openShortcutsModalBtn');
    const modal = document.getElementById('shortcutsModal');
    const closeBtn = document.getElementById('closeShortcutsModalBtn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    const closeModal = () => modal && modal.classList.add('hidden');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
      const customModal = document.getElementById('customStreamModal');
      if (e.target === customModal) customModal.classList.add('hidden');
    });
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if typing inside an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (this.player) this.player.togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        if (this.player) this.player.toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        if (this.player) this.player.toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        if (this.player) this.player.toggleTheater();
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('channelSearchInput');
        if (searchInput) searchInput.focus();
      } else if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(m => m.classList.add('hidden'));
      }
    });
  }

  updateStaticTranslations() {
    const favCountBadge = document.getElementById('favCountBadge');
    if (favCountBadge) {
      favCountBadge.textContent = this.favorites.length;
    }
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new LiveTvApp();
});
