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
document.querySelectorAll('.stats-row').forEach(el => counterObs.observe(el));

/* ============================
   CAROUSEL
   ============================ */
const track   = document.getElementById('carousel-track');
const dotsEl  = document.getElementById('c-dots');
const prevBtn = document.getElementById('c-prev');
const nextBtn = document.getElementById('c-next');

if (track) {
  const cards = [...track.querySelectorAll('.client-card')];
  const gap = 20;
  const cardW  = () => cards[0].offsetWidth + gap;
  const perPg  = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1100 ? 2 : 3;
  const totalPg = () => Math.ceil(cards.length / perPg());

  function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalPg(); i++) {
      const d = document.createElement('button');
      d.className = 'c-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Page ${i + 1}`);
      d.onclick = () => goTo(i);
      dotsEl.appendChild(d);
    }
  }

  function curPage() {
    return Math.round(track.scrollLeft / (cardW() * perPg()));
  }

  function goTo(page) {
    page = Math.max(0, Math.min(page, totalPg() - 1));
    track.scrollTo({ left: page * cardW() * perPg(), behavior: 'smooth' });
    updateDots(page);
  }

  function updateDots(page) {
    dotsEl.querySelectorAll('.c-dot').forEach((d, i) =>
      d.classList.toggle('active', i === page)
    );
  }

  prevBtn.onclick = () => goTo(curPage() - 1);
  nextBtn.onclick = () => goTo(curPage() + 1);
  track.addEventListener('scroll', () => updateDots(curPage()), { passive: true });

  // Drag scroll
  let dragging = false, startX, startScroll;
  track.addEventListener('mousedown', e => { dragging = true; startX = e.pageX; startScroll = track.scrollLeft; });
  window.addEventListener('mouseup', () => { dragging = false; });
  track.addEventListener('mousemove', e => {
    if (!dragging) return;
    e.preventDefault();
    track.scrollLeft = startScroll - (e.pageX - startX) * 1.3;
  });

  buildDots();
  window.addEventListener('resize', buildDots, { passive: true });
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

/* ============================
   TWEAKS
   ============================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "bg": "cool"
}/*EDITMODE-END*/;

const ACCENTS = {
  blue:   { blue: '#2563EB', blueLt: '#60A5FA', glow: 'rgba(37,99,235,0.14)'  },
  indigo: { blue: '#4F46E5', blueLt: '#818CF8', glow: 'rgba(79,70,229,0.14)'  },
  teal:   { blue: '#0D9488', blueLt: '#2DD4BF', glow: 'rgba(13,148,136,0.14)' },
};
const BGS = {
  cool:  { bg: '#F7FAFD', bgMid: '#EDF2F8', bgDeep: '#E2EAF4' },
  warm:  { bg: '#FDF9F5', bgMid: '#F5EEE6', bgDeep: '#EDE3D4' },
  white: { bg: '#FFFFFF', bgMid: '#F5F5F5', bgDeep: '#EBEBEB' },
};

let tw = { ...TWEAK_DEFAULTS };

function applyTweaks() {
  const a = ACCENTS[tw.accent] || ACCENTS.blue;
  const b = BGS[tw.bg] || BGS.cool;
  const r = document.documentElement;
  r.style.setProperty('--blue',      a.blue);
  r.style.setProperty('--blue-lt',   a.blueLt);
  r.style.setProperty('--blue-glow', a.glow);
  r.style.setProperty('--bg',        b.bg);
  r.style.setProperty('--bg-mid',    b.bgMid);
  r.style.setProperty('--bg-deep',   b.bgDeep);
}

function setAccent(v) {
  tw.accent = v;
  document.querySelectorAll('[onclick^="setAccent"]').forEach(b => b.classList.remove('on'));
  document.querySelector(`[onclick="setAccent('${v}')"]`)?.classList.add('on');
  applyTweaks();
  window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { accent: v } }, '*');
}
function setBg(v) {
  tw.bg = v;
  document.querySelectorAll('[onclick^="setBg"]').forEach(b => b.classList.remove('on'));
  document.querySelector(`[onclick="setBg('${v}')"]`)?.classList.add('on');
  applyTweaks();
  window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { bg: v } }, '*');
}

window.addEventListener('message', e => {
  if (e.data?.type === '__activate_edit_mode')   document.getElementById('tweaks-panel').classList.add('active');
  if (e.data?.type === '__deactivate_edit_mode') document.getElementById('tweaks-panel').classList.remove('active');
});
window.parent.postMessage({ type: '__edit_mode_available' }, '*');

applyTweaks();
