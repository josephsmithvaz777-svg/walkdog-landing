(function () {
  'use strict';

  var urls = typeof WalkDogUrls !== 'undefined' ? WalkDogUrls : null;
  var nav = document.getElementById('site-nav');
  var toggle = document.getElementById('site-nav-toggle');
  var menu = document.getElementById('site-nav-menu');
  var socialModal = document.getElementById('social-modal');
  var lastFocusedBeforeModal = null;

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  function closeNav() {
    setNavOpen(false);
  }

  function openSocialModal() {
    if (!socialModal) return;
    closeNav();
    lastFocusedBeforeModal = document.activeElement;
    socialModal.hidden = false;
    document.body.classList.add('social-modal-open');
    var closeBtn = socialModal.querySelector('.social-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeSocialModal() {
    if (!socialModal) return;
    socialModal.hidden = true;
    document.body.classList.remove('social-modal-open');
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
      lastFocusedBeforeModal.focus();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setNavOpen(!nav.classList.contains('is-open'));
    });

    menu.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('click', function () {
        if (!el.hasAttribute('data-social-open')) {
          closeNav();
        }
      });
    });

    document.querySelectorAll('.site-nav__link[href^="#"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var id = (el.getAttribute('href') || '').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          var navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-nav-height')) || 56;
          var extraDown = id === 'membresias' ? 140 : 0;
          var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8 + extraDown;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
          closeNav();
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target)) closeNav();
    });
  }

  document.querySelectorAll('[data-social-open]').forEach(function (el) {
    el.addEventListener('click', openSocialModal);
  });

  if (socialModal) {
    socialModal.querySelectorAll('[data-social-close]').forEach(function (el) {
      el.addEventListener('click', closeSocialModal);
    });

    document.addEventListener('keydown', function (e) {
      if (!socialModal.hidden && e.key === 'Escape') {
        closeSocialModal();
      }
    });
  }

  if (urls) {
    document.querySelectorAll('[data-platform-login]').forEach(function (el) {
      el.setAttribute('href', urls.login);
    });

    var social = urls.social || {};
    var whatsapp = document.getElementById('social-link-whatsapp');
    var instagram = document.getElementById('social-link-instagram');
    var facebook = document.getElementById('social-link-facebook');
    var whatsappLabel = document.getElementById('social-link-whatsapp-label');

    if (whatsapp && social.whatsapp) whatsapp.setAttribute('href', social.whatsapp);
    if (instagram && social.instagram) instagram.setAttribute('href', social.instagram);
    if (facebook && social.facebook) facebook.setAttribute('href', social.facebook);
    if (whatsappLabel && social.whatsappLabel) whatsappLabel.textContent = social.whatsappLabel;

    [
      ['footer-link-instagram', social.instagram],
      ['footer-social-whatsapp', social.whatsapp],
      ['footer-social-instagram', social.instagram],
      ['footer-social-facebook', social.facebook],
    ].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (el && pair[1]) el.setAttribute('href', pair[1]);
    });
  }

  var navSectionLinks = document.querySelectorAll('.site-nav__link[data-nav-section]');

  function setActiveNavSection(sectionId) {
    navSectionLinks.forEach(function (link) {
      var isActive = link.getAttribute('data-nav-section') === sectionId;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function updateActiveNavSection() {
    var offset = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-nav-height')) || 56) + 48;
    var marker = window.scrollY + offset;
    var sections = ['membresias', 'testimonios', 'beneficios', 'inicio'];
    var activeId = 'inicio';

    for (var i = 0; i < sections.length; i++) {
      var el = document.getElementById(sections[i]);
      if (el && marker >= el.offsetTop) {
        activeId = sections[i];
        break;
      }
    }

    setActiveNavSection(activeId);
  }

  if (navSectionLinks.length) {
    setActiveNavSection('inicio');
    window.addEventListener('scroll', updateActiveNavSection, { passive: true });
    window.addEventListener('resize', updateActiveNavSection);
    updateActiveNavSection();

    navSectionLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        var sectionId = link.getAttribute('data-nav-section');
        if (sectionId) setActiveNavSection(sectionId);
      });
    });
  }
})();
