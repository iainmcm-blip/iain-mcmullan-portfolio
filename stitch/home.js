(() => {
  const { A, CS, IMG, VIDEO, LIVE, caseFor, loopPath, linePath } = window.SITE;
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const body = document.body, mast = $('#mast'), sheet = $('#sheet'), hero = $('#hero'), heroImg = $('#heroImg'), heroVid = $('#heroVid');
  const cap = $('#cap'), reel = $('#reel'), tip = $('#tip'), loupe = $('#loupe'), loupeIn = $('#loupeIn'), loupeT = $('#loupeT');

  const work = [...window.WORK].sort((a, b) => a.year - b.year);
  // The masthead opens on a film (screen recordings stay in the reel); a ?pick= link can name any pictured piece.
  const films = ['hilton-apac-conference', 'uob-gallery', 'emirates-adventure-awaits', 'malaysia-airlines-hospitality', 'ntuc-mfs-campaign'];
  let heroId = new URLSearchParams(location.search).get('pick') || films[Math.floor(Math.random() * films.length)];

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
  const hover = (el, text) => {
    el.addEventListener('mouseenter', () => { tip.textContent = text; tip.style.opacity = 1; });
    el.addEventListener('mousemove', e => { tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY + 16 + 'px'; });
    el.addEventListener('mouseleave', () => { tip.style.opacity = 0; });
  };

  /* ---------- 1 & 2. Contact sheet ---------- */
  const rows = [];
  for (let i = 0; i < work.length; i += 10) rows.push(work.slice(i, i + 10));
  const strips = [], frames = [];
  rows.forEach((row, si) => {
    const s = document.createElement('div');
    s.className = 'strip';
    const y0 = row[0].year, y1 = row[row.length - 1].year;
    const clients = [...new Set(row.map(p => p.client))].join(' · ');
    s.innerHTML = `<div class="edge"><span class="typed">${y0 === y1 ? y0 : y0 + '–' + y1} &nbsp; ${clients}</span><span>${String(si + 1).padStart(2, '0')}</span></div><div class="frames"></div>`;
    const g = s.querySelector('.frames');
    row.forEach(p => {
      const i = frames.length;
      const f = document.createElement('div');
      f.className = 'fr';
      f.innerHTML = (IMG[p.id] ? `<img src="${A + IMG[p.id]}" alt="">` : `<div class="t"><small>${p.year}</small></div>`) + `<span class="n">${i + 1}</span>`;
      if (!IMG[p.id]) f.classList.add('typed');
      f.addEventListener('click', () => { if (!IMG[p.id]) return; finish(); show(i, true); });
      g.appendChild(f);
      frames.push({ el: f, p });
    });
    sheet.appendChild(s);
    strips.push(s);
  });

  // 2. Loupe: magnifies the frame under the cursor while the sheet is showing.
  if (fine) {
    const Z = 2.6;
    let cur = null;
    sheet.addEventListener('mousemove', e => {
      const fr = e.target.closest('.fr');
      loupe.style.transform = '';
      loupe.style.left = e.clientX + 'px'; loupe.style.top = e.clientY + 'px';
      if (!fr || !fr.classList.contains('on')) { loupe.classList.remove('on'); cur = null; return; }
      const k = [...sheet.querySelectorAll('.fr')].indexOf(fr), { p } = frames[k];
      const r = fr.getBoundingClientRect();
      if (cur !== fr) {
        cur = fr;
        loupeIn.className = 'loupe-in' + (IMG[p.id] ? '' : ' txt');
        loupeIn.style.backgroundImage = IMG[p.id] ? `url("${A + IMG[p.id]}")` : '';
        loupeIn.textContent = IMG[p.id] ? '' : p.title;
        loupeIn.style.width = r.width * Z + 'px'; loupeIn.style.height = r.height * Z + 'px';
        loupeT.textContent = `${k + 1} · ${p.year} · ${p.title}`;
      }
      loupeIn.style.transform = `translate(${90 - (e.clientX - r.left) * Z}px, ${90 - (e.clientY - r.top) * Z}px)`;
      loupe.classList.add('on');
    });
    sheet.addEventListener('mouseleave', () => loupe.classList.remove('on'));
  }

  work.forEach((p, i) => {
    if (!IMG[p.id]) return; // no gaps: the reel only carries pieces that can be shown
    const b = document.createElement('button');
    b.setAttribute('role', 'listitem');
    b.setAttribute('aria-label', `${p.year}: ${p.title}`);
    b.dataset.id = p.id; b.dataset.i = i;
    b.innerHTML = `<img src="${A + IMG[p.id]}" alt="">` + (VIDEO[p.id] ? '<i class="film" aria-hidden="true"></i>' : '');
    hover(b, `${p.year} · ${p.title}`);
    b.addEventListener('click', () => show(i, true));
    reel.appendChild(b);
  });

  // 1. Develop, in WebGL: the print rises out of the paper, darks first, in uneven patches spreading from where the
  // pencil circled it, warm black and white, then colour. The cursor is the developer: wherever it passes, the print
  // comes up early, with a ragged edge. Works on stills and on film (the film runs while it develops).
  // Needs same-origin media, so it falls back to a CSS filter version when the page is opened from disk.
  const FS = `precision mediump float;
    uniform sampler2D u, m; uniform float t; uniform vec2 sc, of, o, asp; varying vec2 v;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
    void main(){
      vec2 uv=v*sc+of;
      uv+=vec2(n(v*3.+t*2.)-.5,n(v*3.-t*2.)-.5)*.004*(1.-t);
      vec3 c=texture2D(u,uv).rgb;
      float l=dot(c,vec3(.299,.587,.114));
      float patch=n(v*vec2(5.,3.))*.6+n(v*17.)*.4;
      float d=length((v-o)*asp);
      float brush=smoothstep(.3,.62,texture2D(m,vec2(v.x,1.-v.y)).r+(patch-.5)*.45);
      float dev=clamp(t*2.1-l*.95-patch*.4+.15-d*.55,0.,1.);
      dev=smoothstep(0.,1.,max(dev,brush*(1.05-l*.35)));
      vec3 paper=vec3(.957,.937,.89);
      vec3 mono=vec3(l)*vec3(1.06,.97,.84);
      vec3 col=mix(paper,mono,dev);
      col=mix(col,c,max(smoothstep(.55,1.,t),brush*smoothstep(.15,.6,t)*.85));
      col+=(h(v*900.+t)-.5)*.035*(1.-t);
      gl_FragColor=vec4(col,1.);
    }`;
  const VS = 'attribute vec2 p; varying vec2 v; void main(){ v=p*.5+.5; gl_Position=vec4(p,0.,1.); }';
  let gl = null, glCanvas = null, glProg = null, texU = null, texM = null;
  const maskC = document.createElement('canvas'), mctx = maskC.getContext('2d');
  maskC.width = 512; maskC.height = 320;
  function glSetup() {
    if (gl !== null) return gl;
    glCanvas = document.createElement('canvas');
    glCanvas.className = 'dev';
    gl = glCanvas.getContext('webgl', { premultipliedAlpha: false }) || false;
    if (!gl) return gl;
    const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; };
    glProg = gl.createProgram();
    gl.attachShader(glProg, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(glProg, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(glProg);
    if (!gl.getProgramParameter(glProg, gl.LINK_STATUS)) { gl = false; return gl; }
    gl.useProgram(glProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(glProg, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const mk = unit => { const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx);
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); return tx; };
    texU = mk(0); texM = mk(1);
    gl.uniform1i(gl.getUniformLocation(glProg, 'u'), 0); gl.uniform1i(gl.getUniformLocation(glProg, 'm'), 1);
    hero.insertBefore(glCanvas, hero.querySelector('.hero-media').nextSibling);
    return gl;
  }
  let devRun = 0, devLive = false;
  // The developer brush: soft, uneven dabs into a small mask; developed areas stay developed, like the real thing.
  function dab(x, y) {
    const r = 26 + Math.random() * 20;
    const g = mctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    mctx.fillStyle = g; mctx.beginPath(); mctx.arc(x, y, r, 0, 7); mctx.fill();
  }
  if (fine) mast.addEventListener('pointermove', e => {
    if (!devLive) return;
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * maskC.width, y = (e.clientY - r.top) / r.height * maskC.height;
    dab(x, y); dab(x + (Math.random() - .5) * 24, y + (Math.random() - .5) * 24);
  });
  function developGL(el, isVid, origin) {
    if (!glSetup()) return false;
    const iw = isVid ? el.videoWidth : el.naturalWidth, ih = isVid ? el.videoHeight : el.naturalHeight;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texU);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, el);
      if (gl.getError() !== gl.NO_ERROR) return false;
    } catch (e) { gl = false; glCanvas.remove(); return false; } // tainted (file://): use the CSS version
    mctx.clearRect(0, 0, maskC.width, maskC.height);
    const dpr = Math.min(devicePixelRatio || 1, 1.5), W = hero.clientWidth, H = hero.clientHeight;
    glCanvas.width = W * dpr; glCanvas.height = H * dpr; gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    const s = Math.max(W / iw, H / ih), sx = W / (iw * s), sy = H / (ih * s);
    const U = k => gl.getUniformLocation(glProg, k);
    gl.uniform2f(U('sc'), sx, sy); gl.uniform2f(U('of'), (1 - sx) / 2, (1 - sy) / 2);
    gl.uniform2f(U('o'), origin[0], origin[1]); gl.uniform2f(U('asp'), W / H, 1);
    const ut = U('t'), run = ++devRun, t0 = performance.now(), D = 4600;
    glCanvas.style.transition = 'none'; glCanvas.style.opacity = 1; devLive = true;
    const frame = now => {
      if (run !== devRun) return;
      const p = Math.min(1, (now - t0) / D);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texU);
      if (isVid && el.readyState >= 2) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, el);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texM);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskC);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.uniform1f(ut, 1 - Math.pow(1 - p, 1.8));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (p < 1) requestAnimationFrame(frame);
      else { devLive = false; glCanvas.style.transition = 'opacity .6s'; glCanvas.style.opacity = 0; }
    };
    requestAnimationFrame(frame);
    return true;
  }
  function develop(el, isVid, origin = [.5, .5]) {
    if (reduce) return;
    const ready = isVid ? el.readyState >= 2 : el.complete && el.naturalWidth;
    const go = () => { if (!developGL(el, isVid, origin)) developCSS(el); };
    if (ready) go(); else el.addEventListener(isVid ? 'loadeddata' : 'load', go, { once: true });
  }
  function developCSS(el) {
    el.animate([
      { filter: 'grayscale(1) sepia(.35) brightness(2.4) contrast(.28) blur(1.5px)', opacity: .15 },
      { filter: 'grayscale(1) sepia(.45) brightness(1.7) contrast(.55) blur(.6px)', opacity: .85, offset: .3 },
      { filter: 'grayscale(.7) sepia(.35) brightness(1.2) contrast(.85) blur(0)', opacity: 1, offset: .62 },
      { filter: 'grayscale(0) sepia(0) brightness(1) contrast(1) blur(0)', opacity: 1 }
    ], { duration: 2600, easing: 'cubic-bezier(.3,.1,.2,1)' });
  }

  function show(i, animate, origin) {
    const { p } = frames[i];
    heroId = p.id;
    hero.classList.remove('live'); void hero.offsetWidth;
    const vid = VIDEO[p.id] && films.includes(p.id);
    heroImg.hidden = !!vid; heroVid.hidden = !vid;
    if (vid) {
      heroVid.poster = A + IMG[p.id];
      if (!heroVid.src.endsWith(VIDEO[p.id])) heroVid.src = A + VIDEO[p.id];
      heroVid.currentTime = 0;
      if (!reduce) heroVid.play().catch(() => {});
      if (animate) develop(heroVid, true, origin);
    } else {
      heroVid.pause();
      heroImg.src = A + IMG[p.id]; heroImg.alt = p.title;
      if (animate) develop(heroImg, false, origin);
    }
    hero.classList.add('live');
    const cs = caseFor(p);
    const links = [cs && `<a href="${CS + cs}">Case study &#8599;</a>`, LIVE[p.id] && `<a href="${LIVE[p.id]}" target="_blank" rel="noopener noreferrer">Live site &#8599;</a>`].filter(Boolean).join(' &nbsp; ');
    cap.innerHTML = `<b>${String(i + 1).padStart(2, '0')} / ${work.length}</b> &nbsp; ${p.client} &nbsp;·&nbsp; ${p.title} &nbsp;·&nbsp; ${p.year}${links ? ' &nbsp; ' + links : ''}`;
    $('#proof').textContent = `Frame ${String(i + 1).padStart(2, '0')} of ${work.length}`;
    [...reel.children].forEach(b => b.classList.toggle('on', +b.dataset.i === i));
  }

  const heroIdx = () => frames.findIndex(f => f.p.id === heroId);
  const timers = [];
  let ended = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const setDark = on => body.classList.toggle('on-dark', on);

  function finish() {
    if (ended) return;
    ended = true;
    timers.forEach(clearTimeout);
    mast.querySelectorAll('.pencil').forEach(n => n.remove());
    strips.forEach(s => s.classList.add('in'));
    frames.forEach(f => f.el.classList.add('on'));
    loupe.classList.remove('on');
    show(heroIdx(), false);
    hero.style.visibility = 'visible';
    mast.classList.add('done');
    setDark(true);
  }
  $('#skip').addEventListener('click', finish);
  addEventListener('keydown', e => { if (e.key === 'Escape') finish(); });
  // "Open the contact sheet" returns to the full sheet; any frame develops into the masthead.
  $('#toSheet').addEventListener('click', () => { mast.classList.remove('done'); setDark(false); hero.style.visibility = 'hidden'; ended = false; });

  if (reduce) finish();
  else {
    strips.forEach((s, i) => at(120 + i * 90, () => s.classList.add('in')));
    const T0 = 550, STEP = 40, n = $('#n'), yr = $('#yr');
    frames.forEach((f, i) => at(T0 + i * STEP, () => { f.el.classList.add('on'); n.textContent = String(i + 1).padStart(4, '0'); yr.textContent = f.p.year; }));
    const T1 = T0 + frames.length * STEP + 450;
    at(T1, () => draw(svgOver(frames[heroIdx()].el, 14, loopPath, mast), 700));
    at(T1 + 1150, () => {
      const r = frames[heroIdx()].el.getBoundingClientRect(), m = mast.getBoundingClientRect();
      show(heroIdx(), true, [(r.left + r.width / 2 - m.left) / m.width, 1 - (r.top + r.height / 2 - m.top) / m.height]);
      hero.style.visibility = 'visible';
      hero.animate([
        { clipPath: `inset(${r.top - m.top}px ${m.right - r.right}px ${m.bottom - r.bottom}px ${r.left - m.left}px)` },
        { clipPath: 'inset(0px 0px 0px 0px)' }
      ], { duration: 1100, easing: 'cubic-bezier(.7,0,.2,1)' });
      mast.querySelector('.pencil')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: 'forwards' });
      at(550, () => { ended = true; mast.classList.add('done'); setDark(true); loupe.classList.remove('on'); });
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

  // 3. On the first scroll, the reel lifts: the five featured thumbnails fly into the index strip.
  const strip = $('#indexStrip');
  const flyers = FEATURED.map(f => {
    const el = document.createElement('div');
    el.className = 'flyer';
    el.innerHTML = `<img src="${A + (IMG[f.id] || f.img)}" alt="">`;
    el.style.display = 'none';
    document.body.appendChild(el);
    return { el, id: f.id };
  });
  const docRect = el => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
  let fromRects = null;
  function measure() {
    if (!mast.classList.contains('done')) { fromRects = null; return; }
    const sy = scrollY;
    fromRects = flyers.map(f => { const b = reel.querySelector(`[data-id="${f.id}"]`); const r = b.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + sy, w: r.width, h: r.height }; });
  }
  function onScroll() {
    body.classList.toggle('scrolled', scrollY > 40);
    if (reduce || !mast.classList.contains('done')) return;
    if (!fromRects && scrollY < 40) measure();
    if (!fromRects) return;
    const tos = [...strip.children].map(docRect);
    const end = Math.max(1, tos[0].y - innerHeight * .35);
    const p = Math.min(1, Math.max(0, scrollY / end));
    const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const flying = p > 0 && p < 1;
    strip.classList.toggle('hold', p < 1);
    flyers.forEach((f, k) => {
      const a = fromRects[k], b = tos[k];
      f.el.style.display = flying ? 'block' : 'none';
      if (!flying) return;
      const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e, w = a.w + (b.w - a.w) * e, h = a.h + (b.h - a.h) * e;
      Object.assign(f.el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
      f.el.querySelector('img').style.filter = `grayscale(${e})`;
    });
    reel.style.opacity = p > 0 ? String(1 - Math.min(1, p * 3)) : '';
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { fromRects = null; onScroll(); });

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
      heroImg.style.translate = heroVid.style.translate = `0 ${(y * .35).toFixed(1)}px`;
      $('.copy').style.translate = `0 ${(-y * .12).toFixed(1)}px`;
    }
  }
  addEventListener('scroll', onThread, { passive: true });
  addEventListener('resize', onThread);

  addEventListener('load', () => { layoutRoute(); onScroll(); onThread(); });
  layoutRoute();
})();
