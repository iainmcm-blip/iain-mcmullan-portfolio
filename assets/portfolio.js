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

})();
