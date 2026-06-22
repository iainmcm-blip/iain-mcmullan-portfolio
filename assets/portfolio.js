/* ============================================================
   IAIN McMULLAN PORTFOLIO — portfolio.js v2
   Vanilla JS — no dependencies
   ============================================================ */

(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── NAV: scroll elevation ─────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onNavScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  /* ── MOBILE MENU ────────────────────────────────────────── */
  const menuBtn  = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── HERO AMBIENT VIDEO ─────────────────────────────────── */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && reduce) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }
  // The video is rotated -90deg; size it to (wrapHeight x wrapWidth) so after
  // rotation it exactly covers the hero, regardless of viewport.
  const heroVideoWrap = document.querySelector('.hero-video-wrap');
  if (heroVideo && heroVideoWrap) {
    const sizeHeroVideo = () => {
      const w = heroVideoWrap.clientWidth, h = heroVideoWrap.clientHeight;
      if (w && h) { heroVideo.style.width = h + 'px'; heroVideo.style.height = w + 'px'; }
    };
    sizeHeroVideo();
    window.addEventListener('resize', sizeHeroVideo, { passive: true });
    // Re-measure once metadata/poster has laid out
    heroVideo.addEventListener('loadedmetadata', sizeHeroVideo);
    window.addEventListener('load', sizeHeroVideo);
  }

  /* ── FLOATING CTA ───────────────────────────────────────── */
  const floatingCta = document.querySelector('.floating-cta');
  if (floatingCta) {
    const onScroll = () =>
      floatingCta.classList.toggle('visible', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── SCROLL REVEALS (IntersectionObserver) ──────────────── */
  if (!reduce) {
    // Standard reveals (fade up)
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          // Stagger siblings in same parent
          const sibs = [...el.parentElement.children]
            .filter(c => c.classList.contains('reveal'));
          const idx = Math.max(0, sibs.indexOf(el));
          el.style.transitionDelay = Math.min(idx, 8) * 80 + 'ms';
          el.classList.add('active');
          observer.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      revealEls.forEach(el => observer.observe(el));
    }

    // Left-slide reveals (timeline)
    const revealLeftEls = document.querySelectorAll('.reveal-left');
    if (revealLeftEls.length) {
      const observerL = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const sibs = [...el.parentElement.children]
            .filter(c => c.classList.contains('reveal-left'));
          const idx = Math.max(0, sibs.indexOf(el));
          el.style.transitionDelay = Math.min(idx, 8) * 100 + 'ms';
          el.classList.add('active');
          observerL.unobserve(el);
        });
      }, { rootMargin: '0px 0px -5% 0px', threshold: 0.08 });
      revealLeftEls.forEach(el => observerL.observe(el));
    }
  } else {
    // Static fallback
    document.querySelectorAll('.reveal, .reveal-left').forEach(el =>
      el.classList.add('active'));
  }

  /* ── PILL CASCADE ───────────────────────────────────────── */
  if (!reduce) {
    const pillObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const pills = entry.target.querySelectorAll('.pill');
        pills.forEach((pill, i) => {
          setTimeout(() => pill.classList.add('active'), i * 45);
        });
        pillObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('.pills-wrap').forEach(group => {
      pillObserver.observe(group);
    });
  } else {
    document.querySelectorAll('.pill').forEach(p => p.classList.add('active'));
  }

  /* ── STAT COUNTERS ──────────────────────────────────────── */
  function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

  function animateCounter(el, target, duration, suffix) {
    if (reduce) { el.textContent = target + suffix; return; }
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuad(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterEls = document.querySelectorAll('[data-count]');
  if (counterEls.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target  = parseInt(el.dataset.count, 10);
        const suffix  = el.dataset.suffix || '';
        const duration = parseInt(el.dataset.duration || '1500', 10);
        animateCounter(el, target, duration, suffix);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.3 });
    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* ── HERO WORD SWAP ─────────────────────────────────────── */
  const wordSwap = document.getElementById('word-swap');
  if (wordSwap) {
    const words = [
      'Brand Strategy',
      'Content Systems',
      'AI & Marketing',
      'Global Leadership',
      'New Business',
      'Financial Rigour'
    ];
    let idx = 0;
    if (!reduce) {
      setInterval(() => {
        wordSwap.classList.add('swapping');
        setTimeout(() => {
          idx = (idx + 1) % words.length;
          wordSwap.textContent = words[idx];
          wordSwap.classList.remove('swapping');
        }, 380);
      }, 2600);
    }
  }

  /* ── NAV: active section highlight ─────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if (sections.length && navAnchors.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active',
            a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ── GSAP MOTION LAYER ─────────────────────────────────── */
  // Split the pull quote into per-character spans (needed for reveal + fallback)
  const pullQuote = document.querySelector('.persp-pull blockquote');
  if (pullQuote && !pullQuote.querySelector('.char')) {
    const text = pullQuote.textContent;
    pullQuote.textContent = '';
    for (const ch of text) {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      pullQuote.appendChild(s);
    }
  }

  const showHeroWords = () =>
    document.querySelectorAll('.h1-word').forEach(w => { w.style.opacity = '1'; w.style.transform = 'none'; });
  const showPullChars = () =>
    document.querySelectorAll('.persp-pull .char').forEach(c => { c.style.opacity = '1'; });

  if (reduce || typeof window.gsap === 'undefined') {
    // No motion / GSAP unavailable — guarantee everything is visible
    showHeroWords();
    showPullChars();
  } else {
    try {
      const hasST = typeof window.ScrollTrigger !== 'undefined';
      if (hasST) gsap.registerPlugin(ScrollTrigger);

      // 1) Hero headline — each word rises from below, 0.08s stagger, after 300ms.
      // Smaller rise on mobile so the last line never overlaps the rotating specialism line.
      const riseY = window.matchMedia('(max-width: 900px)').matches ? 14 : 40;
      gsap.fromTo('.h1-word', { y: riseY }, {
        y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.08, delay: 0.3,
        onComplete: () => document.querySelectorAll('.h1-word').forEach(w => { w.style.willChange = 'auto'; })
      });
      // Failsafe: never let the headline stay hidden if the ticker stalls
      setTimeout(showHeroWords, 2500);

      if (hasST) {
        // 2) Case-study image parallax (moves at ~0.6x within an oversized frame)
        gsap.utils.toArray('.case-img-wrap img').forEach(img => {
          const card = img.closest('.case-card');
          gsap.fromTo(img, { yPercent: -14 }, {
            yPercent: -4, ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
          });
        });

        // 3) Career-timeline gold spine draws downward as you scroll the section
        const spine = document.querySelector('.timeline-spine');
        if (spine) {
          gsap.fromTo(spine, { scaleY: 0 }, {
            scaleY: 1, ease: 'none', transformOrigin: 'top center',
            scrollTrigger: { trigger: '.timeline-list', start: 'top 78%', end: 'bottom 82%', scrub: 1 }
          });
        }

        // 4) Perspectives pull quote — characters fade in on entry
        const chars = document.querySelectorAll('.persp-pull .char');
        if (chars.length) {
          gsap.to(chars, {
            opacity: 1, duration: 0.012, stagger: 0.016, ease: 'none',
            scrollTrigger: { trigger: '.persp-pull', start: 'top 82%' }
          });
        }

        ScrollTrigger.refresh();
      } else {
        showPullChars(); // ScrollTrigger missing — reveal scroll-gated content
      }
    } catch (err) {
      // Any GSAP failure must never strand content hidden
      showHeroWords();
      showPullChars();
    }
  }

  /* ── MOBILE ADAPTIVE MASTHEAD ───────────────────────────── */
  // iOS Safari will not apply mix-blend-mode over a <video> (the video is composited on its
  // own GPU layer), so the desktop per-letter blend is unreadable on a phone. On mobile we
  // instead sample the video brightness behind each hero line — the same inverse-transform
  // mapping the adaptive CTA uses — and flip its colour directly via an .on-ink class: dark
  // over the pale ground, light over the dark ink. Desktop keeps its CSS blend; the .on-ink
  // colours only exist inside the (max-width: 900px) rules, so this is a no-op above that.
  // Hysteresis on the threshold stops the lines flickering at the boundary.
  (function heroAdaptiveText() {
    const hero = document.querySelector('.hero');
    const video = document.querySelector('.hero-video');
    const wrap = document.querySelector('.hero-video-wrap');
    if (!hero || !video || !wrap || reduce) return;
    if (typeof DOMMatrix === 'undefined') return;
    // Mobile now has its own upright portrait clip with solid, veiled text (no colour-flip);
    // desktop uses the CSS mix-blend. So this sampler is retired — just nudge autoplay.
    try { const p0 = video.play(); if (p0 && p0.catch) p0.catch(function () {}); } catch (e) {}
    return;
    /* eslint-disable no-unreachable */
    const mq = window.matchMedia('(max-width: 900px)');
    const els = ['.hero-name', '.hero-h1', '.hero-word-row', '.hero-bio', '.hero-scroll-hint']
      .map(function (s) { return document.querySelector(s); }).filter(Boolean);
    if (!els.length) return;
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    try { const p = video.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    let last = 0, failed = false;
    function step(t) {
      if (failed) return;                         // tainted canvas / unsupported: hand off to the veil fallback
      requestAnimationFrame(step);
      if (!mq.matches) { els.forEach(function (el) { el.classList.remove('on-ink'); }); return; }
      if (t - last < 150) return;
      last = t;
      const vw = video.videoWidth, vh = video.videoHeight;
      if (!vw || video.readyState < 2) return;
      try {
        if (cvs.width !== vw) { cvs.width = vw; cvs.height = vh; }
        ctx.drawImage(video, 0, 0, vw, vh);
        const wr = wrap.getBoundingClientRect();
        const bw = video.offsetWidth, bh = video.offsetHeight;          // layout box (pre-transform)
        const ox = 0.55 * wr.width + bw / 2;                            // transform-origin, wrap coords
        const oy = 0.50 * wr.height + bh / 2;
        const inv = new DOMMatrix(getComputedStyle(video).transform).inverse();
        const scale = Math.max(bw / vw, bh / vh);                        // object-fit: cover
        els.forEach(function (el) {
          const r = el.getBoundingClientRect();
          if (!r.width) return;
          const rel = inv.transformPoint(new DOMPoint(
            r.left + r.width / 2 - wr.left - ox,
            r.top + r.height / 2 - wr.top - oy));
          const lx = rel.x + bw / 2, ly = rel.y + bh / 2;               // local box coords
          let sx = (lx - (bw - vw * scale) / 2) / scale;
          let sy = (ly - (bh - vh * scale) / 2) / scale;
          sx = Math.max(0, Math.min(vw - 1, sx)); sy = Math.max(0, Math.min(vh - 1, sy));
          const d = ctx.getImageData(sx | 0, sy | 0, 1, 1).data;
          let L = (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
          L = ((L - 0.5) * 1.55 + 0.5) * 0.72;                          // approx the CSS contrast+brightness
          const vis = L * 0.70 + 0.28;                                  // approx composite over the veil
          const onNow = el.classList.contains('on-ink');
          let next = onNow;
          if (vis < 0.52) next = true; else if (vis > 0.62) next = false;
          el.classList.toggle('on-ink', next);
        });
      } catch (e) {
        if (e && e.name === 'SecurityError') {        // canvas tainted: cannot sample at all
          failed = true;
          hero.classList.add('sample-failed');        // CSS swaps in a heavy veil; text stays dark + legible
          els.forEach(function (el) { el.classList.remove('on-ink'); });
        }
        /* other (transient) errors: keep the last state and try again next frame */
      }
    }
    requestAnimationFrame(step);
  })();

  /* ── ADAPTIVE "GET IN TOUCH" BORDER ─────────────────────── */
  // Periwinkle border on light; flips to white when dark ink is behind it.
  // Samples the hero video, inverse-maps the button's position through the video's
  // CSS transform, and reads the pixel underneath. Degrades to periwinkle on error.
  (function adaptiveCta() {
    const btn = document.getElementById('hero-cta-outline');
    const video = document.querySelector('.hero-video');
    const wrap = document.querySelector('.hero-video-wrap');
    if (!btn || !video || !wrap || reduce) return;          // reduced-motion hides the video → periwinkle default
    if (typeof DOMMatrix === 'undefined') return;
    if (window.matchMedia('(max-width: 900px)').matches) return;  // mobile uses its own clip; keep the default border
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    let last = 0;
    function step(t) {
      requestAnimationFrame(step);
      if (t - last < 140) return;                            // ~7fps is plenty
      last = t;
      const vw = video.videoWidth, vh = video.videoHeight;
      if (!vw || video.readyState < 2) return;
      try {
        if (cvs.width !== vw) { cvs.width = vw; cvs.height = vh; }
        ctx.drawImage(video, 0, 0, vw, vh);
        const b = btn.getBoundingClientRect();
        const wr = wrap.getBoundingClientRect();
        const bw = video.offsetWidth, bh = video.offsetHeight;       // layout box (pre-transform)
        const ox = 0.55 * wr.width + bw / 2;                          // transform-origin (centre), wrap coords
        const oy = 0.50 * wr.height + bh / 2;
        const inv = new DOMMatrix(getComputedStyle(video).transform).inverse();
        const rel = inv.transformPoint(new DOMPoint(b.left + b.width / 2 - wr.left - ox, b.top + b.height / 2 - wr.top - oy));
        const lx = rel.x + bw / 2, ly = rel.y + bh / 2;              // local box coords
        const scale = Math.max(bw / vw, bh / vh);                     // object-fit: cover
        let sx = (lx - (bw - vw * scale) / 2) / scale;
        let sy = (ly - (bh - vh * scale) / 2) / scale;
        sx = Math.max(0, Math.min(vw - 1, sx)); sy = Math.max(0, Math.min(vh - 1, sy));
        const d = ctx.getImageData(sx | 0, sy | 0, 1, 1).data;
        let L = (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
        L = ((L - 0.5) * 1.55 + 0.5) * 0.72;                          // approx the CSS contrast+brightness
        const vis = L * 0.45 + 0.55;                                  // approx composite over the warm veil
        btn.classList.toggle('over-ink', vis < 0.6);
      } catch (e) { btn.classList.remove('over-ink'); }
    }
    requestAnimationFrame(step);
  })();

})();
