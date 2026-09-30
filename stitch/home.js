(() => {
  const { A, CS, IMG, loopPath, linePath } = window.SITE;
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const body = document.body, mast = $('#mast'), grid = $('#grid');

  const work = [...window.WORK].sort((a, b) => a.year - b.year);

  // Draws a pencil stroke along a path; instant under reduced motion.
  function draw(path, ms = 700, delay = 0) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    if (reduce) { path.style.strokeDashoffset = 0; return; }
    path.style.strokeDashoffset = len;
    path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: ms, delay, easing: 'cubic-bezier(.6,.05,.3,1)', fill: 'forwards' });
  }
  function svgOver(el, pad, d, parent) {
    const r = el.getBoundingClientRect(), pr = parent.getBoundingClientRect();
    const w = r.width + pad * 2, h = r.height + pad * 2;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'pencil');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    Object.assign(svg.style, { left: r.left - pr.left - pad + 'px', top: r.top - pr.top - pad + 'px', width: w + 'px', height: h + 'px' });
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d(w, h));
    svg.appendChild(path);
    parent.appendChild(svg);
    return path;
  }


  /* ---------- 1. The living grid ---------- */
  // Twelve equal tiles, so no single project carries the masthead. They arrive in reading order, then develop one
  // after another in the same order: each rises from a pale print to full colour with its film running, and the next
  // is already coming up as the last one fades, so the sequence flows without a break. Hovering takes over.
  const TILES = [
    ['Hilton APAC GM Conference', 2024, 'video/work/hilton-hd.jpg', 'video/work/hilton-hd.mp4', 'hilton-asia-conference.html'],
    ['GSG25 anniversary microsite', 2026, 'video/work/gsg-timeline.jpg', 'video/work/gsg-timeline.mp4', 'gsg25.html'],
    ['Emirates: Adventure Awaits', 2016, 'video/work/pilots-ben.jpg', 'video/work/pilots-ben.mp4', 'emirates-pilot-recruitment.html'],
    ['The UOB Gallery: Right By You', 2025, 'video/work/uob-gallery-hd.jpg', 'video/work/uob-gallery-hd.mp4', 'uob-gallery.html'],
    ['LA Scenting website', 2026, 'img/work/la-hero-film.jpg', 'video/work/la-scroll.mp4', 'la-scenting.html'],
    ['Emirates Flight Training Academy', 2017, 'img/efta-hero.webp', null, 'emirates-flight-training-academy.html'],
    ['GSG25 anniversary exhibition', 2026, 'img/work/gsg-exhibit-2.jpg', null, 'gsg25.html'],
    ['Malaysia Airlines: This is Malaysian Hospitality', 2022, 'video/work/mas-hospitality.jpg', 'video/work/mas-hospitality.mp4', 'malaysia-airlines.html'],
    ['NTUC My First Skool', 2019, 'video/work/mfs-clean.jpg', 'video/work/mfs-clean.mp4', 'ntuc-my-first-skool.html'],
    ['Casillero del Diablo: Legendary Pairings', 2020, 'img/casillero-del-diablo-hero.jpg', null, 'casillero-del-diablo.html'],
    ['Emirates Skywards Tier Advancement', 2016, 'img/skywards-tiers-group.avif', null, 'emirates-skywards-tier-advancement.html'],
    ['Emirates Skywards: My Family', 2018, 'img/skywards-my-family-photo.jpg', null, 'emirates-skywards-my-family.html']
  ];
  grid.innerHTML = TILES.map(([t, y, img, vid, cs], i) => `<a class="tile" href="${CS + cs}" style="--i:${i}"><img src="${A + img}" alt="${t}">${vid ? `<video muted loop playsinline preload="none" data-src="${A + vid}"></video>` : ''}<span class="tile-cap mono">${y} &middot; ${t}</span></a>`).join('');
  const tiles = [...grid.children];
  const dev = (t, on) => {
    t.classList.toggle('dev', on);
    const v = t.querySelector('video');
    if (!v) return;
    if (on) { if (!v.src) v.src = v.dataset.src; v.currentTime = 0; v.play().catch(() => {}); }
    else setTimeout(() => { if (!t.classList.contains('dev')) v.pause(); }, 1700);
  };
  const visible = () => tiles.filter(t => t.offsetParent);
  setTimeout(() => mast.classList.add('in'), 80); // after first paint, so the reveal transitions run
  if (!reduce) {
    const HOLD = 3400, OVERLAP = 1100;
    let k = -1, cur = null, hovering = false;
    const step = () => {
      if (!hovering) {
        const list = visible();
        const prev = cur;
        k = (k + 1) % list.length; cur = list[k];
        dev(cur, true);
        if (prev) setTimeout(() => { if (prev !== cur && !prev.matches(':hover')) dev(prev, false); }, OVERLAP);
      }
      setTimeout(step, HOLD);
    };
    setTimeout(step, 400 + tiles.length * 110 + 500);
    tiles.forEach(t => {
      t.addEventListener('mouseenter', () => { hovering = true; if (cur && cur !== t) dev(cur, false); dev(t, true); });
      t.addEventListener('mouseleave', () => { hovering = false; dev(t, false); cur = t; k = visible().indexOf(t); });
    });
  }

  /* ---------- 3 & 4. Selected work ---------- */
  const FEATURED = [
    { id: 'gsg25-microsite', img: 'video/work/gsg-timeline.jpg', video: 'video/work/gsg-timeline.mp4', verbs: ['Plan', 'Write', 'Build'], meta: '2026 · Singapore',
      title: 'GSG25: one story, told three ways.', cs: 'gsg25.html', live: 'https://globalschools.com/gsg25/', bar: 'globalschools.com/gsg25',
      desc: 'Global Schools Group\'s 25th anniversary, across 64 campuses in 11 countries. I wrote the <span class="mk" data-mk="loop">109</span>-page book, the exhibition and the banners, designed and built the microsite, and <span class="mk" data-mk="line">ran the content and the build as one project</span>.',
      credit: 'Book layouts, exhibition and banner design by Motion\'s designers.' },
    { id: 'la-scenting-site', img: 'video/work/la-scroll.jpg', video: 'video/work/la-scroll.mp4', verbs: ['Write', 'Build'], meta: '2026 · Singapore',
      title: 'LA Scenting: quiet luxury, designed, built and written.', cs: 'la-scenting.html', live: 'https://lascenting.com', bar: 'lascenting.com',
      desc: 'Design, build and content for a scent design studio selling to airports, hotels and offices, with <span class="mk" data-mk="line">a research-led journal written in the founder\'s voice</span>.',
      credit: 'Photography and client list are LA Scenting\'s own.' },
    { id: 'hilton-apac-conference', img: 'video/work/hilton-hd.jpg', video: 'video/work/hilton-hd.mp4', verbs: ['Plan', 'Write'], meta: '2024 · Asia Pacific',
      title: 'Hilton APAC GM and Commercial Conference.', cs: 'hilton-asia-conference.html', bar: 'Conference film',
      desc: 'The strategic narrative and all content for <span class="mk" data-mk="loop">1,400</span> hotel leaders: the theme, the email programme and the companion app. <span class="mk" data-mk="line">A record 92% engagement</span>, and a global CEO who called it the best-organised global event.' },
    { id: 'uob-gallery', img: 'video/work/uob-gallery-hd.jpg', video: 'video/work/uob-gallery-hd.mp4', verbs: ['Plan', 'Write'], meta: '2025 · Singapore',
      title: 'The UOB Gallery: Right By You.', cs: 'uob-gallery.html', bar: 'Gallery film',
      desc: 'A commemorative brand gallery taking <span class="mk" data-mk="loop">nine decades</span> of UOB heritage from a blank brief to <span class="mk" data-mk="line">an on-time public launch in March 2025</span>. Project lead, theming, archival research and every panel\'s copy.' },
    { id: 'efta-launch', img: 'img/efta-hero.webp', verbs: ['Plan', 'Write'], meta: '2017 · Dubai',
      title: 'Emirates Flight Training Academy.', cs: 'emirates-flight-training-academy.html', bar: 'Brand and launch',
      desc: 'The brand and go-to-market for Emirates\' own flight school, owned client-side from agency selection to rollout. <span class="mk" data-mk="loop">100%</span> of the first cadet cohort <span class="mk" data-mk="line">filled within two months of launch</span>.' },
    { id: 'emirates-adventure-awaits', img: 'video/work/pilots-ben.jpg', video: 'video/work/pilots-ben.mp4', verbs: ['Plan', 'Write'], meta: '2016 · Dubai',
      title: 'Emirates: Adventure Awaits.', cs: 'emirates-pilot-recruitment.html', bar: 'Pilot recruitment films',
      desc: 'A global pilot recruitment campaign that told the pilot\'s story rather than the job spec: films that each follow a real Emirates pilot, produced under my lead. <span class="mk" data-mk="loop">1,200</span> applications <span class="mk" data-mk="line">within two months</span>.' }
  ];
  const tick = 'M2 9 L7 14 L16 2';
  $('#rows').innerHTML = FEATURED.map((f, k) => `
    <article class="row${k % 2 ? ' flip' : ''}">
      <a class="media" data-speed="-0.05" href="${CS + f.cs}" aria-label="${f.title.replace(/\.$/, '')} case study">
        <div class="bar mono"><span>${f.bar}</span><b>${String(work.findIndex(p => p.id === f.id) + 1).padStart(2, '0')} / 56</b></div>
        ${f.video ? `<video muted loop playsinline preload="none" poster="${A + f.img}" data-src="${A + f.video}"></video>` : `<img src="${A + f.img}" alt="" loading="lazy">`}
      </a>
      <div class="text">
        <div class="verbs mono">${f.verbs.map(v => `<span class="verb">${v}<svg viewBox="0 0 18 18" aria-hidden="true"><path d="${tick}"/></svg></span>`).join('')}<span class="label" style="align-self:center;margin-left:6px">${f.meta}</span></div>
        <h3>${f.title}</h3>
        <p class="desc">${f.desc}</p>
        ${f.credit ? `<p class="credit">${f.credit}</p>` : ''}
        <p class="links"><a class="textlink mono" href="${CS + f.cs}">Case study &rarr;</a>${f.live ? `<a class="textlink mono" href="${f.live}" target="_blank" rel="noopener noreferrer">Live site &#8599;</a>` : ''}</p>
      </div>
    </article>`).join('');
  $('#indexStrip').innerHTML = FEATURED.map((f, k) => `<a href="#row-${k}" data-id="${f.id}"><img src="${A + (IMG[f.id] || f.img)}" alt=""><span class="mono">${String(k + 1).padStart(2, '0')}</span></a>`).join('');
  document.querySelectorAll('.row').forEach((r, k) => { r.id = 'row-' + k; });

  const MORE = [
    ['emirates-skywards-tier-advancement.html', 'Emirates Skywards Tier Advancement', 'USD 2M+ · 2016'],
    ['ntuc-my-first-skool.html', 'NTUC My First Skool', '+39% registrations · 2019'],
    ['casillero-del-diablo.html', 'Casillero del Diablo: Legendary Pairings', '+23% online sales · 2020'],
    ['ahc-skincare.html', 'AHC: Southeast Asia expansion', '4% to 22% online · 2019'],
    ['emirates-skywards-my-family.html', 'Emirates Skywards: My Family', 'Loyalty · 2018'],
    ['malaysia-airlines.html', 'Malaysia Airlines: This is Malaysian Hospitality', 'Kancil Bronze · 2022']
  ];
  $('#moreList').innerHTML = MORE.map(([f, t, m]) => `<li><a href="${CS + f}"><strong>${t}</strong><span class="mono">${m}</span></a></li>`).join('');

  // 4. Mark-up as each row arrives: video plays, verbs ticked, figure circled, phrase underlined.
  const marked = new WeakSet();
  const rowIO = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target.querySelector('video');
    if (e.isIntersecting) {
      if (v && !reduce) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      if (!marked.has(e.target) && e.intersectionRatio > .45) {
        marked.add(e.target);
        e.target.classList.add('in');
        e.target.querySelectorAll('.mk').forEach((mk, j) => {
          const loop = mk.dataset.mk === 'loop';
          const path = svgOver(mk, loop ? 9 : 0, loop ? loopPath : (w, h) => linePath(w, h), mk);
          const svg = path.ownerSVGElement;
          if (!loop) { svg.style.top = 'auto'; svg.style.bottom = '-8px'; svg.style.height = '12px'; svg.setAttribute('viewBox', `0 0 ${mk.offsetWidth} 12`); path.setAttribute('d', linePath(mk.offsetWidth, 12)); svg.style.left = '0'; }
          draw(path, loop ? 650 : 800, 500 + j * 500);
        });
      }
    } else if (v) v.pause();
  }), { threshold: [0, .45] });
  document.querySelectorAll('.row').forEach(r => rowIO.observe(r));

  const onScroll = () => body.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 5. How I work: the route is drawn with scroll ---------- */
  const route = $('#route'), rline = $('#routeLine'), rpath = rline.querySelector('path'), steps = [...route.querySelectorAll('.steps li')];
  function layoutRoute() {
    const R = route.getBoundingClientRect();
    const pts = steps.map(li => { const s = li.querySelector('span').getBoundingClientRect(); return [s.left - R.left + s.width / 2, s.top - R.top - 22]; });
    const vertical = innerWidth <= 900;
    let d = '';
    if (vertical) {
      pts.forEach(([, y], k) => { d += (k ? ' L' : 'M') + ' 10 ' + (y + 28).toFixed(1) + (k ? '' : ''); });
    } else {
      pts.forEach(([x, y], k) => {
        if (!k) { d = `M ${x - 30} ${y}`; return; }
        const [px] = pts[k - 1];
        d += ` C ${px + 40} ${y - 26}, ${x - 40} ${y + 26}, ${x} ${y}`;
      });
    }
    rpath.setAttribute('d', d);
    const len = rpath.getTotalLength();
    rpath.style.strokeDasharray = len;
    rpath.dataset.len = len;
    rline.dataset.pts = JSON.stringify(pts.map(p => p[0]));
    drawRoute();
  }
  function drawRoute() {
    const len = +rpath.dataset.len || 0;
    const R = route.getBoundingClientRect();
    const p = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * .8 - R.top) / (R.height + innerHeight * .25)));
    rpath.style.strokeDashoffset = len * (1 - p);
    steps.forEach((li, k) => li.classList.toggle('lit', p >= k / steps.length + .02 || reduce));
  }
  addEventListener('scroll', drawRoute, { passive: true });
  addEventListener('resize', layoutRoute);

  /* ---------- 6. Numbers: counted like the loader, then underlined ---------- */
  const fmt = (v, el) => (el.dataset.pre || '') + (el.dataset.fmt === 'comma' ? Math.round(v).toLocaleString('en-GB') : Math.round(v)) + (el.dataset.post || '');
  const numIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    numIO.unobserve(e.target);
    e.target.querySelectorAll('.num b').forEach((b, k) => {
      const to = +b.dataset.to, t0 = performance.now() + k * 150, dur = reduce ? 0 : 1400;
      const step = now => {
        const p = dur ? Math.min(1, Math.max(0, (now - t0) / dur)) : 1;
        b.firstChild.nodeValue = fmt(to * (1 - Math.pow(1 - p, 3)), b);
        if (p < 1) requestAnimationFrame(step);
        else {
          const svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path');
          svg.setAttribute('viewBox', `0 0 ${b.offsetWidth} 12`); path.setAttribute('d', linePath(b.offsetWidth, 12));
          svg.appendChild(path); b.appendChild(svg); draw(path, 600);
        }
      };
      requestAnimationFrame(step);
    });
  }), { threshold: .4 });
  document.querySelectorAll('.num b').forEach(b => { b.textContent = fmt(0, b); });
  numIO.observe($('#nums'));

  /* ---------- 7. Frame 57 ---------- */
  const f57 = $('#f57');
  const closeIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    closeIO.disconnect();
    draw(svgOver(f57, 16, loopPath, f57.parentElement), 900, 300);
  }), { threshold: .6 });
  closeIO.observe(f57);

  /* ---------- One strip, top to bottom (the page reads as one reel) and depth ---------- */
  const thread = $('#thread'), tn = $('#threadN');
  const par = [...document.querySelectorAll('[data-speed]')];
  function onThread() {
    const max = document.documentElement.scrollHeight - innerHeight, y = scrollY;
    const k = Math.max(0, Math.min(1, (y - mast.offsetHeight * .6) / (max - mast.offsetHeight * .6)));
    thread.classList.toggle('on', y > mast.offsetHeight * .6);
    thread.style.backgroundPositionY = -y * .6 + 'px';
    tn.textContent = String(Math.max(1, Math.round(k * 57))).padStart(2, '0');
    if (reduce) return;
    const vh = innerHeight / 2;
    par.forEach(el => { const r = el.getBoundingClientRect(); el.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh) * +el.dataset.speed).toFixed(1)}px,0)`; });
    if (y < mast.offsetHeight) {
      grid.style.translate = `0 ${(y * .14).toFixed(1)}px`;
      $('.mg-copy').style.translate = `0 ${(-y * .1).toFixed(1)}px`;
    }
  }
  addEventListener('scroll', onThread, { passive: true });
  addEventListener('resize', onThread);

  addEventListener('load', () => { layoutRoute(); onScroll(); onThread(); });
  layoutRoute();
})();
