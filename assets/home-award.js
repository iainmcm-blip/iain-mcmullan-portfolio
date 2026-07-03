/* THE COVER — homepage choreography.
   A scrub that settles each plate back as the next covers it. The plate
   stacking itself is CSS position:sticky — this file is polish only.
   Scrolling stays NATIVE by design (a smooth-scroll lib was tried and
   rejected: slow, sticky feel). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Plate settle: as plate N+1 arrives, plate N eases back and dims.
  if (window.gsap && window.ScrollTrigger && window.matchMedia('(min-width: 901px)').matches) {
    gsap.registerPlugin(ScrollTrigger);
    var plates = gsap.utils.toArray('.theme-award .plate');
    plates.forEach(function (plate, i) {
      var next = plates[i + 1];
      if (!next) return;
      gsap.to(plate.querySelector('.plate-inner'), {
        scale: 0.965,
        opacity: 0.65,           /* opacity not filter: composited, no mid-scroll repaints */
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
