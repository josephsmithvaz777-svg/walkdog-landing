(function () {
  'use strict';

  function init(root) {
    var slides = Array.from(root.querySelectorAll('.results-showcase__slide'));
    var panels = Array.from(root.querySelectorAll('.results-showcase__panel'));
    var dots = Array.from(root.querySelectorAll('.results-showcase__dot'));
    if (slides.length < 2 || slides.length !== panels.length) return;

    var intervalMs = parseInt(root.getAttribute('data-interval'), 10);
    if (!Number.isFinite(intervalMs) || intervalMs < 2500) intervalMs = 5000;

    var active = 0;
    var timer = null;

    function setActive(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        var on = i === active;
        slide.classList.toggle('is-active', on);
        slide.setAttribute('aria-hidden', on ? 'false' : 'true');
      });

      panels.forEach(function (panel, i) {
        var on = i === active;
        panel.classList.toggle('is-active', on);
        panel.hidden = !on;
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function next() {
      setActive(active + 1);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(next, intervalMs);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    setActive(0);

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) startTimer();
          else stopTimer();
        },
        { threshold: 0.15 }
      );
      observer.observe(root);
    } else {
      startTimer();
    }
  }

  function boot() {
    document.querySelectorAll('[data-results-carousel]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
