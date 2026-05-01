/* =============================================================
   Cartograpp — main.js
   - Sticky nav state + reading progress rail
   - IntersectionObserver-based reveal animations
   - Smooth anchor scroll with a11y focus handling
   ============================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     Nav: scrolled state + reading progress rail
     --------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const progress = nav && nav.querySelector('.nav__progress');
  if (nav) {
    let ticking = false;
    const updateNav = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 24);
      if (progress) {
        const doc = document.documentElement;
        const max = (doc.scrollHeight - window.innerHeight) || 1;
        const ratio = Math.max(0, Math.min(1, y / max));
        progress.style.transform = `scaleX(${ratio})`;
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateNav, { passive: true });
    updateNav();
  }

  /* -----------------------------------------------------------
     Reveal on scroll
     - Anything already in the initial viewport reveals immediately
       (so the hero never flashes empty even before IO fires).
     - Anything below the fold is revealed by IntersectionObserver.
     --------------------------------------------------------- */
  const revealables = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('is-visible'));
  } else {
    const inInitialViewport = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(el => {
      if (inInitialViewport(el)) {
        el.classList.add('is-visible');
      } else {
        io.observe(el);
      }
    });
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
