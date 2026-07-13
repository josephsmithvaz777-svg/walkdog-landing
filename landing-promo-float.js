(function () {
  'use strict';

  var STORAGE_KEY = 'wd_promo_elite_dismissed';
  var root = document.getElementById('promo-float');
  var closeBtn = document.getElementById('promo-float-close');
  if (!root || !closeBtn) return;

  function isDismissed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function dismiss() {
    root.hidden = true;
    root.classList.remove('is-visible');
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* ignore */ }
  }

  function show() {
    if (isDismissed()) return;
    root.hidden = false;
    requestAnimationFrame(function () {
      root.classList.add('is-visible');
    });
  }

  closeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dismiss();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
})();
