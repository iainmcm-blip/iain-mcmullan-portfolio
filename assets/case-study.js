/* Case studies: reading progress, a chapter index built from the section eyebrows,
   and the next-project panel taking over the shared-element page transition. */
(function () {
  'use strict';
  var sections = Array.prototype.slice.call(document.querySelectorAll('.cs-section')).filter(function (s) { return s.querySelector('.cs-eyebrow'); });

  var bar = document.createElement('div');
  bar.className = 'cs-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var onScroll = function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (sections.length > 1) {
    var nav = document.createElement('nav');
    nav.className = 'cs-index'; nav.setAttribute('aria-label', 'Chapters');
    var links = sections.map(function (s, i) {
      if (!s.id) s.id = 'chapter-' + (i + 1);
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.textContent = s.querySelector('.cs-eyebrow').textContent.replace(/^\s*\d+\s*·\s*/, '');
      a.dataset.n = String(i + 1).padStart(2, '0');
      nav.appendChild(a);
      return a;
    });
    document.body.appendChild(nav);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a, i) { a.classList.toggle('is-on', sections[i] === e.target); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { io.observe(s); });
    }
    // Only while reading: hidden over the dark hero and the next-project panel.
    var covers = Array.prototype.slice.call(document.querySelectorAll('.cs-hero, .cs-next')), over = {};
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (es) {
        es.forEach(function (e) { over[covers.indexOf(e.target)] = e.isIntersecting; });
        nav.classList.toggle('is-shown', !Object.keys(over).some(function (k) { return over[k]; }));
      });
      covers.forEach(function (c) { co.observe(c); });
    }
  }

  var next = document.querySelector('.cs-next');
  var heroImg = document.querySelector('.cs-hero-img');
  if (next && heroImg) next.addEventListener('click', function () {
    heroImg.style.viewTransitionName = 'none';
    next.querySelector('img').style.viewTransitionName = 'cs-hero';
  });
})();
