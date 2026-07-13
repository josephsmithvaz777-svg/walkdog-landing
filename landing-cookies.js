/**
 * Consentimiento de cookies — landing WalkDog (estilo banner + modal).
 * Publicidad solo si marketing está aceptado. IDs en WalkDogUrls.ads.
 * Guarda en cookie + localStorage (más fiable en local / file://).
 */
(function () {
  'use strict';

  var COOKIE_NAME = 'wd_cookie_consent';
  var STORAGE_KEY = 'wd_cookie_consent';
  var COOKIE_DAYS = 180;
  var banner = document.getElementById('cookie-banner');
  var modal = document.getElementById('cookie-modal');
  var acceptAllBtn = document.getElementById('cookie-accept-all');
  var savePrefsBtn = document.getElementById('cookie-save-prefs');
  var marketingToggle = document.getElementById('cookie-toggle-marketing');
  var adsLoaded = false;
  var lastFocus = null;

  function getAdsConfig() {
    var urls = typeof WalkDogUrls !== 'undefined' ? WalkDogUrls : null;
    return (urls && urls.ads) || {};
  }

  function readCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function writeCookie(name, value, days) {
    try {
      var maxAge = Math.floor(days * 24 * 60 * 60);
      var expires = new Date(Date.now() + maxAge * 1000).toUTCString();
      var secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = name + '=' + encodeURIComponent(value)
        + '; expires=' + expires
        + '; Max-Age=' + maxAge
        + '; path=/'
        + '; SameSite=Lax'
        + secure;
    } catch (err) {
      /* ignore */
    }
  }

  function readStorage() {
    try {
      return window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    } catch (err) {
      return null;
    }
  }

  function writeStorage(value) {
    try {
      if (window.localStorage) localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
      /* ignore */
    }
  }

  function getConsent() {
    var fromCookie = readCookie(COOKIE_NAME);
    if (fromCookie === 'accepted' || fromCookie === 'rejected') return fromCookie;
    var fromStorage = readStorage();
    if (fromStorage === 'accepted' || fromStorage === 'rejected') return fromStorage;
    return null;
  }

  function setConsent(value) {
    writeCookie(COOKIE_NAME, value, COOKIE_DAYS);
    writeStorage(value);
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    banner.removeAttribute('hidden');
    document.body.classList.add('cookie-banner-open');
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
    banner.setAttribute('hidden', '');
    document.body.classList.remove('cookie-banner-open');
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    if (marketingToggle) {
      marketingToggle.checked = getConsent() !== 'rejected';
    }
    modal.hidden = false;
    modal.removeAttribute('hidden');
    document.body.classList.add('cookie-modal-open');
    var closeBtn = modal.querySelector('.cookie-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('hidden', '');
    document.body.classList.remove('cookie-modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function loadScript(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        s.setAttribute(key, attrs[key]);
      });
    }
    document.head.appendChild(s);
    return s;
  }

  function loadMetaPixel(pixelId) {
    if (!pixelId || window.fbq) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }

  function loadAdSense(clientId) {
    if (!clientId) return;
    if (document.querySelector('script[data-wd-adsense]')) return;
    loadScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(clientId), {
      crossorigin: 'anonymous',
      'data-wd-adsense': '1',
    });
  }

  function loadAds() {
    if (adsLoaded) return;
    var ads = getAdsConfig();
    var hasAds = !!(ads.metaPixelId || ads.adsenseClient);
    if (!hasAds) return;
    adsLoaded = true;
    if (ads.metaPixelId) loadMetaPixel(String(ads.metaPixelId).trim());
    if (ads.adsenseClient) loadAdSense(String(ads.adsenseClient).trim());
  }

  function applyConsent(value) {
    setConsent(value);
    hideBanner();
    closeModal();
    if (value === 'accepted') loadAds();
  }

  function openPreferences() {
    showBanner();
    openModal();
  }

  if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', function () {
      applyConsent('accepted');
    });
  }

  if (savePrefsBtn) {
    savePrefsBtn.addEventListener('click', function () {
      var marketingOn = marketingToggle ? marketingToggle.checked : true;
      applyConsent(marketingOn ? 'accepted' : 'rejected');
    });
  }

  document.querySelectorAll('[data-cookie-config]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  document.querySelectorAll('[data-cookie-open]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openPreferences();
    });
  });

  if (modal) {
    modal.querySelectorAll('[data-cookie-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (!modal.hidden && e.key === 'Escape') closeModal();
    });
  }

  var consent = getConsent();
  if (consent === 'accepted') {
    loadAds();
    hideBanner();
    closeModal();
  } else if (consent === 'rejected') {
    hideBanner();
    closeModal();
  } else {
    showBanner();
  }

  window.WalkDogCookies = {
    getConsent: getConsent,
    openPreferences: openPreferences,
    loadAds: loadAds,
  };
})();
