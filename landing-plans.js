(function () {
  'use strict';

  document.querySelectorAll('[data-scroll-membresias]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var target = document.getElementById('membresias');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
