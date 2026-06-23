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
    var stepPx = 160;
    var ready = false;
    var pointerStartX = 0;
    var pointerStartY = 0;
    var pointerDragging = false;

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

    function syncSliderHeight() {
      var maxH = 0;
      items.forEach(function (item) {
        var h = item.offsetHeight;
        if (h > maxH) maxH = h;
      });
      if (maxH > 0) {
        slider.style.minHeight = maxH + 16 + 'px';
      }
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

      requestAnimationFrame(syncSliderHeight);

      if (instant && !ready) {
        ready = true;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            setTransition(false);
          });
        });
      }
    }

    function goTo(index) {
      active = ((index % items.length) + items.length) % items.length;
      loadShow(false);
      startTimer();
    }

    function next() {
      goTo(active + 1);
    }

    function prev() {
      goTo(active - 1);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        if (!document.hidden) next();
      }, intervalMs);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        if (i === active) return;
        goTo(i);
      });
    });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      }
    });

    root.addEventListener(
      'pointerdown',
      function (event) {
        if (event.button !== 0) return;
        pointerDragging = true;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        root.classList.add('is-dragging');
      },
      { passive: true }
    );

    root.addEventListener(
      'pointerup',
      function (event) {
        root.classList.remove('is-dragging');
        if (!pointerDragging) return;
        pointerDragging = false;

        var dx = event.clientX - pointerStartX;
        var dy = event.clientY - pointerStartY;

        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;

        if (dx < 0) next();
        else prev();
      },
      { passive: true }
    );

    root.addEventListener('pointercancel', function () {
      pointerDragging = false;
      root.classList.remove('is-dragging');
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
      items.forEach(function (item) {
        var img = item.querySelector('img');
        if (img && !img.complete) {
          img.addEventListener('load', syncSliderHeight, { once: true });
        }
      });
      requestAnimationFrame(syncSliderHeight);
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
