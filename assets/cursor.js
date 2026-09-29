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
    var off = ring.classList.contains('is-morph') ? 30 : 20;   // centre the 60px morph vs the 40px ring
    ring.style.transform = 'translate(' + (rx - off) + 'px, ' + (ry - off) + 'px)';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, [role="button"], .btn').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
  });

  /* Case-study cards morph the ring into a gold "VIEW" disc (portfolio page). */
  var morphTargets = document.querySelectorAll('.feat-card, .idx-row');
  if (morphTargets.length) {
    if (!ring.querySelector('.cursor-label')) {
      var label = document.createElement('span');
      label.className = 'cursor-label';
      label.textContent = 'VIEW';
      ring.appendChild(label);
    }
    morphTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-morph'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-morph'); });
    });
  }
})();
