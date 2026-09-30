/* Nav plus the switcher between the five prototypes. */
(() => {
  const pages = [['1-light-table', '1 Light table'], ['2-projector', '2 Projector gate'], ['3-grid', '3 Living grid'], ['4-type', '4 Type window'], ['5-rotate', '5 Rotating develop']];
  const here = location.pathname.split('/').pop().replace('.html', '');
  document.body.insertAdjacentHTML('afterbegin', `<header class="nav"><a class="nav-name" href="../index.html">Iain McMullan</a><nav class="nav-links mono"><a href="../../skills.html">How I work</a><a href="../portfolio.html">Portfolio</a><a href="../archive.html">Archive</a><a href="../lets-talk.html">Let's talk</a></nav></header>`);
  document.body.insertAdjacentHTML('beforeend', `<nav class="switch mono" aria-label="Masthead prototypes">${pages.map(([f, l]) => `<a href="${f}.html"${f === here ? ' class="on"' : ''}>${l}</a>`).join('')}</nav>`);
})();
