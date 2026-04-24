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
     Hero record rails: amber accent bars fill downward, staggered,
     so the entity record reads as being "indexed" on load.
     --------------------------------------------------------- */
  const rails = document.querySelectorAll('.record-rail');
  if (rails.length && !prefersReducedMotion) {
    rails.forEach((rail, i) => {
      rail.style.transformBox = 'fill-box';
      rail.style.transformOrigin = 'top';
      rail.style.transform = 'scaleY(0)';
      rail.style.transition = `transform 900ms cubic-bezier(0.22, 0.61, 0.36, 1) ${500 + i * 180}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          rail.style.transform = 'scaleY(1)';
        });
      });
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
