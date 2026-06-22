(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;

  /* ---------- Intro loader (home) / instant load (inner pages) ---------- */
  const loader = document.getElementById('loader');
  function finishLoading() {
    if (loader) loader.classList.add('done');
    document.body.classList.add('loaded');
    if (loader) setTimeout(() => { loader.style.display = 'none'; }, 1400);
  }
  if (!loader || reduceMotion) {
    // Inner pages: reveal just after first paint (setTimeout, not rAF —
    // rAF is throttled in background tabs and the page would stay hidden)
    setTimeout(finishLoading, 60);
  } else {
    window.addEventListener('load', () => setTimeout(finishLoading, 2100));
    setTimeout(finishLoading, 4500); // safety net
  }

  /* ---------- WebGL atmospheric shader (home hero) ---------- */
  const canvas = document.getElementById('hero-canvas');
  const gl = canvas ? canvas.getContext('webgl') : null;
  if (gl && !reduceMotion) {
    const vs = `
      attribute vec2 position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = position * 0.5 + 0.5;
        v_texCoord.y = 1.0 - v_texCoord.y;
        gl_Position = vec4(position, 0.0, 1.0);
      }`;
    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      void main() {
        vec2 uv = v_texCoord;
        vec2 mouse = u_mouse / u_resolution;
        float t = u_time * 0.12;
        vec2 flow = vec2(sin(uv.y * 3.0 + t) * 0.1, cos(uv.x * 2.0 - t) * 0.1);
        vec3 color1 = vec3(0.012, 0.018, 0.07);
        vec3 color2 = vec3(0.05, 0.11, 0.45);
        vec3 color3 = vec3(0.08, 0.11, 0.44);
        float mask = smoothstep(0.25, 0.75, uv.y + flow.y);
        float d = distance(uv, mouse);
        float glow = smoothstep(0.45, 0.0, d) * 0.16;
        vec3 finalColor = mix(color1, color2, mask);
        finalColor += color3 * (sin(u_time * 0.18 + uv.x * 2.2) * 0.5 + 0.5) * 0.07;
        finalColor += glow * color3;
        finalColor += (noise(uv * u_time) - 0.5) * 0.012;
        gl_FragColor = vec4(finalColor, 1.0);
      }`;
    function shader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    const timeLoc = gl.getUniformLocation(prog, 'u_time');
    const resLoc = gl.getUniformLocation(prog, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(prog, 'u_mouse');
    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function render(time) {
      if (canvas.clientWidth && (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight)) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    })(0);
  }

  /* ---------- Lenis smooth scroll ---------- */
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothTouch: false });
    (function lenisLoop(time) {
      lenis.raf(time);
      requestAnimationFrame(lenisLoop);
    })(0);
  }

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

  /* ---------- Parallax (lerped) ---------- */
  if (!reduceMotion) {
    let target = 0, current = 0;
    if (lenis) {
      lenis.on('scroll', ({ scroll }) => { target = scroll; });
    } else {
      window.addEventListener('scroll', () => { target = window.pageYOffset; }, { passive: true });
    }
    (function loop() {
      current += (target - current) * 0.08;
      document.querySelectorAll('.parallax-target').forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.08;
        const rect = el.getBoundingClientRect();
        if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
          el.style.transform = 'translateY(' + (current * speed * -1).toFixed(2) + 'px)';
        }
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Nav condense on scroll ---------- */
  const nav = document.querySelector('nav');
  if (nav) {
    const setNavState = (scrollY) => nav.classList.toggle('scrolled', scrollY > 40);
    if (lenis) {
      lenis.on('scroll', ({ scroll }) => setNavState(scroll));
    } else {
      window.addEventListener('scroll', () => setNavState(window.scrollY), { passive: true });
    }
  }

  /* ---------- Custom cursor ---------- */
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring && window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    let cx = -100, cy = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
    (function cursorLoop() {
      rx += (cx - rx) * 0.16;
      ry += (cy - ry) * 0.16;
      dot.style.transform = 'translate(' + (cx - 2.5) + 'px,' + (cy - 2.5) + 'px)';
      ring.style.transform = 'translate(' + (rx - 18) + 'px,' + (ry - 18) + 'px)';
      requestAnimationFrame(cursorLoop);
    })();
    document.querySelectorAll('a, button, input, textarea, select, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ---------- Magnetic buttons (pointer:fine / desktop only) ---------- */
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!reduceMotion && !isTouch) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.22 + 'px,' + y * 0.32 + 'px)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------- Mobile navigation menu ---------- */
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOpenBtn = document.getElementById('menu-open');
  const menuCloseBtn = document.getElementById('menu-close');
  if (mobileMenu && menuOpenBtn) {
    const openMenu = () => {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      if (lenis) lenis.stop();
    };
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      if (lenis) lenis.start();
    };
    menuOpenBtn.addEventListener('click', openMenu);
    if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ---------- Touch tap-reveal interactions (mobile only) ---------- */
  if (isTouch) {
    // Industry tiles: tap to reveal colour
    document.querySelectorAll('.industry-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const active = tile.classList.contains('touch-active');
        document.querySelectorAll('.industry-tile').forEach(t => t.classList.remove('touch-active'));
        if (!active) tile.classList.add('touch-active');
      });
    });

    // Project cards: tap image to reveal colour
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('touch-active');
      });
    });

    // Service flood rows: tap to preview image
    document.querySelectorAll('.svc-flood').forEach(link => {
      link.addEventListener('click', function(e) {
        if (!this.classList.contains('touch-active')) {
          e.preventDefault();
          document.querySelectorAll('.svc-flood').forEach(l => l.classList.remove('touch-active'));
          this.classList.add('touch-active');
          // Second tap navigates
          this.addEventListener('click', function nav() {
            this.removeEventListener('click', nav);
          }, { once: true });
        }
      });
    });
  }

  /* ---------- Light blooms follow mouse ---------- */
  if (!reduceMotion) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.querySelectorAll('.light-bloom').forEach(b => {
        b.style.background = 'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(91,34,196,.12) 0%, transparent 65%)';
      });
    });
  }

  /* ---------- Service hover preview ---------- */
  const preview = document.getElementById('service-preview');
  const previewImg = preview ? preview.querySelector('[data-preview]') : null;
  const servicesList = document.getElementById('services-list');
  if (preview && previewImg && servicesList && window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    let px = 0, py = 0, tx = 0, ty = 0;
    servicesList.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function previewLoop() {
      px += (tx - px) * 0.12;
      py += (ty - py) * 0.12;
      preview.style.left = (px + 40) + 'px';
      preview.style.top = (py - 110) + 'px';
      requestAnimationFrame(previewLoop);
    })();
    servicesList.querySelectorAll('.service-row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        previewImg.classList.remove('show');
        previewImg.src = row.getAttribute('data-img');
        previewImg.onload = () => previewImg.classList.add('show');
        preview.classList.add('active');
      });
    });
    servicesList.addEventListener('mouseleave', () => {
      preview.classList.remove('active');
      previewImg.classList.remove('show');
    });
  }

  /* ---------- Stat count-up ---------- */
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countObserver.unobserve(el);
      const end = parseFloat(el.getAttribute('data-count'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      if (reduceMotion) { el.textContent = end.toFixed(decimals); return; }
      const dur = 1800;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (end * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      // rAF can be throttled/paused in background tabs — guarantee the final value
      setTimeout(() => { el.textContent = end.toFixed(decimals); }, dur + 200);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  /* ---------- Accordion (process / FAQ on inner pages) ---------- */
  document.querySelectorAll('[data-accordion]').forEach(acc => {
    const triggers = acc.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const panel = document.getElementById(trigger.getAttribute('data-target'));
        const isOpen = trigger.classList.contains('open');
        // single-open: collapse siblings
        triggers.forEach(t => {
          t.classList.remove('open');
          const p = document.getElementById(t.getAttribute('data-target'));
          if (p) p.style.maxHeight = null;
        });
        if (!isOpen && panel) {
          trigger.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  });
})();
