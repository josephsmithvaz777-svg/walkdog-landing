/**
 * URLs oficiales WalkDog — landing vs plataforma Laravel.
 */
(function (global) {
  var LANDING = 'https://walkdogentrena.com';
  var isLocalPreview = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
    || window.location.port === '5500'
    || window.location.port === '8080'
  );
  var PLATFORM = isLocalPreview
    ? 'http://127.0.0.1:8000'
    : 'https://formacion.walkdogentrena.com';

  var PLAN_SLUGS = {
    1: 'basico',
    2: 'intermedio',
    3: 'premium',
    basico: 'basico',
    intermedio: 'intermedio',
    premium: 'premium',
  };

  function planSlug(plan) {
    return PLAN_SLUGS[plan] || String(plan || 'intermedio').toLowerCase();
  }

  global.WalkDogUrls = {
    landing: LANDING + '/',
    platform: PLATFORM + '/',
    login: PLATFORM + '/login',
    inicio: PLATFORM + '/inicio',
    culqiPublicKey: 'pk_test_A2YUlnNVzvWhJev5',
    apiConfig: PLATFORM + '/api/landing/config',
    apiCheckout: PLATFORM + '/api/landing/checkout',
    social: {
      whatsapp: 'https://wa.link/xcijqx',
      whatsappLabel: '913 100 552',
      instagram: 'https://www.instagram.com/walkdogperu/',
      facebook: 'https://www.facebook.com/walkdogperu',
    },
    /**
     * Publicidad (solo landing). Vacío = no carga nada aunque el usuario acepte.
     * Ejemplo Meta: metaPixelId: '123456789012345'
     * Ejemplo AdSense: adsenseClient: 'ca-pub-XXXXXXXXXXXXXXXX'
     */
    ads: {
      metaPixelId: '',
      adsenseClient: '',
    },
    checkoutPage: function (plan) {
      return 'checkout.html?plan=' + encodeURIComponent(planSlug(plan));
    },
    checkout: function (plan) {
      return PLATFORM + '/checkout/' + encodeURIComponent(planSlug(plan));
    },
    legacyCheckout: function (level) {
      return PLATFORM + '/checkout/?level=' + encodeURIComponent(level);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
