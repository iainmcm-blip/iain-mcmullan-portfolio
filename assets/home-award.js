/* THE COVER — homepage choreography.
   Lenis smooth scroll + a scrub that settles each plate back as the next
   covers it. The plate stacking itself is CSS position:sticky — this file
   is polish only; everything degrades cleanly without it. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Smooth scroll — native scroll under the hood, so position:sticky survives.
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.11 });
    window.__lenis = lenis;   /* debug handle */
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on('scroll', function () { ScrollTrigger.update(); });
  }

  // Plate settle: as plate N+1 arrives, plate N eases back and dims.
  if (window.gsap && window.ScrollTrigger && window.matchMedia('(min-width: 901px)').matches) {
    gsap.registerPlugin(ScrollTrigger);
    var plates = gsap.utils.toArray('.theme-award .plate');
    plates.forEach(function (plate, i) {
      var next = plates[i + 1];
      if (!next) return;
      gsap.to(plate.querySelector('.plate-inner'), {
        scale: 0.965,
        filter: 'brightness(0.72)',
        transformOrigin: 'center top',
        ease: 'none',
        scrollTrigger: {
          trigger: next,
          start: 'top 78%',    /* only settle once the next plate is genuinely arriving */
          end: 'top 18%',
          scrub: true
        }
      });
    });
  }
})();
