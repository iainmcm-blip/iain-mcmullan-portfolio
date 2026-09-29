/* Home hero: a stack of browser cards playing real site recordings, a masked
   headline reveal, and hover-to-play video on the Recent builds rows.
   Content is visible without JS; the .js hidden states in hero.css have a
   CSS failsafe, and reduced motion gets posters with no cycling. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hero = document.querySelector('.hx');
  if (!hero) return;
  var stage = document.getElementById('hx-stage');
  var cards = Array.prototype.slice.call(stage.querySelectorAll('.hx-card'));
  var nav = document.getElementById('nav');

  var load = function (v) { if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src; };
  var posOf = function (c) { return +c.dataset.pos; };
  var front = function () { return cards.filter(function (c) { return posOf(c) === 0; })[0]; };

  /* ── Load choreography: the CSS does the motion, this just starts it ── */
  var start = function () {
    hero.classList.add('is-in');
    setTimeout(function () { stage.parentNode.classList.add('is-open'); }, reduce ? 0 : 1550);
    setTimeout(function () { stage.classList.add('is-fanned'); }, reduce ? 0 : 1600);
  };
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 500); })]).then(start);
  else start();

  /* ── Nav reads light-on-dark while the hero is under it ── */
  if (nav && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { nav.classList.toggle('nav--dark', e[0].isIntersecting); },
      { rootMargin: '-72px 0px -100% 0px' }).observe(hero);
  }

  /* ── Caption + URL typing for whichever card is in front ── */
  var el = function (id) { return document.getElementById(id); };
  var typeTimer = null;
  var lines = Array.prototype.slice.call(hero.querySelectorAll('.hx-line'));
  var show = function (c) {
    var i = cards.indexOf(c) + 1;
    el('hx-n').textContent = (i < 10 ? '0' : '') + i;
    el('hx-name').textContent = c.dataset.title;
    el('hx-role').textContent = c.dataset.role;
    var live = el('hx-live');
    if (c.dataset.live) { live.href = c.dataset.live; live.target = '_blank'; live.innerHTML = 'Live site <span aria-hidden="true">&#8599;</span>'; }
    else { live.href = c.dataset.href; live.removeAttribute('target'); live.innerHTML = 'Case study <span aria-hidden="true">&rarr;</span>'; }
    lines.forEach(function (l) { l.classList.toggle('is-on', l.dataset.verb === c.dataset.verb); });
    stage.href = c.dataset.href;
    stage.setAttribute('aria-label', 'Now showing ' + c.dataset.title + '. Open the case study.');
    var url = c.querySelector('.hx-url'), full = url.dataset.full || (url.dataset.full = url.textContent), n = 0;
    clearInterval(typeTimer);
    if (reduce) return;
    url.textContent = '';
    typeTimer = setInterval(function () { url.textContent = full.slice(0, ++n); if (n >= full.length) clearInterval(typeTimer); }, 26);
  };

  if (reduce) { show(front()); return wireBuilds(); }

  /* ── Cycling: front clip plays; on end it drops to the back ── */
  var safety = null, running = false, busy = false, pageTimer = null;
  // The book card has no clip: it turns three spreads, then advances on a timer.
  var turnPages = function (c) {
    var imgs = c.querySelectorAll('.hx-book img'), k = 0;
    var on = function () { Array.prototype.forEach.call(imgs, function (im, j) { im.classList.toggle('is-on', j === k); }); };
    on(); clearInterval(pageTimer);
    pageTimer = setInterval(function () { k = (k + 1) % imgs.length; on(); }, 2500);
  };
  var playFront = function () {
    var c = front(), v = c.querySelector('video');
    show(c);
    if (v) {
      load(v); v.currentTime = 0;
      var p = v.play(); if (p && p.catch) p.catch(function () { arm(6000); });
      arm(14000);                                 // ponytail: safety net if 'ended' never fires (stalled network)
    } else { turnPages(c); arm(7500); }
    var next = cards.filter(function (x) { return posOf(x) === 1; })[0];
    var nv = next && next.querySelector('video');
    if (nv) { nv.preload = 'auto'; load(nv); }
  };
  var stopFront = function () { var v = front().querySelector('video'); if (v) v.pause(); clearInterval(pageTimer); };
  var arm = function (ms) { clearTimeout(safety); safety = setTimeout(advance, ms); };
  var advance = function () {
    if (busy || !running) return; busy = true;
    clearTimeout(safety);
    var c = front(); c.classList.add('is-leaving');
    setTimeout(function () {
      var v = c.querySelector('video'); if (v) v.pause();
      clearInterval(pageTimer);
      cards.forEach(function (x) { x.dataset.pos = (posOf(x) + cards.length - 1) % cards.length; });
      c.classList.remove('is-leaving');
      busy = false; playFront();
    }, 520);
  };
  cards.forEach(function (c) { var v = c.querySelector('video'); if (v) v.addEventListener('ended', function () { if (c === front()) advance(); }); });

  var resume = function () { if (running) return; running = true; playFront(); };
  var pause = function () { running = false; clearTimeout(safety); stopFront(); };
  var visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible && !document.hidden ? resume() : pause(); }, { threshold: 0.15 }).observe(stage);
  } else resume();
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : (visible && resume()); });

  /* ── Tilt toward the pointer, and a light cursor over the dark hero ── */
  if (finePointer) {
    hero.addEventListener('pointerenter', function () { document.body.classList.add('cursor-light'); });
    hero.addEventListener('pointerleave', function () { document.body.classList.remove('cursor-light'); });
  }
  var withGsap = function (fn) { if (window.gsap) fn(); else window.addEventListener('load', function () { if (window.gsap) fn(); }); };
  withGsap(function () {
    if (finePointer) {
      gsap.set(stage, { transformPerspective: 1400 });
      var rx = gsap.quickTo(stage, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      var ry = gsap.quickTo(stage, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      hero.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        ry(((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 10);
        rx(-((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 8);
      });
      hero.addEventListener('pointerleave', function () { rx(0); ry(0); });
    }
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      var st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 };
      gsap.to('.hx-title', { yPercent: -18, opacity: 0.25, ease: 'none', scrollTrigger: st });
      gsap.to('.hx-stage-wrap', { y: '-8vh', scale: 0.95, ease: 'none', scrollTrigger: st });
    }
  });

  wireBuilds();

  /* ── Recent builds: video plays on hover (fine pointers) or in view (touch) ── */
  function wireBuilds() {
    var medias = document.querySelectorAll('.wf-media');
    if (reduce || !medias.length) return;
    Array.prototype.forEach.call(medias, function (m) {
      var v = m.querySelector('video');
      var on = function () { load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); m.classList.add('is-playing'); };
      var off = function () { v.pause(); m.classList.remove('is-playing'); };
      if (finePointer) {
        m.addEventListener('mouseenter', on); m.addEventListener('focus', on);
        m.addEventListener('mouseleave', off); m.addEventListener('blur', off);
      } else if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { e[0].isIntersecting ? on() : off(); }, { threshold: 0.6 }).observe(m);
      }
    });
  }
})();
