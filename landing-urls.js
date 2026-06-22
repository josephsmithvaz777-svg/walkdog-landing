/**
 * URLs oficiales WalkDog — landing vs plataforma WordPress.
 * Mantener en sync con code/walkdogs-theme/inc/walkdogs-domains.php
 */
(function (global) {
  var LANDING = 'https://walkdogentrena.com';
  var PLATFORM = 'https://app.walkdogentrena.com';

  global.WalkDogUrls = {
    landing: LANDING + '/',
    platform: PLATFORM + '/',
    miArea: PLATFORM + '/mi-area/',
    login: PLATFORM + '/wp-login.php',
    checkout: function (level) {
      return PLATFORM + '/checkout/?level=' + encodeURIComponent(level);
    },
    uploads: function (path) {
      return PLATFORM + '/wp-content/uploads/' + String(path || '').replace(/^\//, '');
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
