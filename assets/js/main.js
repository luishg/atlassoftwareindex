/* =============================================================
   Atlas — main.js
   - Sticky nav state on scroll
   - IntersectionObserver-based reveal animations
   - Progressive hero path draw-in
   ============================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     Nav: apply a "scrolled" class once the user leaves the hero
     --------------------------------------------------------- */
  const nav = document.getElementById('nav');
  if (nav) {
    let ticking = false;
    const updateNav = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });
    updateNav();
  }

  /* -----------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  const revealables = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(el => io.observe(el));
  }

  /* -----------------------------------------------------------
     Hero path draw-in
     --------------------------------------------------------- */
  const heroPath = document.querySelector('.js-draw-path');
  if (heroPath && !prefersReducedMotion) {
    try {
      const length = heroPath.getTotalLength();
      heroPath.style.strokeDasharray = length;
      heroPath.style.strokeDashoffset = length;
      heroPath.style.transition = 'stroke-dashoffset 2400ms cubic-bezier(0.22, 0.61, 0.36, 1) 400ms';
      // Trigger on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          heroPath.style.strokeDashoffset = '0';
        });
      });
    } catch (e) { /* SVG path API unavailable; silently skip */ }
  }

  /* -----------------------------------------------------------
     Smooth anchor focus handling (keep accessibility correct)
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      // Move focus after scroll completes, for screen readers
      setTimeout(() => {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, 600);
    });
  });
})();
