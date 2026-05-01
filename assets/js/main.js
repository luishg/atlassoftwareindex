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

  /* -----------------------------------------------------------
     Hero contour parallax — drives CSS custom properties so the
     SVG translates with scroll and (subtly) follows the cursor.
     Skipped entirely for reduced-motion or coarse pointers.
     --------------------------------------------------------- */
  const contour = document.querySelector('.hero__bg-contours');
  if (contour && !prefersReducedMotion) {
    const hero = document.querySelector('.hero');
    let scrollY = 0, mouseX = 0, mouseY = 0;
    let raf = false;
    const apply = () => {
      raf = false;
      // parallax follows scroll until ~120% of hero height
      const heroHeight = hero ? hero.offsetHeight : window.innerHeight;
      const k = Math.max(-1, Math.min(1, scrollY / heroHeight));
      const py = -k * 90 + mouseY * 14;     // up to 90px on scroll, ±14px on cursor
      const px = mouseX * 18;               // ±18px horizontal on cursor
      contour.style.setProperty('--contour-py', py.toFixed(2) + 'px');
      contour.style.setProperty('--contour-px', px.toFixed(2) + 'px');
    };
    const schedule = () => {
      if (!raf) { raf = true; window.requestAnimationFrame(apply); }
    };
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      schedule();
    }, { passive: true });
    // Mouse parallax only on fine pointers (skip touch)
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth)  - 0.5;  // -0.5 .. 0.5
        mouseY = (e.clientY / window.innerHeight) - 0.5;
        schedule();
      }, { passive: true });
    }
  }
})();
