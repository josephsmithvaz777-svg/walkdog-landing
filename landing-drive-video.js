/**
 * Hero video: Vimeo, YouTube (IFrame API) o Google Drive.
 * Play gate, barra visual, CTA al terminar la duracion fija.
 */
(function () {
  var DRIVE_ID = ['15ZvvNN1O1LcfRfSPUxK18K', 'OpB6GrD-CE'].join('');
  var CTA_ID = 'walkdog-hero-cta';
  var CTA_PULSE_ANIM = '1.9s';
  var DEFAULT_YOUTUBE_ORIGIN = 'https://walkdogentrena.com';
  var ytApiQueue = [];
  var ytApiLoading = false;

  function lockSurface(el) {
    if (!el) return;
    el.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
    el.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });
  }

  function getYoutubeId(root) {
    return (root.getAttribute('data-youtube-id') || '').trim();
  }

  function getVimeoId(root) {
    return (root.getAttribute('data-vimeo-id') || '').trim();
  }

  function getEmbedOrigin(root) {
    var fromAttr = (root.getAttribute('data-youtube-origin') || '').trim();
    if (fromAttr) return fromAttr;
    if (window.location && window.location.origin && window.location.origin !== 'null') {
      return window.location.origin;
    }
    return DEFAULT_YOUTUBE_ORIGIN;
  }

  function getAutoplayOnLoad(root) {
    return (root.getAttribute('data-autoplay-on-load') || '').trim().toLowerCase();
  }

  function prefersPlayGate() {
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches;
  }

  function shouldAutoplayMuted(root) {
    return getAutoplayOnLoad(root) === 'muted' && !prefersPlayGate();
  }

  function buildDriveUrl() {
    return 'https://drive.google.com/file/d/' + DRIVE_ID + '/preview?autoplay=1';
  }

  function updateAudioHint(root, message) {
    var hint = root.parentElement && root.parentElement.querySelector('.video-audio-hint');
    if (!hint) return;
    if (message) {
      hint.textContent = message;
      return;
    }
    if (getYoutubeId(root)) {
      if (prefersPlayGate()) {
        hint.textContent = '*Pulsa el botón de reproducir para iniciar el video.';
      } else if (getAutoplayOnLoad(root) === 'muted') {
        hint.textContent =
          '*El video inicia en silencio (requisito del navegador). Pulsa «Activar sonido» para escucharlo.';
      }
    }
  }

  function ensureYoutubeApi(cb) {
    if (window.YT && window.YT.Player) {
      cb();
      return;
    }
    ytApiQueue.push(cb);
    if (ytApiLoading) return;
    ytApiLoading = true;
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === 'function') prev();
      var queue = ytApiQueue.slice();
      ytApiQueue = [];
      queue.forEach(function (fn) {
        fn();
      });
    };
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    var first = document.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(tag, first);
  }

  function readVideoCssNum(name, fallback) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    var n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  function readVideoTargetWidth(root) {
    var vw = readVideoCssNum('--video-target-vw', 78);
    var maxPx = readVideoCssNum('--video-max-px', 1400);
    var target = Math.min(window.innerWidth * vw / 100, maxPx);
    var card = root.closest('.video-card');
    if (card) {
      var cw = card.getBoundingClientRect().width;
      if (cw > 0) target = Math.min(target, cw);
    }
    var container = root.closest('.hero .container');
    if (container) {
      var contW = container.getBoundingClientRect().width;
      if (contW > 0) target = Math.min(target, contW);
    }
    return target;
  }

  function lockVideoAspect(root) {
    if (!getYoutubeId(root) && !getVimeoId(root)) return;

    var isVimeo = getVimeoId(root) && !getYoutubeId(root);
    var frame = 0;
    var apply = function () {
      var targetW = readVideoTargetWidth(root);
      if (!(targetW > 0)) return;
      var snapped;
      var h;
      var snapStep = readVideoCssNum('--video-snap-step', 4);

      if (isVimeo) {
        var rw = readVideoCssNum('--video-vimeo-ratio-w', 5);
        var rh = readVideoCssNum('--video-vimeo-ratio-h', 4.15);
        snapped = targetW < 640 ? Math.round(targetW) : Math.floor(targetW / snapStep) * snapStep;
        if (snapped < 280) snapped = Math.round(targetW);
        if (snapped < 1) return;
        h = Math.round((snapped * rh) / rw);
        root.style.width = snapped + 'px';
        root.style.height = h + 'px';
        root.style.maxWidth = '100%';
        root.style.maxHeight = '';
        root.style.marginLeft = 'auto';
        root.style.marginRight = 'auto';
        root.style.aspectRatio = 'auto';
        return;
      }
      snapped = targetW < 640 ? Math.round(targetW) : Math.floor(targetW / 16) * 16;
      if (snapped < 280) snapped = Math.round(targetW);
      if (snapped < 1) return;
      h = Math.round((snapped * 9) / 16);
      root.style.width = snapped + 'px';
      root.style.height = h + 'px';
      root.style.maxWidth = '100%';
      root.style.maxHeight = '';
      root.style.marginLeft = 'auto';
      root.style.marginRight = 'auto';
      root.style.aspectRatio = 'auto';
    };

    var schedule = function () {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(function () {
        frame = 0;
        apply();
      });
    };

    schedule();
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(schedule);
      ro.observe(root);
      var card = root.closest('.video-card');
      if (card) ro.observe(card);
      root._wdAspectRo = ro;
    }
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
  }

  function lockYoutubeAspect(root) {
    lockVideoAspect(root);
  }

  function clearDriveTimers(root) {
    if (root._wdBarIv) {
      window.clearInterval(root._wdBarIv);
      root._wdBarIv = 0;
    }
    if (root._wdCtaTo) {
      window.clearTimeout(root._wdCtaTo);
      root._wdCtaTo = 0;
    }
  }

  function resetProgressVisual(root) {
    clearDriveTimers(root);
    var fill = root.querySelector('.video-progress__fill');
    var bar = root.querySelector('.video-progress');
    if (fill) fill.style.width = '0%';
    if (bar) bar.setAttribute('aria-valuenow', '0');
  }

  function findCtaBtn(root) {
    var byData = root.getAttribute('data-cta-id');
    if (byData) {
      var el = document.getElementById(byData);
      if (el) return el;
    }
    var byId = document.getElementById(CTA_ID);
    if (byId) return byId;
    var scope = root.closest('.video-card, .hero__inner');
    if (!scope) scope = root.parentElement;
    return scope ? scope.querySelector('.btn-cta-hero') : null;
  }

  function armCtaPulse(root) {
    if (root.getAttribute('data-cta-pulse-done') === '1') return;
    var btn = findCtaBtn(root);
    if (!btn) return;
    root.setAttribute('data-cta-pulse-done', '1');
    btn.classList.add('is-pulsing');
    btn.style.setProperty('transition', 'none', 'important');
    btn.style.setProperty(
      'animation',
      'cta-pulse-soft ' + CTA_PULSE_ANIM + ' cubic-bezier(0.45,0,0.55,1) infinite',
      'important'
    );
    btn.addEventListener(
      'click',
      function dismissCtaPulse() {
        btn.classList.remove('is-pulsing');
        btn.style.removeProperty('transition');
        btn.style.removeProperty('animation');
      },
      { once: true }
    );
  }

  function resetCtaPulse(root) {
    root.removeAttribute('data-cta-pulse-done');
    var btn = findCtaBtn(root);
    if (btn) {
      btn.classList.remove('is-pulsing');
      btn.style.removeProperty('transition');
      btn.style.removeProperty('animation');
    }
  }

  function startProgress(root) {
    var fill = root.querySelector('.video-progress__fill');
    var bar = root.querySelector('.video-progress');
    if (!fill) return;

    clearDriveTimers(root);

    var raw = root.getAttribute('data-progress-duration');
    var sec = parseInt(raw, 10);
    if (!sec || sec < 10) sec = 169;

    var pulseAtRaw = root.getAttribute('data-cta-pulse-at-sec');
    var pulseAtSec = parseInt(pulseAtRaw, 10);
    if (isNaN(pulseAtSec) || pulseAtSec < 5) pulseAtSec = sec;
    if (pulseAtSec > sec) pulseAtSec = sec;

    var start = Date.now();
    var ms = sec * 1000;
    var pulseAtMs = pulseAtSec * 1000;

    root._wdBarIv = window.setInterval(function () {
      var elapsed = Date.now() - start;
      var p = Math.min(100, (elapsed / ms) * 100);
      fill.style.width = p + '%';
      if (bar) bar.setAttribute('aria-valuenow', String(Math.round(p)));
      if (p >= 100) {
        window.clearInterval(root._wdBarIv);
        root._wdBarIv = 0;
      }
    }, 100);

    root._wdCtaTo = window.setTimeout(function () {
      root._wdCtaTo = 0;
      armCtaPulse(root);
    }, pulseAtMs);
  }

  function scheduleProgressStart(root) {
    var delayMs = parseInt(root.getAttribute('data-progress-start-delay-ms'), 10);
    if (isNaN(delayMs) || delayMs < 0) delayMs = 2800;

    if (root._wdProgressKick) window.clearTimeout(root._wdProgressKick);
    root._wdProgressKick = window.setTimeout(function () {
      root._wdProgressKick = 0;
      if (!root._wdProgressStarted) {
        root._wdProgressStarted = true;
        startProgress(root);
      }
    }, delayMs);
  }

  function mountUnmuteControl(root, getPlayer) {
    if (!getYoutubeId(root) || getAutoplayOnLoad(root) !== 'muted' || prefersPlayGate()) return;

    var btn = root.querySelector('.video-unmute-btn');
    if (!btn) return;

    function showUnmuteBtn() {
      btn.classList.add('is-visible');
      btn.classList.remove('is-dismissed');
      btn.setAttribute('aria-hidden', 'false');
    }

    function hideUnmuteBtn() {
      btn.classList.remove('is-visible');
      btn.classList.add('is-dismissed');
      btn.setAttribute('aria-hidden', 'true');
    }

    function onUnmuteActivate(e) {
      e.preventDefault();
      var player = getPlayer();
      if (player && typeof player.unMute === 'function') {
        player.unMute();
        if (typeof player.setVolume === 'function') player.setVolume(100);
      }
      hideUnmuteBtn();
      updateAudioHint(root, '*Audio activado.');
    }

    btn.addEventListener('click', onUnmuteActivate);
    btn.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onUnmuteActivate(e);
        }
      },
      { passive: false }
    );

    window.setTimeout(showUnmuteBtn, 1200);
  }

  function mountVideoTapControl(root, getPlayer) {
    var shield = root.querySelector('.video-yt-shield');
    if (!shield) return;

    shield.setAttribute('role', 'button');
    shield.setAttribute('tabindex', '0');
    shield.setAttribute('aria-label', 'Pausar video');

    function togglePlayback(e) {
      if (e) e.preventDefault();
      var player = getPlayer();
      if (!player || typeof player.getPlayerState !== 'function') return;

      var state = player.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else if (
        state === YT.PlayerState.PAUSED ||
        state === YT.PlayerState.CUED ||
        state === YT.PlayerState.ENDED
      ) {
        player.playVideo();
      }
    }

    shield.addEventListener('click', togglePlayback);
    shield.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePlayback(e);
        }
      },
      { passive: false }
    );
  }

  function applyYoutubeIframeAttrs(root) {
    var iframe = root.querySelector('iframe');
    if (!iframe) return;
    iframe.setAttribute('title', 'Video de presentacion WalkDog');
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  }

  function dismissPlayGate(root) {
    var gate = root.querySelector('.video-play-gate');
    if (!gate) return;
    gate.classList.add('is-dismissed');
    gate.setAttribute('aria-hidden', 'true');
    gate.hidden = true;
  }

  function showPlayGate(root) {
    var gate = root.querySelector('.video-play-gate');
    if (!gate) return;
    gate.classList.remove('is-dismissed');
    gate.removeAttribute('hidden');
    gate.setAttribute('aria-hidden', 'false');
  }

  function kickYoutubePlay(player, muted) {
    if (!player || typeof player.playVideo !== 'function') return;
    if (muted && typeof player.mute === 'function') player.mute();
    if (!muted && typeof player.unMute === 'function') player.unMute();
    player.playVideo();
  }

  function createYoutubePlayer(root, opts) {
    opts = opts || {};
    var mount = root.querySelector('.video-yt-mount');
    if (!mount) return;

    if (root._wdYtPlayer && typeof root._wdYtPlayer.playVideo === 'function') {
      kickYoutubePlay(root._wdYtPlayer, !!opts.muted);
      dismissPlayGate(root);
      scheduleProgressStart(root);
      return;
    }

    var ytId = getYoutubeId(root);
    var origin = getEmbedOrigin(root);
    var muted = !!opts.muted;
    var autoplay = opts.autoplay !== false;

    ensureYoutubeApi(function () {
      if (root._wdYtPlayer) {
        kickYoutubePlay(root._wdYtPlayer, muted);
        dismissPlayGate(root);
        scheduleProgressStart(root);
        return;
      }

      root._wdYtPlayer = new YT.Player(mount, {
        videoId: ytId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          mute: muted ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          cc_load_policy: 0,
          origin: origin,
          widget_referrer: origin + '/',
        },
        events: {
          onReady: function (ev) {
            applyYoutubeIframeAttrs(root);
            root.classList.add('is-yt-ready');
            dismissPlayGate(root);
            if (autoplay) {
              kickYoutubePlay(ev.target, muted);
              if (prefersPlayGate() || muted) {
                window.setTimeout(function () {
                  var state =
                    typeof ev.target.getPlayerState === 'function' ? ev.target.getPlayerState() : -1;
                  if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.BUFFERING) {
                    kickYoutubePlay(ev.target, true);
                  }
                }, 600);
              }
            }
            scheduleProgressStart(root);
          },
          onError: function () {
            showPlayGate(root);
            root.classList.remove('is-yt-ready', 'is-yt-playing', 'is-yt-paused');
          },
          onStateChange: function (ev) {
            var shield = root.querySelector('.video-yt-shield');
            if (ev.data === YT.PlayerState.PLAYING) {
              root.classList.add('is-yt-playing');
              root.classList.remove('is-yt-paused');
              if (shield) shield.setAttribute('aria-label', 'Pausar video');
            } else if (ev.data === YT.PlayerState.PAUSED) {
              root.classList.remove('is-yt-playing');
              root.classList.add('is-yt-paused');
              if (shield) shield.setAttribute('aria-label', 'Reanudar video');
            }
          },
        },
      });
    });
  }

  function mountYoutubeRoot(root) {
    lockSurface(root);
    lockYoutubeAspect(root);

    var label = root.getAttribute('data-progress-aria-label');
    var bar = root.querySelector('.video-progress');
    if (bar && label) bar.setAttribute('aria-label', label);

    var gate = root.querySelector('.video-play-gate');
    var mutedAutoplay = shouldAutoplayMuted(root);
    var usePlayGate = prefersPlayGate();

    function getPlayer() {
      return root._wdYtPlayer;
    }

    function startPlayer(opts) {
      root._wdProgressStarted = false;
      createYoutubePlayer(root, opts);
      mountUnmuteControl(root, getPlayer);
      mountVideoTapControl(root, getPlayer);
    }

    if (gate) {
      var gateBusy = false;

      function onGateActivate(e) {
        if (gateBusy) return;
        if (gate.classList.contains('is-dismissed') && root._wdYtPlayer) return;
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        gateBusy = true;
        window.setTimeout(function () {
          gateBusy = false;
        }, 700);
        resetProgressVisual(root);
        resetCtaPulse(root);
        updateAudioHint(root);
        startPlayer({ muted: usePlayGate, autoplay: true });
      }

      gate.addEventListener('click', onGateActivate);
      gate.addEventListener(
        'touchend',
        function (e) {
          onGateActivate(e);
        },
        { passive: false }
      );
      gate.addEventListener(
        'keydown',
        function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onGateActivate(e);
          }
        },
        { passive: false }
      );

      updateAudioHint(root);

      if (mutedAutoplay) {
        startPlayer({ muted: true, autoplay: true });
      } else if (usePlayGate) {
        showPlayGate(root);
      }
    } else {
      startPlayer({ muted: !usePlayGate && getAutoplayOnLoad(root) === 'muted', autoplay: true });
    }
  }

  function mountDriveRoot(root) {
    var iframe = root.querySelector('iframe');
    if (!iframe) return;

    lockSurface(root);

    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    var label = root.getAttribute('data-progress-aria-label');
    var bar = root.querySelector('.video-progress');
    if (bar && label) bar.setAttribute('aria-label', label);

    var gate = root.querySelector('.video-play-gate');
    var progressStarted = false;
    var fallback = 0;
    var progressKickTimer = 0;

    function clearProgressKick() {
      if (progressKickTimer) {
        window.clearTimeout(progressKickTimer);
        progressKickTimer = 0;
      }
    }

    function startOnce() {
      if (progressStarted) return;
      progressStarted = true;
      if (fallback) {
        window.clearTimeout(fallback);
        fallback = 0;
      }
      clearProgressKick();
      startProgress(root);
    }

    function bindLoadStartsProgress() {
      var delayMs = parseInt(root.getAttribute('data-progress-start-delay-ms'), 10);
      if (isNaN(delayMs) || delayMs < 0) delayMs = 2800;

      iframe.addEventListener(
        'load',
        function () {
          if (fallback) {
            window.clearTimeout(fallback);
            fallback = 0;
          }
          clearProgressKick();
          progressKickTimer = window.setTimeout(function () {
            progressKickTimer = 0;
            startOnce();
          }, delayMs);
        },
        { once: true }
      );

      if (fallback) window.clearTimeout(fallback);
      fallback = window.setTimeout(function () {
        fallback = 0;
        clearProgressKick();
        startOnce();
      }, delayMs + 12000);
    }

    if (gate) {
      iframe.setAttribute('src', 'about:blank');

      function onGateActivate(e) {
        if (gate.classList.contains('is-dismissed')) return;
        e.preventDefault();
        gate.classList.add('is-dismissed');
        gate.setAttribute('aria-hidden', 'true');
        progressStarted = false;
        clearProgressKick();
        if (fallback) {
          window.clearTimeout(fallback);
          fallback = 0;
        }
        resetProgressVisual(root);
        resetCtaPulse(root);
        bindLoadStartsProgress();
        iframe.src = buildDriveUrl() + '&v=' + Date.now();
      }

      gate.addEventListener('click', onGateActivate);
      gate.addEventListener(
        'keydown',
        function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onGateActivate(e);
          }
        },
        { passive: false }
      );
    } else {
      var cur = (iframe.getAttribute('src') || '').trim();
      if (!cur || cur === 'about:blank') iframe.setAttribute('src', buildDriveUrl());
      bindLoadStartsProgress();
    }
  }

  function mountRoot(root) {
    if (getVimeoId(root)) {
      mountVimeoRoot(root);
      return;
    }
    if (getYoutubeId(root)) {
      mountYoutubeRoot(root);
      return;
    }
    mountDriveRoot(root);
  }

  function postVimeoCommand(iframe, method, value) {
    if (!iframe || !iframe.contentWindow) return;
    var payload = { method: method };
    if (value !== undefined) payload.value = value;
    iframe.contentWindow.postMessage(JSON.stringify(payload), 'https://player.vimeo.com');
  }

  function mountVimeoRoot(root) {
    if (root._wdVimeoMounted) return;
    root._wdVimeoMounted = true;

    lockSurface(root);

    var label = root.getAttribute('data-progress-aria-label');
    var bar   = root.querySelector('.video-progress');
    if (bar && label) bar.setAttribute('aria-label', label);

    var iframe = root.querySelector('.video-vimeo-iframe');
    var unmuteBtn = root.querySelector('.video-unmute-btn');

    function unmuteVimeo() {
      if (!iframe) return;
      postVimeoCommand(iframe, 'setVolume', 1);
      postVimeoCommand(iframe, 'setMuted', false);
      postVimeoCommand(iframe, 'play');
    }

    if (unmuteBtn && !unmuteBtn._wdVimeoUnmuteWired) {
      unmuteBtn._wdVimeoUnmuteWired = true;

      window.setTimeout(function () {
        unmuteBtn.classList.add('is-visible');
        unmuteBtn.setAttribute('aria-hidden', 'false');
      }, 1200);

      function onUnmute(e) {
        e.preventDefault();
        e.stopPropagation();
        unmuteVimeo();
        unmuteBtn.classList.remove('is-visible');
        unmuteBtn.classList.add('is-dismissed');
        unmuteBtn.setAttribute('aria-hidden', 'true');
        var hint = root.parentElement && root.parentElement.querySelector('.video-audio-hint');
        if (hint) hint.textContent = '*Audio activado.';
      }

      unmuteBtn.addEventListener('click', onUnmute, { passive: false });
      unmuteBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUnmute(e); }
      }, { passive: false });
    }

    scheduleProgressStart(root);
    lockVideoAspect(root);
  }

  function boot() {
    document.querySelectorAll('.video-embed-root, .video-drive-root').forEach(mountRoot);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
