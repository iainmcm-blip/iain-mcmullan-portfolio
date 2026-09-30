/* The twelve pieces the mastheads draw from: real images or film only. `note` is a confirmed figure for the pencil. */
window.A = '../../assets/';
window.CS = '../../case-studies/';
window.PIECES = [
  { id: 'hilton', title: 'Hilton APAC GM Conference', year: 2024, img: 'video/work/hilton-hd.jpg', vid: 'video/work/hilton-hd.mp4', cs: 'hilton-asia-conference.html', note: '1,400 delegates' },
  { id: 'gsg-book', title: 'GSG25 anniversary book', year: 2026, img: 'img/work/gsg-book-cover.jpg', cs: 'gsg25.html', note: '109 pages' },
  { id: 'pilots', title: 'Emirates: Adventure Awaits', year: 2016, img: 'video/work/pilots-ben.jpg', vid: 'video/work/pilots-ben.mp4', cs: 'emirates-pilot-recruitment.html', note: '1,200 applications' },
  { id: 'uob', title: 'The UOB Gallery: Right By You', year: 2025, img: 'video/work/uob-gallery-hd.jpg', vid: 'video/work/uob-gallery-hd.mp4', cs: 'uob-gallery.html' },
  { id: 'la', title: 'LA Scenting website', year: 2026, img: 'img/work/la-hero-film.jpg', vid: 'video/work/la-scroll.mp4', cs: 'la-scenting.html' },
  { id: 'efta', title: 'Emirates Flight Training Academy', year: 2017, img: 'img/efta-hero.webp', cs: 'emirates-flight-training-academy.html', note: '100% cohort filled' },
  { id: 'gsg-exhibit', title: 'GSG25 anniversary exhibition', year: 2026, img: 'img/work/gsg-exhibit-2.jpg', cs: 'gsg25.html' },
  { id: 'mas', title: 'Malaysia Airlines: This is Malaysian Hospitality', year: 2022, img: 'video/work/mas-hospitality.jpg', vid: 'video/work/mas-hospitality.mp4', cs: 'malaysia-airlines.html' },
  { id: 'gsg-site', title: 'GSG25 anniversary microsite', year: 2026, img: 'video/work/gsg-timeline.jpg', vid: 'video/work/gsg-timeline.mp4', cs: 'gsg25.html' },
  { id: 'ntuc', title: 'NTUC My First Skool', year: 2019, img: 'video/work/ntuc-film.jpg', vid: 'video/work/ntuc-film.mp4', cs: 'ntuc-my-first-skool.html' },
  { id: 'casillero', title: 'Casillero del Diablo: Legendary Pairings', year: 2020, img: 'img/casillero-del-diablo-hero.jpg', cs: 'casillero-del-diablo.html' },
  { id: 'skywards', title: 'Emirates Skywards Tier Advancement', year: 2016, img: 'img/skywards-tiers-group.avif', cs: 'emirates-skywards-tier-advancement.html' }
];
window.reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Warm black-and-white print coming up to full colour.
window.developEl = (el, ms = 2400, delay = 0) => {
  if (window.reduceMotion) return;
  el.animate([
    { filter: 'grayscale(1) sepia(.35) brightness(2.3) contrast(.3)', opacity: .2 },
    { filter: 'grayscale(1) sepia(.45) brightness(1.5) contrast(.6)', opacity: 1, offset: .35 },
    { filter: 'grayscale(.6) sepia(.3) brightness(1.15) contrast(.9)', offset: .65 },
    { filter: 'none', opacity: 1 }
  ], { duration: ms, delay, easing: 'cubic-bezier(.3,.1,.2,1)', fill: 'backwards' });
};
window.loop = (w, h, seed = 0) => {
  const cx = w / 2, cy = h / 2, rx = w / 2 - 3, ry = h / 2 - 3;
  let d = '';
  for (let k = 0; k <= 72; k++) {
    const a = -2.2 + seed + k / 72 * Math.PI * 2.2, wob = 1 + .05 * Math.sin(k * .6 + seed * 3) - k / 72 * .07;
    d += (k ? 'L' : 'M') + (cx + Math.cos(a) * rx * wob).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * wob).toFixed(1);
  }
  return d;
};
window.drawPath = (path, ms = 700, delay = 0) => {
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = window.reduceMotion ? 0 : len;
  if (!window.reduceMotion) path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: ms, delay, easing: 'cubic-bezier(.6,.05,.3,1)', fill: 'forwards' });
};
