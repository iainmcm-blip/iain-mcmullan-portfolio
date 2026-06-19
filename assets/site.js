// Enable JS-only progressive enhancements (reveals stay visible if this never runs)
document.documentElement.classList.add('js');

// Mobile menu
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    })
  );
}

// Scroll reveal — staggered, triggers as elements enter the viewport (respects prefers-reduced-motion).
// Uses a scroll/rAF check rather than IntersectionObserver for maximum reliability across renderers.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = [...document.querySelectorAll('.reveal')];
if (reduce) {
  reveals.forEach((el) => el.classList.add('active'));
} else if (reveals.length) {
  const revealCheck = () => {
    const vh = window.innerHeight;
    for (const el of reveals) {
      if (el.classList.contains('active')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) {
        // Stagger siblings sharing a parent so rows/grids cascade in
        const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
        const idx = Math.max(0, sibs.indexOf(el));
        el.style.transitionDelay = Math.min(idx, 6) * 75 + 'ms';
        el.classList.add('active');
      }
    }
  };
  let revTick = false;
  const onReveal = () => { if (!revTick) { requestAnimationFrame(() => { revealCheck(); revTick = false; }); revTick = true; } };
  addEventListener('scroll', onReveal, { passive: true });
  addEventListener('resize', onReveal, { passive: true });
  addEventListener('load', revealCheck);
  revealCheck();
}

// Parallax — subtle depth on [data-parallax] layers, rAF-throttled (motion-allowed only)
if (!reduce) {
  const layers = [...document.querySelectorAll('[data-parallax]')];
  if (layers.length) {
    let ticking = false;
    const apply = () => {
      const vh = window.innerHeight;
      for (const el of layers) {
        const r = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const offset = (r.top + r.height / 2) - vh / 2; // px from viewport centre
        el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
      }
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { requestAnimationFrame(apply); ticking = true; } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    apply();
  }
}

// Nav elevation on scroll
const nav = document.querySelector('nav');
if (nav) {
  const onNav = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  addEventListener('scroll', onNav, { passive: true });
  onNav();
}

// Active-section nav highlight (index page only — needs section[id])
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');
if (sections.length && navLinks.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle('nav-active', l.getAttribute('href') === '#' + e.target.id)
          );
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach((s) => spy.observe(s));
}

// Magnetic buttons — subtle pull toward cursor (respects prefers-reduced-motion)
if (!reduce) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * 0.16}px, ${my * 0.26}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// Custom cursor — a trailing ring that grows over interactive elements (pointer + motion only)
if (!reduce && matchMedia('(pointer:fine)').matches) {
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);
  let rx = innerWidth / 2, ry = innerHeight / 2, mx = rx, my = ry;
  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
  (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(loop); })();
  document.querySelectorAll('a, button, .magnetic, [role="button"]').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}
