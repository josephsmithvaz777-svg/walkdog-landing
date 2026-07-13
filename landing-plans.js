(function () {
  'use strict';

  var urls = typeof WalkDogUrls !== 'undefined' ? WalkDogUrls : null;
  var eliteBonusModal = document.getElementById('elite-bonus-modal');
  var eliteBonusTrigger = document.querySelector('[data-elite-bonus-open]');
  var lastFocusedBeforeModal = null;

  function openEliteBonusModal() {
    if (!eliteBonusModal) return;
    lastFocusedBeforeModal = document.activeElement;
    eliteBonusModal.hidden = false;
    document.body.classList.add('elite-bonus-modal-open');
    var closeBtn = eliteBonusModal.querySelector('.elite-bonus-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeEliteBonusModal() {
    if (!eliteBonusModal) return;
    eliteBonusModal.hidden = true;
    document.body.classList.remove('elite-bonus-modal-open');
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
      lastFocusedBeforeModal.focus();
    }
  }

  if (eliteBonusTrigger && eliteBonusModal) {
    eliteBonusTrigger.addEventListener('click', openEliteBonusModal);

    eliteBonusModal.querySelectorAll('[data-elite-bonus-close]').forEach(function (el) {
      el.addEventListener('click', closeEliteBonusModal);
    });

    document.addEventListener('keydown', function (e) {
      if (!eliteBonusModal.hidden && e.key === 'Escape') {
        closeEliteBonusModal();
      }
    });
  }

  document.querySelectorAll('[data-scroll-membresias]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var target = document.getElementById('membresias');
      if (target) {
        e.preventDefault();
        var navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-nav-height')) || 56;
        var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8 + 140;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    });
  });

  if (!urls) return;

  document.querySelectorAll('[data-checkout-plan]').forEach(function (el) {
    var plan = el.getAttribute('data-checkout-plan');
    if (plan) {
      el.setAttribute('href', urls.checkoutPage(plan));
    }
  });

  document.querySelectorAll('[data-platform-home]').forEach(function (el) {
    el.setAttribute('href', urls.inicio);
  });
})();
