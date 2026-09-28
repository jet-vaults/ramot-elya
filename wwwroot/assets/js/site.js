/* אליה על הפארק 2 — progressive enhancement, no dependencies */
(function () {
  'use strict';
  var d = document, b = d.body, html = d.documentElement;
  html.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header shadow once scrolled (IntersectionObserver on a sentinel, no scroll listener) */
  var header = d.querySelector('.header'), sentinel = d.querySelector('#top-sentinel');
  if (header && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      header.classList.toggle('is-scrolled', !es[0].isIntersecting);
    }).observe(sentinel);
  }

  /* mobile menu */
  var burger = d.querySelector('.burger'), menu = d.querySelector('.menu');
  function setMenu(open) {
    b.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var f = menu.querySelector('a, button'); if (f) f.focus(); } else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!b.classList.contains('menu-open')); });
    menu.querySelectorAll('[data-close-menu]').forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });
    menu.querySelectorAll('a[href]').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && b.classList.contains('menu-open')) setMenu(false); });
  }

  /* active nav link by section */
  var sections = d.querySelectorAll('main section[id]'), navLinks = d.querySelectorAll('.nav a[href^="#"]');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* scroll reveal + counters */
  var rv = d.querySelectorAll('.rv');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10), dur = 1400, start = null;
    if (reduce || isNaN(target)) { el.textContent = target; return; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && rv.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(countUp);
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); el.querySelectorAll('[data-count]').forEach(function (c) { c.textContent = c.getAttribute('data-count'); }); });
  }

  /* gallery lightbox: keyboard, swipe, focus trap */
  var links = Array.prototype.slice.call(d.querySelectorAll('a[data-full]'));
  var lb = d.querySelector('.lightbox');
  if (links.length && lb) {
    var img = lb.querySelector('.lightbox__img'), cap = lb.querySelector('.lightbox__cap'), count = lb.querySelector('.lightbox__count');
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + links.length) % links.length;
      var a = links[idx];
      img.src = a.getAttribute('data-full');
      img.alt = a.querySelector('img').alt;
      cap.textContent = a.getAttribute('data-caption') || '';
      count.textContent = (idx + 1) + ' / ' + links.length;
    }
    function open(i) { lastFocus = d.activeElement; show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); b.style.overflow = 'hidden'; lb.querySelector('.lightbox__close').focus(); }
    function close() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); b.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      /* RTL: the "next" image is to the left */
      else if (e.key === 'ArrowLeft') show(idx + 1);
      else if (e.key === 'ArrowRight') show(idx - 1);
      else if (e.key === 'Tab') {
        var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(dx < 0 ? idx + 1 : idx - 1);
    }, { passive: true });
  }
})();
