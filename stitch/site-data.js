/* Shared by the home page and the archive. Project data comes from work-data.js (window.WORK). */
window.SITE = {
  A: '../assets/',
  CS: '../case-studies/',
  // Only images that genuinely show the project; everything else is a typed frame.
  IMG: {
    'emirates-south-america': 'img/emirates-777-air-to-air.avif',
    'emirates-africa': 'img/emirates-a2a.jpg',
    'skywards-tier-advancement': 'img/skywards-tiers-group.avif',
    'emirates-adventure-awaits': 'img/emirates-pilot-adventure-awaits.png',
    'efta-launch': 'img/efta-hero.webp',
    'skywards-my-family': 'img/skywards-my-family-photo.jpg',
    'ahc-sea-expansion': 'img/ahc-campaign.jpg',
    'ntuc-mfs-site': 'img/ntuc-hero.jpg',
    'ntuc-mfs-campaign': 'video/work/ntuc-film.jpg',
    'casillero-legendary-pairings': 'img/casillero-del-diablo-hero.jpg',
    'malaysia-airlines-hospitality': 'img/malaysia-airlines-service.jpg',
    'hilton-apac-conference': 'video/work/hilton-film.jpg',
    'uob-gallery': 'video/work/uob-film.jpg',
    'gsg25-microsite': 'video/work/gsg-hero.jpg',
    'gsg25-book': 'img/work/gsg-book-cover.jpg',
    'gsg25-activation': 'img/work/gsg-exhibit-2.jpg',
    'la-scenting-journal': 'img/work/la-stories.jpg',
    'la-scenting-site': 'img/work/la-hero-film.jpg'
  },
  LIVE: { 'la-scenting-site': 'https://lascenting.com', 'gsg25-microsite': 'https://globalschools.com/gsg25/' },
  caseFor(p) { return p.caseStudy || (p.client === 'Global Schools Group' ? 'gsg25.html' : null); },
  // A hand-drawn loop (slightly more than one turn, wobbling) around a w x h box.
  loopPath(w, h, seed = 0) {
    const cx = w / 2, cy = h / 2, rx = w / 2 - 3, ry = h / 2 - 3;
    let d = '';
    for (let k = 0; k <= 72; k++) {
      const a = -2.2 + seed + k / 72 * Math.PI * 2.2, wob = 1 + .05 * Math.sin(k * .6 + seed * 3) - k / 72 * .07;
      d += (k ? 'L' : 'M') + (cx + Math.cos(a) * rx * wob).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * wob).toFixed(1);
    }
    return d;
  },
  // A slightly uneven underline across width w.
  linePath(w, h = 10) {
    let d = '';
    for (let k = 0; k <= 24; k++) {
      const x = k / 24 * w, y = h * .55 + Math.sin(k * .9) * 1.4 + (k / 24) * -2;
      d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }
};
