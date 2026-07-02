/* Custom circle+dot cursor — recovered from the ln-experiment. Ring lags the dot;
   grows on interactive elements. No-ops on touch / coarse pointers. */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var dot = document.querySelector('.cursor-dot'), ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  var mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate(' + (mx - 4) + 'px, ' + (my - 4) + 'px)';
    ring.classList.remove('is-hidden');
  });
  document.addEventListener('mouseleave', function () { ring.classList.add('is-hidden'); });
  (function loop() {
    rx += (mx - rx) * 0.10; ry += (my - ry) * 0.10;
    ring.style.transform = 'translate(' + (rx - 20) + 'px, ' + (ry - 20) + 'px)';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, [role="button"], .btn').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
  });
})();
