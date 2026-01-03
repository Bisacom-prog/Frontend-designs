(function () {
  'use strict';

  const html = document.documentElement;
  const THEME_KEY = 'ba_theme';

  /* =========================
     THEME (DARK MODE)
  ========================== */
  function applyTheme(mode) {
    if (mode === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
      return;
    }
    const prefers =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = prefers ? 'dark' : 'light';
    applyTheme(initial);
    localStorage.setItem(THEME_KEY, initial);
  }

  /* =========================
     UI WIRING
  ========================== */
  function wireUI() {
    // Dark mode toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle && !themeToggle.__wired) {
      themeToggle.__wired = true;
      themeToggle.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          const next = html.classList.contains('dark') ? 'light' : 'dark';
          applyTheme(next);
          localStorage.setItem(THEME_KEY, next);
        },
        { passive: false }
      );
    }

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    function setMobile(open) {
      if (!mobileMenu || !mobileBtn) return;
      mobileMenu.classList.toggle('hidden', !open);
      mobileBtn.setAttribute('aria-expanded', String(open));
    }

    if (mobileBtn && mobileMenu && !mobileBtn.__wired) {
      mobileBtn.__wired = true;
      mobileBtn.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          setMobile(mobileMenu.classList.contains('hidden'));
        },
        { passive: false }
      );

      // Close menu when clicking any link
      mobileMenu.querySelectorAll('a').forEach((a) => {
        if (a.__wired) return;
        a.__wired = true;
        a.addEventListener('click', () => setMobile(false));
      });
    }

    // Smooth scroll for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      if (a.__smooth) return;
      a.__smooth = true;
      a.addEventListener(
        'click',
        (e) => {
          const href = a.getAttribute('href');
          if (!href || href === '#') return;
          const t = document.querySelector(href);
          if (!t) return;
          e.preventDefault();
          t.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setMobile(false);
        },
        { passive: false }
      );
    });
  }

  /* =========================
     PROJECT CARD INTERACTION
  ========================== */
  function wireProjectCards() {
    document.querySelectorAll('.project-card').forEach((card) => {
      if (card.__tiltWired) return;
      card.__tiltWired = true;

      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--x', x + '%');
        card.style.setProperty('--y', y + '%');
      });
    });
  }

  /* =========================
     REVEAL ANIMATIONS (FIX FOR HIDDEN CARDS)
     Your CSS sets .reveal { opacity: 0 } until .is-visible is added.
  ========================== */
  function wireReveal() {
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if (!revealEls.length) return;

    // If IO supported, reveal on scroll; otherwise reveal immediately.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('is-visible');
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  function init() {
    try { initTheme(); } catch (_) {}
    wireUI();
    wireProjectCards();
    wireReveal();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Safety: run once more after full load (covers late-loaded images/layout)
  window.addEventListener('load', () => {
    wireUI();
    wireProjectCards();
    wireReveal();
  }, { once: true });

})();
