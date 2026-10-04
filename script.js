(function () {
  'use strict';

  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var burger = document.getElementById('nav-burger');
  var links = document.getElementById('nav-links');
  var themeBtn = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  /* ---------- Année du footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Thème clair / sombre ---------- */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#14130f' : '#f6f1e7');
  }
  applyTheme(root.getAttribute('data-theme') || 'dark');

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Navigation : état au scroll ---------- */
  var ticking = false;
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });
  window.matchMedia('(min-width: 60rem)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Apparition au scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    // Léger décalage entre éléments frères pour un effet en cascade
    reveals.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains('reveal');
      });
      var i = siblings.indexOf(el);
      if (i > 0) el.style.setProperty('--delay', Math.min(i * 0.08, 0.4) + 's');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Résumé du mémoire (accordéon) ---------- */
  var absToggle = document.getElementById('abstract-toggle');
  var absFull = document.getElementById('abstract-full');
  if (absToggle && absFull) {
    var absLabel = absToggle.querySelector('.research__toggle-label');
    function setAbstract(open) {
      absFull.hidden = !open;
      absToggle.setAttribute('aria-expanded', String(open));
      absLabel.textContent = open ? 'Réduire le résumé' : 'Lire le résumé complet';
    }
    // Sans JS, le résumé reste entièrement visible ; avec JS on le replie
    absToggle.hidden = false;
    setAbstract(false);
    absToggle.addEventListener('click', function () {
      setAbstract(absToggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  /* ---------- Comptage animé des chiffres clés ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function formatNumber(n, decimals) {
    // Format français : virgule décimale, vrai signe moins
    return n.toFixed(decimals).replace('.', ',').replace('-', '−');
  }
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countIO.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        var decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
        var duration = 1600;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = formatNumber(target * eased, decimals);
          if (p < 1) window.requestAnimationFrame(step);
          else el.textContent = formatNumber(target, decimals);
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) {
      el.textContent = formatNumber(0, parseInt(el.getAttribute('data-decimals'), 10) || 0);
      countIO.observe(el);
    });
  }

  /* ---------- Lien actif dans la navigation ---------- */
  var navAnchors = links.querySelectorAll('a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  }
})();
