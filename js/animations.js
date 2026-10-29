/* Aarthi Travels — hero slider, scroll reveal, subtle 3D tilt, parallax.
   Motion is reduced or disabled when the visitor prefers reduced motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Hero background slider: 5 full-screen images, each with its own 3D transition ---------- */
  var SLIDE_MS = 6500;
  function initSlider() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) return;
    var slides = root.querySelectorAll('.hero-bg-slide');
    var dots = root.querySelectorAll('.hero-dot');
    var barFill = root.querySelector('.hero-progress span');
    var caption = root.querySelector('.slide-caption');
    var pauseBtn = root.querySelector('.hero-pause');
    var n = slides.length, idx = 0, timer = null, userPaused = reduce, focusPaused = false;
    root.style.setProperty('--slide-ms', SLIDE_MS + 'ms');

    function setCaption() {
      if (!caption) return;
      caption.innerHTML = '<strong>' + slides[idx].getAttribute('data-title') + ':</strong> ' + slides[idx].getAttribute('data-text');
    }
    function restartBar() {
      if (!barFill) return;
      barFill.classList.remove('run'); void barFill.offsetWidth;
      if (!userPaused && !reduce) barFill.classList.add('run');
    }
    function show(next) {
      next = (next + n) % n; if (next === idx) return;
      var prev = idx; idx = next;
      slides[prev].classList.remove('is-active'); slides[prev].classList.add('is-leaving');
      setTimeout(function (el) { return function () { el.classList.remove('is-leaving'); }; }(slides[prev]), 2000);
      slides[idx].classList.remove('is-leaving'); slides[idx].classList.add('is-active');
      dots.forEach(function (d, i) { if (i === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      setCaption(); restartBar();
    }
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop(); root.classList.toggle('is-paused', userPaused || focusPaused);
      if (!userPaused && !focusPaused && !document.hidden) {
        timer = setInterval(function () { show(idx + 1); }, SLIDE_MS);
        if (barFill && !barFill.classList.contains('run')) restartBar();
      }
    }
    function updatePause() {
      if (!pauseBtn) return;
      pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
      pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    }
    root.querySelectorAll('.hero-arrow').forEach(function (b) {
      b.addEventListener('click', function () { show(idx + (b.classList.contains('prev') ? -1 : 1)); restartBar(); start(); });
    });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); restartBar(); start(); }); });
    if (pauseBtn) pauseBtn.addEventListener('click', function () { userPaused = !userPaused; updatePause(); restartBar(); start(); });
    root.addEventListener('focusin', function () { focusPaused = true; start(); });
    root.addEventListener('focusout', function () { focusPaused = false; start(); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(idx - 1); restartBar(); start(); } else if (e.key === 'ArrowRight') { show(idx + 1); restartBar(); start(); }
    });
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { show(idx + (dx < 0 ? 1 : -1)); restartBar(); start(); }
    }, { passive: true });
    document.addEventListener('visibilitychange', start);
    setCaption(); updatePause(); restartBar(); start();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSlider();

    // Stagger grid items so cards arrive one after another
    document.querySelectorAll('.grid, .steps, .filter-bar').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.classList.add('reveal-item'); c.style.setProperty('--d', ((i % 4) * 0.1).toFixed(2) + 's');
      });
    });

    // Scroll reveal
    var els = document.querySelectorAll('.reveal, .reveal-item, .reveal-left, .reveal-right, .reveal-zoom, .content-section h2');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { io.observe(el); });
      setTimeout(function () { els.forEach(function (el) { el.classList.add('is-visible'); }); }, 5000); // safety net
    }
    if (reduce || !finePointer) return;

    // Subtle card tilt (max 3 degrees)
    var MAX = 3;
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('is-tracking');
        card.style.setProperty('--ry', (px * MAX * 2).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * MAX * 2).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tracking');
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });

    // Hero parallax (small movement, desktop only)
    var hero = document.querySelector('.hero');
    if (!hero || window.innerWidth < 961) return;
    var stack = hero.querySelector('.hero-bg-stack'), copy = hero.querySelector('.hero-copy');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      stack.style.setProperty('--by', (x * 4).toFixed(2) + 'deg'); stack.style.setProperty('--bx', (-y * 3).toFixed(2) + 'deg');
      copy.style.setProperty('--ry', (x * 5).toFixed(2) + 'deg'); copy.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', function () {
      ['--bx', '--by'].forEach(function (k) { stack.style.setProperty(k, '0deg'); });
      ['--rx', '--ry'].forEach(function (k) { copy.style.setProperty(k, '0deg'); });
    });
    var bg = hero.querySelector('.hero-bg'), ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        if (window.scrollY < hero.offsetHeight) bg.style.transform = 'translate3d(0,' + (window.scrollY * 0.18).toFixed(1) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  });
})();
