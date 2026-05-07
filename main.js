/* ============================
   NAV
   ============================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* hero elements are always visible — no entrance animation */

/* ============================
   SCROLL REVEAL
   ============================ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ============================
   COUNTER ANIMATION
   ============================ */
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1200;
  const t0 = performance.now();
  const tick = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.querySelectorAll('[data-target]').forEach(animateCounter);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stats-grid').forEach(el => counterObs.observe(el));

/* ============================
   PORTFOLIO FILTER & GRID
   ============================ */
const portfolioGrid = document.getElementById('portfolio-grid');
const seeMoreBtn = document.getElementById('see-more-btn');

if (portfolioGrid) {
  const allCards = [...portfolioGrid.querySelectorAll('.client-card')];
  let isExpanded = false;

  function updateGrid() {
    const activeCatBtn = document.querySelector('.filter-btn[data-group="cat"].active');
    const activeStatusBtn = document.querySelector('.filter-btn[data-group="status"].active');
    
    const activeCat = activeCatBtn ? activeCatBtn.dataset.filter : 'all';
    const activeStatus = activeStatusBtn ? activeStatusBtn.dataset.filter : 'all';

    const isMobile = window.innerWidth <= 768;
    const limit = isMobile ? 3 : 6;

    // Filter cards by both Category AND Status
    const filtered = allCards.filter(c => {
      const catMatch = activeCat === 'all' || c.dataset.cat === activeCat;
      const statusMatch = activeStatus === 'all' || c.dataset.status === activeStatus;
      return catMatch && statusMatch;
    });
    
    // Hide all first
    allCards.forEach(c => {
      c.style.display = 'none';
      c.classList.remove('in'); // Reset animation state for filtered items
    });

    // Show limited or all
    const showCount = isExpanded ? filtered.length : limit;
    filtered.forEach((c, i) => {
      if (i < showCount) {
        c.style.display = 'flex';
        // Re-trigger reveal animation slightly delayed
        setTimeout(() => c.classList.add('in'), 10 * i);
      }
    });

    // Toggle Button Visibility
    if (filtered.length > limit && !isExpanded) {
      seeMoreBtn.style.display = 'inline-block';
    } else {
      seeMoreBtn.style.display = 'none';
    }
  }

  // Filter Click
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      const group = btn.dataset.group;
      // Only deactivate buttons in the same group
      document.querySelectorAll(`.filter-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      isExpanded = false; // Reset expansion on filter change
      updateGrid();
    };
  });

  // See More Click
  if (seeMoreBtn) {
    seeMoreBtn.onclick = () => {
      isExpanded = true;
      updateGrid();
    };
  }

  window.addEventListener('resize', updateGrid, { passive: true });
  updateGrid(); // Initial run
}

/* ============================
   SMOOTH ANCHORS
   ============================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
  });
});


