(function () {
  'use strict';

  function init() {
    var root = document.querySelector('[data-problem-carousel]');
    if (!root) return;

    var slider = root.querySelector('.problem-carousel__slider');
    if (!slider) return;

    var items = Array.from(slider.querySelectorAll('.problem-card'));
    if (items.length < 2) return;

    var intervalMs = parseInt(root.getAttribute('data-interval'), 10);
    if (!Number.isFinite(intervalMs) || intervalMs < 2000) intervalMs = 4500;

    var active = Math.floor(items.length / 2);
    var timer = null;
    var paused = false;
    var stepPx = 160;
    var ready = false;

    function measureStep() {
      var w = items[0] ? items[0].offsetWidth : 300;
      var vw = slider.getBoundingClientRect().width || window.innerWidth;
      stepPx = Math.round(Math.max(w * 0.88 + 20, Math.min(vw * 0.28, w * 1.05)));
    }

    function setTransition(instant) {
      var value = instant
        ? 'none'
        : 'transform 0.68s cubic-bezier(0.45, 0, 0.22, 1), opacity 0.55s ease, filter 0.55s ease';
      items.forEach(function (item) {
        item.style.transition = value;
        var surface = item.querySelector('.problem-card__surface');
        if (surface) {
          surface.style.transition = instant
            ? 'none'
            : 'box-shadow 0.68s ease';
        }
      });
    }

    function sideStyle(stt, dir) {
      var x = dir * stepPx * stt;
      var scale = Math.max(0.82, 1 - 0.1 * stt);
      var ry = dir * -(2 + stt * 4);
      var tz = -25 * stt;
      var blur = stt === 1 ? 3.5 : 5;
      var opacity = Math.max(0.45, 0.72 - stt * 0.12);

      return {
        transform:
          'translate3d(' + x + 'px,0,' + tz + 'px) scale(' + scale + ') rotateY(' + ry + 'deg)',
        zIndex: String(8 - stt),
        filter: 'blur(' + blur + 'px) brightness(0.96)',
        opacity: opacity
      };
    }

    function getOffset(index) {
      var n = items.length;
      var diff = index - active;
      while (diff > n / 2) diff -= n;
      while (diff < -n / 2) diff += n;
      return diff;
    }

    function loadShow(instant) {
      measureStep();
      setTransition(!!instant);

      items.forEach(function (item, i) {
        item.classList.remove('is-active', 'is-side', 'is-prev', 'is-next');
        item.setAttribute('aria-hidden', 'true');

        var offset = getOffset(i);

        if (offset === 0) {
          item.style.transform = 'translate3d(0,0,0) scale(1) rotateY(0deg)';
          item.style.zIndex = '10';
          item.style.filter = 'none';
          item.style.opacity = '1';
          item.classList.add('is-active');
          item.setAttribute('aria-hidden', 'false');
          return;
        }

        var stt = Math.abs(offset);
        var dir = offset > 0 ? 1 : -1;
        var side = sideStyle(stt, dir);

        item.style.transform = side.transform;
        item.style.zIndex = side.zIndex;
        item.style.filter = side.filter;
        item.style.opacity = String(side.opacity);
        item.classList.add('is-side', offset > 0 ? 'is-next' : 'is-prev');
      });

      if (instant && !ready) {
        ready = true;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            setTransition(false);
          });
        });
      }
    }

    function next() {
      active = (active + 1) % items.length;
      loadShow(false);
    }

    function prev() {
      active = (active - 1 + items.length) % items.length;
      loadShow(false);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        if (!paused && !document.hidden) next();
      }, intervalMs);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    root.addEventListener('mouseenter', function () {
      paused = true;
    });
    root.addEventListener('mouseleave', function () {
      paused = false;
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopTimer();
      else startTimer();
    });

    window.addEventListener(
      'resize',
      function () {
        loadShow(true);
      },
      { passive: true }
    );

    function boot() {
      loadShow(true);
      startTimer();
    }

    if (document.readyState === 'complete') {
      requestAnimationFrame(boot);
    } else {
      window.addEventListener('load', boot, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
