/**
 * High-performance Video Player wrapper with HLS.js,
 * Multi-Server failover, anti-buffering optimization, theater mode, pip, and live status.
 */

class LivePlayer {
  constructor(videoElement, containerElement) {
    this.video = videoElement;
    this.container = containerElement;
    this.hls = null;
    this.currentChannel = null;
    this.currentServers = [];
    this.currentServerIndex = 0;
    this.useProxy = false;
    this.isMuted = false;
    this.previousVolume = 1.0;
    this.retryCount = 0;
    this.maxRetries = 2;
    this.viewerInterval = null;
    this.simulatedViewers = 1240;

    // Buffering & stall detection timers
    this.bufferStallTimer = null;
    this.toastTimeout = null;

    this.initElements();
    this.bindEvents();
    this.startViewerSimulation();
  }

  initElements() {
    this.playPauseBtn = document.getElementById('playerPlayPauseBtn');
    this.muteBtn = document.getElementById('playerMuteBtn');
    this.volumeSlider = document.getElementById('playerVolumeSlider');
    this.fullscreenBtn = document.getElementById('playerFullscreenBtn');
    this.theaterBtn = document.getElementById('playerTheaterBtn');
    this.pipBtn = document.getElementById('playerPipBtn');
    this.reloadBtn = document.getElementById('playerReloadBtn');
    this.proxyToggleBtn = document.getElementById('playerProxyToggleBtn');
    this.favToggleBtn = document.getElementById('playerFavToggleBtn');

    // Server controls
    this.serverBtn = document.getElementById('playerServerBtn');
    this.serverText = document.getElementById('playerServerText');
    this.serverDropdown = document.getElementById('serverMenuDropdown');
    this.serverOptionsList = document.getElementById('serverOptionsList');
    this.serverBadge = document.getElementById('playerServerBadge');
    this.nextServerBtn = document.getElementById('playerNextServerBtn');
    this.playerToast = document.getElementById('playerToast');
    this.playerToastMsg = document.getElementById('playerToastMsg');

    this.streamStatusBadge = document.getElementById('streamStatusBadge');
    this.viewerCountEl = document.getElementById('playerViewerCount');
    this.channelTitleEl = document.getElementById('playerChannelTitle');
    this.channelCategoryEl = document.getElementById('playerChannelCategory');
    this.channelCountryEl = document.getElementById('playerChannelCountry');
    this.channelLogoEl = document.getElementById('playerChannelLogo');
    this.resolutionBadge = document.getElementById('playerResolutionBadge');

    this.qualityBtn = document.getElementById('playerQualityBtn');
    this.qualityText = document.getElementById('playerQualityText');
    this.qualityDropdown = document.getElementById('qualityMenuDropdown');
    this.qualityOptionsList = document.getElementById('qualityOptionsList');
    this.currentResolution = 'auto';

    this.errorOverlay = document.getElementById('playerErrorOverlay');
    this.errorTitle = document.getElementById('playerErrorTitle');
    this.errorDesc = document.getElementById('playerErrorDesc');
    this.retryBtn = document.getElementById('playerRetryBtn');
    this.switchProxyBtn = document.getElementById('playerSwitchProxyBtn');
    this.testStreamBtn = document.getElementById('playerTestStreamBtn');
    this.loadingSpinner = document.getElementById('playerLoadingSpinner');
  }

  bindEvents() {
    // Play / Pause
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    }
    this.video.addEventListener('click', () => this.togglePlay());

    // Mute / Volume
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => this.toggleMute());
    }
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.video.volume = val;
        this.video.muted = val === 0;
        this.updateVolumeIcons();
      });
    }

    // Fullscreen
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }
    document.addEventListener('fullscreenchange', () => {
      const isFull = !!document.fullscreenElement;
      this.fullscreenBtn.classList.toggle('active', isFull);
    });

    // Theater Mode
    if (this.theaterBtn) {
      this.theaterBtn.addEventListener('click', () => this.toggleTheater());
    }

    // PiP
    if (this.pipBtn) {
      this.pipBtn.addEventListener('click', () => this.togglePiP());
    }

    // Reload
    if (this.reloadBtn) {
      this.reloadBtn.addEventListener('click', () => this.reloadStream());
    }

    // Multi-Server Selector Dropdown
    if (this.serverBtn && this.serverDropdown) {
      this.serverBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.serverDropdown.classList.toggle('hidden');
        if (this.qualityDropdown) this.qualityDropdown.classList.add('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#serverSelectorWrapper')) {
          this.serverDropdown.classList.add('hidden');
        }
      });
    }

    if (this.serverOptionsList) {
      this.serverOptionsList.addEventListener('click', (e) => {
        const opt = e.target.closest('.server-option');
        if (!opt) return;
        const srvIdx = parseInt(opt.getAttribute('data-server-idx'), 10);
        if (!isNaN(srvIdx)) {
          this.switchServer(srvIdx, false);
          if (this.serverDropdown) this.serverDropdown.classList.add('hidden');
        }
      });
    }

    if (this.nextServerBtn) {
      this.nextServerBtn.addEventListener('click', () => {
        this.switchNextServer();
      });
    }

    // Proxy Toggle Button
    if (this.proxyToggleBtn) {
      this.proxyToggleBtn.addEventListener('click', () => {
        this.useProxy = !this.useProxy;
        this.proxyToggleBtn.classList.toggle('active', this.useProxy);
        const modeText = this.useProxy ? t('proxyStream') : t('directStream');
        const textNode = this.proxyToggleBtn.querySelector('.proxy-mode-text');
        if (textNode) textNode.textContent = modeText;
        
        // Find best corresponding server (proxy or direct)
        if (this.currentServers && this.currentServers.length > 0) {
          const targetType = this.useProxy ? 'proxy' : 'direct';
          const matchIdx = this.currentServers.findIndex(s => s.type === targetType);
          this.switchServer(matchIdx >= 0 ? matchIdx : 0, false);
        } else if (this.currentChannel) {
          this.loadChannel(this.currentChannel, 0);
        }
      });
    }

    // Quality / Resolution Selector
    if (this.qualityBtn && this.qualityDropdown) {
      this.qualityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.qualityDropdown.classList.toggle('hidden');
        if (this.serverDropdown) this.serverDropdown.classList.add('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#qualitySelectorWrapper')) {
          this.qualityDropdown.classList.add('hidden');
        }
      });
    }

    if (this.qualityOptionsList) {
      this.qualityOptionsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.quality-option');
        if (!btn) return;
        const res = btn.getAttribute('data-res');
        this.qualityOptionsList.querySelectorAll('.quality-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setResolution(res);
        if (this.qualityDropdown) {
          this.qualityDropdown.classList.add('hidden');
        }
      });
    }

    // Favorite toggle
    if (this.favToggleBtn) {
      this.favToggleBtn.addEventListener('click', () => {
        if (this.currentChannel && window.app) {
          window.app.toggleFavorite(this.currentChannel.id);
          this.updateFavoriteState();
        }
      });
    }

    // Error overlay actions
    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => this.reloadStream());
    }
    if (this.switchProxyBtn) {
      this.switchProxyBtn.addEventListener('click', () => {
        // Switch to Server 2 (Turbo Buffer-Free Proxy)
        const proxyIdx = this.currentServers.findIndex(s => s.type === 'proxy');
        if (proxyIdx >= 0) {
          this.switchServer(proxyIdx, false);
        } else {
          this.switchNextServer();
        }
      });
    }
    if (this.testStreamBtn) {
      this.testStreamBtn.addEventListener('click', () => {
        const testChannel = {
          id: 'test_demo_working',
          name: 'Big Buck Bunny (Verified Test)',
          stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          category: 'entertainment',
          country: 'Global',
          country_code: 'in',
          flag: '🎬',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/260px-Big_buck_bunny_poster_big.jpg',
          servers: [
            {
              id: 'srv_1',
              name: 'Server 1 (Direct Test Stream)',
              badge: '⚡ Direct CDN',
              url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              type: 'direct',
              description: 'Ultra HD 60fps verified test stream'
            },
            {
              id: 'srv_2',
              name: 'Server 2 (Turbo Proxy)',
              badge: '🚀 Turbo Buffer-Free',
              url: '/api/proxy?server=turbo&url=https%3A//test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              type: 'proxy',
              description: 'Persistent Keep-Alive connection pool'
            }
          ]
        };
        this.loadChannel(testChannel, 0);
      });
    }

    // Native Video Events
    this.video.addEventListener('play', () => {
      this.hideLoading();
      this.hideError();
      this.clearStallWatchdog();
      this.updatePlayState(true);
      this.setStatus('online', t('statusOnline'));
    });

    this.video.addEventListener('pause', () => {
      this.clearStallWatchdog();
      this.updatePlayState(false);
    });

    this.video.addEventListener('waiting', () => {
      this.showLoading();
      this.setStatus('buffering', t('statusBuffering'));
      this.startStallWatchdog();
    });

    this.video.addEventListener('stalled', () => {
      this.startStallWatchdog();
    });

    this.video.addEventListener('playing', () => {
      this.hideLoading();
      this.clearStallWatchdog();
      this.setStatus('online', t('statusOnline'));
    });

    this.video.addEventListener('error', (e) => {
      console.warn('HTML5 Video error event:', e);
      this.autoFailoverServer('Video stream decode error');
    });
  }

  loadChannel(channel, serverIndex = 0) {
    if (!channel) return;
    this.currentChannel = channel;
    this.retryCount = 0;
    this.clearStallWatchdog();

    // Prepare servers array
    if (channel.servers && channel.servers.length > 0) {
      this.currentServers = channel.servers;
    } else {
      const pUrl = channel.stream_url;
      this.currentServers = [
        {
          id: 'srv_1',
          name: 'Server 1 (High-Speed Direct)',
          badge: '⚡ Direct CDN',
          url: pUrl,
          type: 'direct',
          description: 'Direct origin streaming'
        },
        {
          id: 'srv_2',
          name: 'Server 2 (Turbo Buffer-Free Proxy)',
          badge: '🚀 Turbo Buffer-Free',
          url: `/api/proxy?server=turbo&url=${encodeURIComponent(pUrl)}`,
          type: 'proxy',
          description: 'Persistent Keep-Alive connection pool with 128KB prebuffering'
        },
        {
          id: 'srv_3',
          name: 'Server 3 (Edge Bypass Route)',
          badge: '🛡️ Edge Bypass',
          url: `/api/proxy?server=edge&url=${encodeURIComponent(pUrl)}`,
          type: 'proxy',
          description: 'AppleCoreMedia headers to bypass geo-restrictions'
        },
        {
          id: 'srv_4',
          name: 'Server 4 (Backup Cloud Proxy)',
          badge: '🌐 Cloud Mirror',
          url: `/api/proxy?server=backup&url=${encodeURIComponent(pUrl)}`,
          type: 'proxy',
          description: 'Failover cloud-routed proxy'
        }
      ];
    }

    this.currentServerIndex = Math.min(Math.max(0, serverIndex), this.currentServers.length - 1);

    // Update UI headers
    if (this.channelTitleEl) this.channelTitleEl.textContent = channel.name;
    if (this.channelCategoryEl) {
      this.channelCategoryEl.textContent = t(channel.category) || channel.category;
      this.channelCategoryEl.className = `badge category-badge cat-${(channel.category || 'others').toLowerCase()}`;
    }
    if (this.channelCountryEl) {
      this.channelCountryEl.textContent = `${channel.flag || ''} ${t((channel.country || '').toLowerCase()) || channel.country}`;
    }
    if (this.channelLogoEl) {
      const fallbackSeed = encodeURIComponent(channel.name);
      this.channelLogoEl.src = channel.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${fallbackSeed}`;
      this.channelLogoEl.onerror = () => {
        this.channelLogoEl.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${fallbackSeed}`;
      };
    }

    this.updateFavoriteState();
    this.hideError();
    this.showLoading();
    this.setStatus('connecting', t('statusConnecting'));

    // Update initial resolution badge
    let initialRes = 'Auto HD';
    const resMatch = (channel.name || '').match(/(\d+p|4k|2k)/i) || (channel.original_name || '').match(/(\d+p|4k|2k)/i);
    if (resMatch) {
      const detected = resMatch[1].toUpperCase();
      initialRes = detected === '4K' ? '4K UHD' : (detected === '1080P' ? '1080p FHD' : `${detected} HD`);
    }
    if (this.resolutionBadge) {
      this.resolutionBadge.textContent = this.currentResolution === 'auto' ? initialRes : (this.currentResolution + 'p');
    }

    // Record to recently watched
    if (window.app) {
      window.app.addRecent(channel);
    }

    // Render server options dropdown & select active server
    this.renderServerOptions();
    this.applyActiveServerUI();

    const selectedServer = this.currentServers[this.currentServerIndex];
    this.playStreamUrl(selectedServer.url);
  }

  renderServerOptions() {
    if (!this.serverOptionsList || !this.currentServers) return;

    let html = '';
    this.currentServers.forEach((srv, idx) => {
      const isActive = idx === this.currentServerIndex;
      html += `
        <button class="server-option ${isActive ? 'active' : ''}" data-server-idx="${idx}">
          <div class="server-option-top">
            <span class="server-option-name">${srv.name}</span>
            <span class="server-option-badge">${srv.badge || (srv.type === 'direct' ? '⚡ Direct' : '🚀 Proxy')}</span>
          </div>
          <span class="server-option-desc">${srv.description || ''}</span>
        </button>
      `;
    });

    this.serverOptionsList.innerHTML = html;
  }

  applyActiveServerUI() {
    const srv = this.currentServers[this.currentServerIndex];
    if (!srv) return;

    if (this.serverText) {
      this.serverText.textContent = `Server ${this.currentServerIndex + 1}`;
    }

    if (this.serverBadge) {
      this.serverBadge.textContent = `${srv.badge || '⚡ Server ' + (this.currentServerIndex + 1)}`;
    }

    if (this.proxyToggleBtn) {
      const isProxy = srv.type === 'proxy';
      this.proxyToggleBtn.classList.toggle('active', isProxy);
      const textNode = this.proxyToggleBtn.querySelector('.proxy-mode-text');
      if (textNode) {
        textNode.textContent = isProxy ? t('proxyStream') : t('directStream');
      }
    }

    // Update active highlight in dropdown
    if (this.serverOptionsList) {
      this.serverOptionsList.querySelectorAll('.server-option').forEach((opt, idx) => {
        opt.classList.toggle('active', idx === this.currentServerIndex);
      });
    }
  }

  switchServer(index, isAuto = false) {
    if (!this.currentServers || index < 0 || index >= this.currentServers.length) return;
    this.currentServerIndex = index;
    this.applyActiveServerUI();
    this.hideError();
    this.showLoading();
    this.setStatus('connecting', t('statusConnecting'));

    const srv = this.currentServers[this.currentServerIndex];
    const toastMsg = isAuto 
      ? t('autoSwitchedToast', { server: srv.name })
      : t('manualSwitchedToast', { server: srv.name });
    this.showToast(toastMsg);

    this.playStreamUrl(srv.url);
  }

  switchNextServer() {
    if (!this.currentServers || this.currentServers.length <= 1) {
      this.reloadStream();
      return;
    }
    const nextIdx = (this.currentServerIndex + 1) % this.currentServers.length;
    this.switchServer(nextIdx, false);
  }

  autoFailoverServer(reason) {
    console.warn('Auto failover triggered. Reason:', reason);
    this.clearStallWatchdog();

    if (this.currentServers && this.currentServerIndex + 1 < this.currentServers.length) {
      const nextIdx = this.currentServerIndex + 1;
      this.switchServer(nextIdx, true);
    } else {
      this.handleStreamError(reason);
    }
  }

  startStallWatchdog() {
    this.clearStallWatchdog();
    // If buffering or stalled for > 4.5 seconds, auto-switch to next server to remove buffering!
    this.bufferStallTimer = setTimeout(() => {
      if (this.video.paused) return; // Ignore intentional pause
      console.warn('Buffering watchdog triggered: Stream stalled for > 4.5s');

      // First try gentle nudge if buffer hole
      if (this.video.buffered && this.video.buffered.length > 0) {
        try {
          const end = this.video.buffered.end(this.video.buffered.length - 1);
          if (end - this.video.currentTime > 0.5) {
            this.video.currentTime += 0.25;
            return;
          }
        } catch (e) {}
      }

      // Auto-failover to next server
      this.autoFailoverServer('Continuous buffering detected');
    }, 4500);
  }

  clearStallWatchdog() {
    if (this.bufferStallTimer) {
      clearTimeout(this.bufferStallTimer);
      this.bufferStallTimer = null;
    }
  }

  showToast(message) {
    if (!this.playerToast || !this.playerToastMsg) return;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.playerToastMsg.textContent = message;
    this.playerToast.classList.remove('hidden');

    this.toastTimeout = setTimeout(() => {
      this.playerToast.classList.add('hidden');
    }, 3800);
  }

  playStreamUrl(url) {
    this.clearStallWatchdog();
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (Hls.isSupported()) {
      // Robust anti-buffering Hls.js configuration
      const hlsConfig = {
        debug: false,
        enableWorker: true,
        // Crucial: lowLatencyMode: false gives safe buffer margin, completely removing IPTV buffering!
        lowLatencyMode: false,
        backBufferLength: 60,
        maxBufferLength: 30, // Buffers up to 30 seconds ahead
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1024 * 1024, // 60MB memory buffer
        maxBufferHole: 0.5, // Smoothly jumps over timestamp micro-holes without freezing
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.2,
        nudgeMaxRetry: 5,
        liveSyncDurationCount: 3, // Safe 3-segment live edge cushion prevents underruns
        liveMaxLatencyDurationCount: 10,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 800,
        levelLoadingTimeOut: 12000,
        levelLoadingMaxRetry: 4,
        levelLoadingRetryDelay: 800,
        fragLoadingTimeOut: 15000,
        fragLoadingMaxRetry: 5,
        fragLoadingRetryDelay: 1000,
        xhrSetup: function (xhr, u) {
          xhr.withCredentials = false;
        }
      };

      this.hls = new Hls(hlsConfig);
      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        this.hideLoading();
        this.updateAvailableResolutions();
        if (this.currentResolution !== 'auto') {
          this.setResolution(this.currentResolution);
        }
        this.video.play().catch(err => {
          console.warn('Autoplay prevented, user interaction required:', err);
        });
      });

      this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        if (this.currentResolution === 'auto' && this.hls.levels && this.hls.levels[data.level]) {
          const lvl = this.hls.levels[data.level];
          const height = lvl.height || 720;
          let label = `${height}p`;
          if (height >= 2160) label = '4K UHD';
          else if (height >= 1440) label = '2K QHD';
          else if (height >= 1080) label = '1080p FHD';
          else if (height >= 720) label = '720p HD';
          if (this.resolutionBadge) this.resolutionBadge.textContent = label;
        }
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('Hls.js event error:', data.type, data.details);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error encountered on Server', this.currentServerIndex + 1);
              if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                this.hls.startLoad();
              } else {
                // Auto failover to next server
                this.autoFailoverServer(`Network error on Server ${this.currentServerIndex + 1}`);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error, attempting media recovery...');
              this.hls.recoverMediaError();
              break;
            default:
              this.autoFailoverServer(data.details);
              break;
          }
        }
      });

    } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari / iOS HLS
      this.video.src = url;
      this.video.addEventListener('loadedmetadata', () => {
        this.hideLoading();
        this.video.play().catch(e => console.warn('Native autoplay error:', e));
      }, { once: true });
    } else {
      this.handleStreamError('HLS is not supported in this browser.');
    }
  }

  setResolution(targetRes) {
    this.currentResolution = targetRes;
    if (targetRes === 'auto') {
      if (this.hls) {
        this.hls.currentLevel = -1; // Auto level
      }
      if (this.qualityText) this.qualityText.textContent = 'Auto';
      if (this.resolutionBadge) this.resolutionBadge.textContent = 'Auto HD';
    } else {
      const targetHeight = parseInt(targetRes, 10);
      let badgeLabel = `${targetHeight}p`;
      let textLabel = `${targetHeight}p`;
      if (targetHeight === 2160) { badgeLabel = '4K UHD'; textLabel = '4K'; }
      else if (targetHeight === 1440) { badgeLabel = '2K QHD'; textLabel = '2K'; }
      else if (targetHeight === 1080) { badgeLabel = '1080p FHD'; textLabel = '1080p'; }
      else if (targetHeight === 720) { badgeLabel = '720p HD'; textLabel = '720p'; }
      else if (targetHeight === 480) { badgeLabel = '480p SD'; textLabel = '480p'; }
      else if (targetHeight === 360) { badgeLabel = '360p Low'; textLabel = '360p'; }

      if (this.qualityText) this.qualityText.textContent = textLabel;
      if (this.resolutionBadge) this.resolutionBadge.textContent = badgeLabel;

      if (this.hls && this.hls.levels && this.hls.levels.length > 0) {
        let bestIdx = 0;
        let minDiff = Infinity;
        this.hls.levels.forEach((lvl, idx) => {
          const h = lvl.height || 720;
          const diff = Math.abs(h - targetHeight);
          if (diff < minDiff) {
            minDiff = diff;
            bestIdx = idx;
          }
        });
        this.hls.currentLevel = bestIdx;
      }
    }
  }

  updateAvailableResolutions() {
    if (!this.hls || !this.hls.levels || this.hls.levels.length <= 1) return;
    if (!this.qualityOptionsList) return;

    let optionsHtml = `<button class="quality-option ${this.currentResolution === 'auto' ? 'active' : ''}" data-res="auto">${t('autoQuality') || 'Auto (Adaptive)'}</button>`;
    
    // List standard targets (4K, 2K, 1080p, 720p, 480p, 360p)
    const standardResolutions = [2160, 1440, 1080, 720, 480, 360];
    standardResolutions.forEach(res => {
      const isSelected = this.currentResolution == res;
      let label = `${res}p`;
      if (res === 2160) label = '4K Ultra HD (2160p)';
      else if (res === 1440) label = '2K QHD (1440p)';
      else if (res === 1080) label = '1080p Full HD';
      else if (res === 720) label = '720p HD';
      else if (res === 480) label = '480p SD';
      else if (res === 360) label = '360p Low';
      optionsHtml += `<button class="quality-option ${isSelected ? 'active' : ''}" data-res="${res}">${label}</button>`;
    });

    this.qualityOptionsList.innerHTML = optionsHtml;
  }

  handleStreamError(reason) {
    this.hideLoading();
    this.clearStallWatchdog();
    this.setStatus('error', t('statusError'));
    if (this.errorOverlay) {
      this.errorOverlay.classList.remove('hidden');
      if (this.errorTitle) this.errorTitle.textContent = t('streamErrorTitle');
      if (this.errorDesc) {
        this.errorDesc.textContent = t('streamErrorDesc');
      }
    }
  }

  hideError() {
    if (this.errorOverlay) {
      this.errorOverlay.classList.add('hidden');
    }
  }

  showLoading() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.remove('hidden');
    }
  }

  hideLoading() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.add('hidden');
    }
  }

  setStatus(type, text) {
    if (!this.streamStatusBadge) return;
    this.streamStatusBadge.className = `status-badge status-${type}`;
    const textNode = this.streamStatusBadge.querySelector('.status-text');
    if (textNode) textNode.textContent = text;
  }

  togglePlay() {
    if (this.video.paused) {
      this.video.play().catch(e => console.warn(e));
    } else {
      this.video.pause();
    }
  }

  updatePlayState(isPlaying) {
    if (!this.playPauseBtn) return;
    if (isPlaying) {
      this.playPauseBtn.setAttribute('title', 'Pause (Space)');
      this.playPauseBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1.5" />
          <rect x="14" y="4" width="4" height="16" rx="1.5" />
        </svg>
      `;
    } else {
      this.playPauseBtn.setAttribute('title', 'Play (Space)');
      this.playPauseBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      `;
    }
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    if (this.video.muted) {
      this.previousVolume = this.video.volume;
      if (this.volumeSlider) this.volumeSlider.value = 0;
    } else {
      this.video.volume = this.previousVolume || 0.8;
      if (this.volumeSlider) this.volumeSlider.value = this.video.volume;
    }
    this.updateVolumeIcons();
  }

  updateVolumeIcons() {
    if (!this.muteBtn) return;
    const isMuted = this.video.muted || this.video.volume === 0;
    if (isMuted) {
      this.muteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      `;
    } else {
      this.muteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      `;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (this.container.requestFullscreen) {
        this.container.requestFullscreen();
      } else if (this.container.webkitRequestFullscreen) {
        this.container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  toggleTheater() {
    const isTheater = document.body.classList.toggle('theater-mode');
    if (this.theaterBtn) {
      this.theaterBtn.classList.toggle('active', isTheater);
    }
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled && this.video !== document.pictureInPictureElement) {
        await this.video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  }

  reloadStream() {
    if (this.currentChannel) {
      this.switchServer(this.currentServerIndex, false);
    }
  }

  updateFavoriteState() {
    if (!this.favToggleBtn || !this.currentChannel || !window.app) return;
    const isFav = window.app.isFavorite(this.currentChannel.id);
    this.favToggleBtn.classList.toggle('favorited', isFav);
    this.favToggleBtn.setAttribute('title', isFav ? t('unfavorite') : t('favorite'));
  }

  startViewerSimulation() {
    const baseViewers = Math.floor(Math.random() * 8000) + 1200;
    this.simulatedViewers = baseViewers;

    if (this.viewerInterval) clearInterval(this.viewerInterval);
    this.viewerInterval = setInterval(() => {
      const delta = Math.floor(Math.random() * 25) - 12;
      this.simulatedViewers = Math.max(140, this.simulatedViewers + delta);
      if (this.viewerCountEl) {
        this.viewerCountEl.textContent = `${this.simulatedViewers.toLocaleString()} ${t('viewers')}`;
      }
    }, 4000);
  }
}
