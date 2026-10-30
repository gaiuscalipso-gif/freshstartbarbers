import '@fontsource-variable/inter';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import './styles.css';

import {
  BUSINESS,
  CATEGORIES,
  CATEGORY_LABEL,
  SERVICES,
  BARBERS,
  HOURS,
  SUNDAY_POLICY,
  REFRESHMENTS,
  SOCIALS,
  GALLERY_FILTERS,
  GALLERY,
  PROCESS,
  PILLARS,
  REVIEW_SUMMARY,
  REVIEWS,
  FAQS,
  AUDIENCES,
  money,
  durationLabel,
} from './data.js';

/* ═══════════ Helpers ═══════════ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const svg = (id) => `<svg class="ic" aria-hidden="true"><use href="#${id}"></use></svg>`;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  serviceIds: new Set(),
  barberId: 'any',
  category: 'all',
  query: '',
  sort: 'menu',
  galleryFilter: 'all',
  dates: [],
  dateIndex: 0,
  time: null,
};

function toast(message, icon = 'i-check') {
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${svg(icon)}<span>${message}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 450);
  }, 3200);
}

function gotoBooking(focus = true) {
  $('#reserve').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  if (focus) setTimeout(() => $('#bookName')?.focus({ preventScroll: true }), 650);
}

/* ═══════════ 1 · Loader ═══════════ */
function runLoader() {
  const loader = $('#loader');
  const starsWrap = $('#loaderStars');
  const bar = $('#loaderBar');
  const rated = $('.loader__rated');
  starsWrap.innerHTML = Array.from({ length: 5 })
    .map(() => `<svg aria-hidden="true"><use href="#i-star"/></svg>`)
    .join('');
  const stars = $$('svg', starsWrap);

  let seen = false;
  try { seen = sessionStorage.getItem('fs-visited') === '1'; sessionStorage.setItem('fs-visited', '1'); } catch { /* private mode */ }
  const minTime = prefersReduced ? 350 : seen ? 800 : 1900;
  const started = performance.now();

  const tick = () => {
    const p = Math.min(100, ((performance.now() - started) / minTime) * 100);
    bar.style.width = `${p}%`;
    if (p < 100) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  stars.forEach((star, i) => {
    setTimeout(() => {
      star.classList.add('on');
      if (i === 4) rated.classList.add('on');
    }, Math.min(300, minTime * 0.15) + i * Math.max(60, Math.min(220, (minTime - 450) / 5)));
  });

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    bar.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      initReveal();
      setTimeout(() => loader.remove(), 800);
    }, 220);
  };
  const wait = () => (performance.now() - started < minTime ? setTimeout(wait, 60) : finish());
  if (document.readyState === 'complete') wait();
  else window.addEventListener('load', wait, { once: true });
  setTimeout(finish, 5500);
}

/* ═══════════ 2 · Theme ═══════════ */
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const icon = $('#themeIcon');
  icon.innerHTML = `<use href="#${theme === 'dark' ? 'i-sun' : 'i-moon'}"/>`;
  $('#themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  try { localStorage.setItem('fs-theme', theme); } catch { /* ignore */ }
}
function initTheme() {
  let saved = 'dark';
  try { saved = localStorage.getItem('fs-theme') || 'dark'; } catch { /* ignore */ }
  setTheme(saved === 'light' ? 'light' : 'dark');
  $('#themeToggle').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

/* ═══════════ 3 · Reveal & counters ═══════════ */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  $$('.reveal').forEach((el) => {
    const d = el.dataset.delay;
    if (d) el.style.transitionDelay = `${d}ms`;
    io.observe(el);
  });

  const bars = $('#ratingBars');
  if (bars) {
    const bio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { bars.classList.add('is-in'); bio.disconnect(); }
    }), { threshold: 0.35 });
    bio.observe(bars);
  }

  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    animateCount(e.target);
    cio.unobserve(e.target);
  }), { threshold: 0.5 });
  $$('[data-count]').forEach((el) => cio.observe(el));
}

function animateCount(el) {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimal || 0);
  const finalText = target.toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  /* Markup already carries the final values — a counter must never sit
     at 0 (or "KSh 0") if animation/observation is unavailable. */
  if (prefersReduced || !Number.isFinite(target)) { el.textContent = finalText; return; }
  const dur = 900;
  const start = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    /* Glide in from 55% of the final value — lively, never zero. */
    el.textContent = (target * (0.55 + 0.45 * eased)).toLocaleString('en-KE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = finalText;
  };
  requestAnimationFrame(step);
}

/* ═══════════ 4 · Nairobi time & live status ═══════════ */
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function nairobiNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit',
    hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value ?? '';
  const day = WEEKDAY_INDEX[get('weekday')] ?? new Date().getDay();
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(get('minute'), 10);
  return { day, hour, minute, minutes: hour * 60 + minute, ymd: `${get('year')}-${get('month')}-${get('day')}` };
}

const hoursForDay = (day) => HOURS.find((h) => h.day === day) ?? HOURS[0];

function openStatus() {
  const now = nairobiNow();
  const today = hoursForDay(now.day);
  if (today.appointment) return { open: false, appt: true, label: SUNDAY_POLICY, detail: 'Sunday · please book a day ahead', today };
  if (now.minutes < today.openMin) return { open: false, label: `Closed · opens ${today.open}`, detail: `Opens today at ${today.open} · walk-ins welcome`, today };
  if (now.minutes >= today.closeMin) {
    const tomorrow = hoursForDay((now.day + 1) % 7);
    return { open: false, label: 'Closed', detail: tomorrow.appointment ? `Tomorrow (Sunday): ${SUNDAY_POLICY}` : `Opens ${tomorrow.open} tomorrow · walk-ins welcome`, today };
  }
  return { open: true, label: 'Open now · closes 8:00 pm', detail: 'Closes 8:00 pm', today };
}

function updateStatus() {
  const s = openStatus();
  $$('[data-status-badge]').forEach((badge) => {
    badge.classList.toggle('is-closed', !s.open && !s.appt);
    badge.classList.toggle('is-appt', !!s.appt);
    const txt = $('[data-status-text]', badge);
    if (txt) txt.textContent = s.label;
  });
  $$('[data-status-line]').forEach((l) => { l.textContent = `${s.label} · ${s.detail}`; });
  $$('[data-today-hours]').forEach((el) => {
    const value = s.today.appointment ? SUNDAY_POLICY : `${s.today.open} – ${s.today.close}`;
    /* The hero card labels its own row "Today" — don't repeat it there. */
    el.textContent = el.closest('.hero__card-list') ? value : `Today: ${value}`;
  });
}

function initHours() {
  const wrap = $('#hoursTable');
  const { day } = nairobiNow();
  wrap.innerHTML = HOURS.map((h) => `
    <div class="hour-row ${h.day === day ? 'is-today' : ''}">
      <span class="hour-row__day">${h.label}${h.day === day ? '<span class="hour-row__today">TODAY</span>' : ''}</span>
      <span class="hour-row__time">${h.appointment ? h.open : `${h.open} – ${h.close}`}</span>
    </div>`).join('');
  updateStatus();
  setInterval(updateStatus, 60_000);
}

/* ═══════════ 5 · Header: ticker, scroll, nav pill, mobile menu ═══════════ */
const TICKER = [
  'Bring 2 friends — your Classic Shave is complimentary',
  '3-Person Haircut Package · KSh 3,000 · 90 min',
  'The Mbogi Experience: 3 student haircuts · KSh 2,500 · Mon–Wed · ID optional',
  'Walk-ins welcome Mon–Sat · 8:00 am – 8:00 pm (Thu from 8:30 am)',
  'Sunday: By Appointment Only! Premium Rates Apply. Book a day ahead — 0741578791',
  'Free coffee, tea, light bites & aftershave massage with every service',
  'Rated 5.0 ★★★★★ on Google',
];

function initTicker() {
  const el = $('#topTicker');
  let i = 0;
  setInterval(() => {
    el.classList.add('is-out');
    setTimeout(() => {
      i = (i + 1) % TICKER.length;
      el.textContent = TICKER[i];
      el.classList.remove('is-out');
    }, 460);
  }, 4200);
}

function initHeader() {
  const header = $('#siteHeader');
  const bar = $('#scrollBar');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    toTop.classList.toggle('is-show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('#menuBtn');
  const menu = $('#mobileMenu');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.innerHTML = svg(open ? 'i-close' : 'i-menu');
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  // Sliding gold nav pill + scrollspy
  const links = $$('#mainNav a[data-nav]');
  const pill = $('#navPill');
  const movePill = (link) => {
    if (!link) { pill.style.opacity = '0'; return; }
    pill.style.left = `${link.offsetLeft}px`;
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.opacity = '1';
  };
  const setActive = (id) => {
    links.forEach((l) => l.classList.toggle('is-active', l.dataset.nav === id));
    movePill(links.find((l) => l.dataset.nav === id));
  };
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) setActive(e.target.id);
  }), { rootMargin: '-42% 0px -52% 0px' });
  links.forEach((l) => {
    const sec = document.getElementById(l.dataset.nav);
    if (sec) spy.observe(sec);
    l.addEventListener('click', () => setActive(l.dataset.nav));
  });
  window.addEventListener('resize', () => movePill($('#mainNav a.is-active')));

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
  $('#footerTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

  $$('[data-goto-booking]').forEach((b) => b.addEventListener('click', () => gotoBooking()));
  $$('[data-book-service]').forEach((b) => b.addEventListener('click', () => {
    selectService(b.dataset.bookService, true);
    gotoBooking();
  }));
  $$('[data-pick-barber]').forEach((b) => b.addEventListener('click', () => selectBarber(b.dataset.pickBarber, true)));
}

/* ═══════════ 6 · Barbers rail ═══════════ */
function renderBarbers() {
  const wrap = $('#barberGrid');
  wrap.innerHTML = BARBERS.map((b) => `
    <button class="barber-card ${state.barberId === b.id ? 'is-selected' : ''}" type="button"
      data-barber="${b.id}" aria-pressed="${state.barberId === b.id}" aria-label="Select ${b.name}">
      ${b.img
        ? `<img class="barber-card__img" src="${b.img}" alt="${b.name}, ${b.role} at Fresh Start Grooming Lounge" loading="lazy" />`
        : `<span class="barber-card__avatar" aria-hidden="true">${b.initials}</span>`}
      <span class="barber-card__seal">${svg('i-check')}</span>
      <span class="barber-card__body">
        <span class="barber-card__role">${b.role}</span>
        <span class="barber-card__name">${b.name}</span>
        <span class="barber-card__note">${b.note}</span>
        <span class="barber-card__specs">${b.specialties.map((s) => `<span class="spec">${s}</span>`).join('')}</span>
        <span class="barber-card__foot"><span>${b.id === 'any' ? 'Next open chair' : 'Reserve this chair'}</span>${svg('i-arrow')}</span>
      </span>
    </button>`).join('');
  $$('.barber-card', wrap).forEach((card) =>
    card.addEventListener('click', () => selectBarber(card.dataset.barber, true))
  );
}

function selectBarber(id, announce = false) {
  state.barberId = id;
  $$('.barber-card').forEach((c) => {
    const on = c.dataset.barber === id;
    c.classList.toggle('is-selected', on);
    c.setAttribute('aria-pressed', String(on));
  });
  const sel = $('#bookBarber');
  if (sel) sel.value = id;
  renderSummary();
  if (announce) {
    const b = chosenBarber();
    toast(id === 'any' ? 'Next available chair selected' : `${b.name} will hold the clippers`, 'i-scissors');
  }
}
const chosenBarber = () => BARBERS.find((b) => b.id === state.barberId) ?? BARBERS[0];

function initBarberRailNav() {
  const rail = $('#barberGrid');
  $('#barberPrev').addEventListener('click', () => rail.scrollBy({ left: -320, behavior: 'smooth' }));
  $('#barberNext').addEventListener('click', () => rail.scrollBy({ left: 320, behavior: 'smooth' }));
}

/* ═══════════ 7 · Services menu ═══════════ */
const selectedServices = () => SERVICES.filter((s) => state.serviceIds.has(s.id));
const totals = () => selectedServices().reduce(
  (acc, s) => ({ price: acc.price + s.price, mins: acc.mins + s.mins }),
  { price: 0, mins: 0 }
);

function renderChips() {
  $('#categoryChips').innerHTML = CATEGORIES.map((c) => {
    const count = c.id === 'all' ? SERVICES.length : SERVICES.filter((s) => s.cat === c.id).length;
    return `<button class="chip ${state.category === c.id ? 'is-active' : ''}" type="button" role="tab"
      aria-selected="${state.category === c.id}" data-cat="${c.id}">${c.label}<small>${count}</small></button>`;
  }).join('');
  $$('#categoryChips .chip').forEach((chip) => chip.addEventListener('click', () => {
    state.category = chip.dataset.cat;
    renderChips();
    renderServices();
  }));
}

function visibleServices() {
  let list = SERVICES.filter((s) => state.category === 'all' || s.cat === state.category);
  const q = state.query.trim().toLowerCase();
  if (q) list = list.filter((s) => `${s.name} ${s.desc} ${s.tags} ${CATEGORY_LABEL[s.cat]}`.toLowerCase().includes(q));
  const sorted = [...list];
  if (state.sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (state.sort === 'duration-asc') sorted.sort((a, b) => a.mins - b.mins);
  return sorted;
}

function renderServices() {
  const grid = $('#serviceGrid');
  const list = visibleServices();
  $('#menuTotalCount').textContent = String(list.length);
  $('#emptyState').hidden = list.length > 0;
  grid.innerHTML = list.map((s, i) => {
    const on = state.serviceIds.has(s.id);
    return `
    <article class="svc ${s.vip ? 'is-vip' : ''} ${on ? 'is-selected' : ''}" style="animation-delay:${Math.min(i * 35, 420)}ms">
      <div class="svc__top">
        <span class="svc__cat">${s.vip ? '★ VIP Collection' : CATEGORY_LABEL[s.cat]}</span>
        ${s.badge ? `<span class="svc__badge">${s.badge}</span>` : ''}
      </div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <span class="svc__meta">${svg('i-clock')} ${durationLabel(s.mins)}</span>
      <div class="svc__foot">
        <span class="svc__price">${money(s.price)}</span>
        <button class="svc__btn" type="button" data-service="${s.id}" aria-pressed="${on}">
          ${on ? `${svg('i-check')} Selected` : `${svg('i-plus')} Select`}
        </button>
      </div>
    </article>`;
  }).join('');
  $$('.svc__btn', grid).forEach((btn) =>
    btn.addEventListener('click', () => selectService(btn.dataset.service))
  );
}

function selectService(id, forceAdd = false) {
  if (!id || !SERVICES.some((s) => s.id === id)) return;
  if (state.serviceIds.has(id) && !forceAdd) {
    state.serviceIds.delete(id);
  } else {
    state.serviceIds.add(id);
    const s = SERVICES.find((x) => x.id === id);
    const main = $('#bookService');
    if (main) main.value = id;
    toast(`${s.name} added · ${money(s.price)}`, 'i-sparkle');
  }
  renderServices();
  updateSelectionUI();
}

function updateSelectionUI() {
  const t = totals();
  const n = state.serviceIds.size;
  const bar = $('#selectBar');
  bar.hidden = n === 0;
  $('#selCount').textContent = n ? String(n) : '—';
  $('#selTotal').textContent = n ? money(t.price) : 'KSh —';
  $('#selTime').textContent = n ? durationLabel(t.mins) : '';
  renderSummary();
}

function initServices() {
  renderChips();
  renderServices();
  let debounce;
  $('#serviceSearch').addEventListener('input', (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { state.query = e.target.value; renderServices(); }, 140);
  });
  $('#serviceSort').addEventListener('change', (e) => { state.sort = e.target.value; renderServices(); });
  $('#clearFilters').addEventListener('click', () => {
    state.category = 'all'; state.query = ''; state.sort = 'menu';
    $('#serviceSearch').value = ''; $('#serviceSort').value = 'menu';
    renderChips(); renderServices();
  });
  $('#selClear').addEventListener('click', () => {
    state.serviceIds.clear();
    const main = $('#bookService'); if (main) main.value = '';
    renderServices(); updateSelectionUI();
  });
  $('#claimOffer').addEventListener('click', () => {
    selectService('freefriend', true);
    toast('Referral treat claimed — complimentary Classic Shave for the host', 'i-crown');
    gotoBooking();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      $('#serviceSearch').focus();
      $('#services').scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* ═══════════ 8 · Process, pillars, gallery, about bits ═══════════ */
function renderProcess() {
  $('#processRail').innerHTML = PROCESS.map((p, i) => `
    <article class="step-card reveal" data-delay="${i * 80}">
      <span class="step-card__num">${i + 1}</span>
      <h3>${p.title}</h3><p>${p.text}</p>
    </article>`).join('');
  $('#pillarGrid').innerHTML = PILLARS.map((p, i) => `
    <article class="pillar reveal" data-delay="${(i % 3) * 80}">
      <span class="pillar__ic">${svg(p.icon)}</span>
      <div><h3>${p.title}</h3><p>${p.text}</p></div>
    </article>`).join('');
}

let lightboxItem = null;
function renderGallery() {
  $('#galleryFilters').innerHTML = GALLERY_FILTERS.map((f) => {
    const count = f.id === 'all' ? GALLERY.length : GALLERY.filter((g) => g.cat === f.id).length;
    return `<button class="chip ${state.galleryFilter === f.id ? 'is-active' : ''}" type="button"
      data-gfilter="${f.id}" aria-pressed="${state.galleryFilter === f.id}">${f.label}<small>${count}</small></button>`;
  }).join('');
  $$('#galleryFilters .chip').forEach((chip) => chip.addEventListener('click', () => {
    state.galleryFilter = chip.dataset.gfilter;
    renderGallery();
  }));

  const list = GALLERY.filter((g) => state.galleryFilter === 'all' || g.cat === state.galleryFilter);
  $('#galleryGrid').innerHTML = list.map((g, i) => `
    <button class="gitem" type="button" data-gindex="${GALLERY.indexOf(g)}" style="animation-delay:${i * 45}ms"
      aria-label="View ${g.title} up close">
      <img src="${g.src}" alt="${g.title} at Fresh Start Grooming Lounge" loading="lazy" />
      <span class="gitem__zoom">${svg('i-search')}</span>
      <span class="gitem__cap">
        <em>${g.catLabel}</em>
        <strong>${g.title}</strong>
        <span>${g.detail}</span>
      </span>
    </button>`).join('');
  $$('#galleryGrid .gitem').forEach((item) =>
    item.addEventListener('click', () => openLightbox(GALLERY[Number(item.dataset.gindex)]))
  );
}

function openLightbox(item) {
  lightboxItem = item;
  const box = $('#lightbox');
  $('#lightboxImg').src = item.src;
  $('#lightboxImg').alt = item.title;
  $('#lightboxTitle').textContent = item.title;
  $('#lightboxCap').textContent = `${item.catLabel} · ${item.detail}`;
  $('#lightboxBook').style.display = item.serviceId ? '' : 'none';
  box.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#lightboxClose').focus();
}
function closeLightbox() {
  $('#lightbox').hidden = true;
  document.body.style.overflow = '';
}
function initLightbox() {
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightbox').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#lightbox').hidden) closeLightbox(); });
  $('#lightboxBook').addEventListener('click', () => {
    if (lightboxItem?.serviceId) selectService(lightboxItem.serviceId, true);
    closeLightbox();
    gotoBooking();
  });
}

function renderAboutBits() {
  $('#audienceTags').innerHTML = AUDIENCES.map((a) => `<span class="tag">${a}</span>`).join('');
  $('#refreshMenu').innerHTML = REFRESHMENTS.map((r) => `
    <li class="refresh__item">
      <span><strong>${r.name}</strong><span>${r.detail} — ${r.note}</span></span>
      <span class="refresh__price"><s>${money(r.price)}</s><b>FREE</b></span>
    </li>`).join('');
}

/* ═══════════ 9 · Google Reviews carousel ═══════════ */
const reviewState = { page: 0, timer: null, hover: false, manual: false };
const REVIEW_MS = 4000;
const perPage = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 641 ? 2 : 1);
const reviewPages = () => Math.ceil(REVIEWS.length / perPage());

function renderReviews() {
  const per = perPage();
  reviewState.page = Math.min(reviewState.page, reviewPages() - 1);
  const start = reviewState.page * per;
  const slice = REVIEWS.slice(start, start + per);
  $('#reviewGrid').innerHTML = slice.map((r) => `
    <article class="review-card" title="Tap to pause / resume">
      <div class="review-card__head">
        <span class="avatar" style="background:${r.hue}" aria-hidden="true">${r.initials}</span>
        <span class="review-card__who"><strong>${r.name}</strong><span>${r.area}</span></span>
        <svg class="review-card__g" aria-hidden="true"><use href="#i-google"/></svg>
      </div>
      <div class="review-card__stars" aria-label="Rated ${r.stars} out of 5 on Google">
        ${'★'.repeat(r.stars)}${svg('i-check')}
      </div>
      <p class="review-card__text">${r.text}</p>
      <div class="review-card__foot">
        <span class="review-card__service">${r.service}</span>
        <span class="review-card__when">${r.when}</span>
      </div>
    </article>`).join('');
  $('#reviewCounter').textContent = `${start + 1}–${start + slice.length} of ${REVIEWS.length}`;
  $('#reviewDots').innerHTML = Array.from({ length: reviewPages() }, (_, i) =>
    `<button class="review-dot ${i === reviewState.page ? 'is-active' : ''}" type="button" role="tab"
      aria-selected="${i === reviewState.page}" aria-label="Reviews page ${i + 1}" data-page="${i}"></button>`).join('');
  $$('#reviewDots .review-dot').forEach((d) => d.addEventListener('click', () => {
    reviewState.page = Number(d.dataset.page);
    renderReviews(); restartReviewTimer();
  }));
  $$('#reviewGrid .review-card').forEach((card) => card.addEventListener('click', () => {
    reviewState.manual = !reviewState.manual;
    applyReviewPause();
    toast(reviewState.manual ? 'Reviews paused — tap again to resume' : 'Reviews auto-playing', 'i-star');
  }));
}

function isPaused() { return reviewState.hover || reviewState.manual || prefersReduced; }
function applyReviewPause() {
  const stage = $('.review-stage');
  const status = $('#reviewAutoStatus');
  stage.classList.toggle('is-paused', isPaused());
  status.innerHTML = `<span class="pulse-dot"></span> ${isPaused() ? 'Paused — tap a card to resume' : 'Auto — hover or tap to pause'}`;
  if (isPaused()) { clearTimeout(reviewState.timer); }
  else restartReviewTimer();
}

function restartReviewTimer() {
  clearTimeout(reviewState.timer);
  const bar = $('#reviewProgress');
  bar.classList.remove('is-anim');
  void bar.offsetWidth; /* restart CSS animation */
  if (isPaused()) return;
  bar.style.animationDuration = `${REVIEW_MS}ms`;
  bar.classList.add('is-anim');
  reviewState.timer = setTimeout(() => {
    reviewState.page = (reviewState.page + 1) % reviewPages();
    renderReviews();
    restartReviewTimer();
  }, REVIEW_MS);
}

function initReviews() {
  $('#reviewRating').textContent = REVIEW_SUMMARY.rating.toFixed(1);
  $('#reviewCountText').textContent = REVIEW_SUMMARY.label;
  $('#ratingBars').innerHTML = REVIEW_SUMMARY.bars.map((b) => `
    <div class="gbar"><span>${b.stars} ★</span>
      <span class="gbar__track"><span class="gbar__fill" style="--w:${b.pct}%"></span></span>
      <span>${b.pct}%</span></div>`).join('');
  renderReviews();

  const stage = $('.review-stage');
  stage.addEventListener('pointerenter', () => { reviewState.hover = true; applyReviewPause(); });
  stage.addEventListener('pointerleave', () => { reviewState.hover = false; applyReviewPause(); });
  stage.addEventListener('focusin', () => { reviewState.hover = true; applyReviewPause(); });
  stage.addEventListener('focusout', () => { reviewState.hover = false; applyReviewPause(); });
  $('#reviewPrev').addEventListener('click', () => {
    reviewState.page = (reviewState.page - 1 + reviewPages()) % reviewPages();
    renderReviews(); restartReviewTimer();
  });
  $('#reviewNext').addEventListener('click', () => {
    reviewState.page = (reviewState.page + 1) % reviewPages();
    renderReviews(); restartReviewTimer();
  });
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { renderReviews(); restartReviewTimer(); }, 200);
  });
  applyReviewPause();
}

/* ═══════════ 10 · Booking: dates, slots, summary, submit ═══════════ */
function buildDates() {
  const now = nairobiNow();
  const [y, m, d] = now.ymd.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const fmtDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });
  const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const list = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(base.getTime() + i * 86400000);
    list.push({
      index: i,
      weekday: date.getUTCDay(),
      dayName: i === 0 ? 'Today' : fmtDay.format(date),
      dayNum: date.getUTCDate(),
      long: i === 0 ? `Today · ${fmtLong.format(date)}` : fmtLong.format(date),
      isToday: i === 0,
      isSunday: date.getUTCDay() === 0,
    });
  }
  return list;
}

function fmtTime(mins) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

const chosenDate = () => state.dates[state.dateIndex] ?? state.dates[0];

/* Services restricted to certain weekdays (e.g. The Mbogi Experience, Mon–Wed) */
const dayRestrictedServices = (list, date) =>
  date ? list.filter((s) => Array.isArray(s.days) && !s.days.includes(date.weekday)) : [];

function renderDates() {
  const strip = $('#dateStrip');
  strip.innerHTML = state.dates.map((d) => {
    const disabled = d.isToday && d.isSunday; /* Sunday same-day: must book a day ahead */
    return `<button class="date-chip ${state.dateIndex === d.index ? 'is-active' : ''}" type="button"
      data-date="${d.index}" aria-pressed="${state.dateIndex === d.index}" ${disabled ? `disabled title="Sunday: ${SUNDAY_POLICY} Please book a day ahead."` : d.isSunday ? `title="Sunday: ${SUNDAY_POLICY}"` : ''}>
      <small>${d.dayName}</small><strong>${d.dayNum}</strong>${d.isSunday ? '<i>Premium</i>' : '<i>&nbsp;</i>'}
    </button>`;
  }).join('');
  $$('.date-chip:not(:disabled)', strip).forEach((chip) => chip.addEventListener('click', () => {
    state.dateIndex = Number(chip.dataset.date);
    state.time = null;
    renderDates();
  }));
  renderSlots();
}

function renderSlots() {
  const date = chosenDate();
  if (!date) return;
  const grid = $('#slotGrid');
  const now = nairobiNow();
  $('#slotDateLabel').textContent = date.long;
  $('#sundayNotice').hidden = !date.isSunday;
  $('#todayNotice').hidden = !date.isToday || date.isSunday;
  if (date.isSunday) {
    const visit = $('#bookVisit');
    const sundayOption = visit && Array.from(visit.options).find((o) => o.text.startsWith('Sunday'));
    if (sundayOption) visit.value = sundayOption.value;
  }

  const openMin = date.isSunday ? 600 : hoursForDay(date.weekday).openMin ?? 480;
  const closeMin = date.isSunday ? 1080 : 1200;
  $('#slotMeta').textContent = date.isSunday
    ? `${fmtTime(openMin)} – ${fmtTime(closeMin)} · ${SUNDAY_POLICY}`
    : `${fmtTime(openMin)} – ${fmtTime(closeMin)} · walk-ins welcome`;

  const slots = [];
  for (let t = openMin; t <= closeMin - 30; t += 30) slots.push(t);
  grid.innerHTML = slots.map((t) => {
    const past = date.isToday && t <= now.minutes + 45;
    return `<button class="slot ${state.time === t ? 'is-active' : ''}" type="button" data-time="${t}"
      aria-pressed="${state.time === t}" ${past ? 'disabled' : ''}>${fmtTime(t)}</button>`;
  }).join('');
  $$('.slot:not(:disabled)', grid).forEach((btn) => btn.addEventListener('click', () => {
    state.time = Number(btn.dataset.time);
    renderSlots();
  }));
  renderSummary();
}

function renderSummary() {
  const wrap = $('#bookingSummary');
  if (!wrap) return;
  const list = selectedServices();
  const t = totals();
  if (!list.length) {
    wrap.innerHTML = `<p class="summary__empty">No rituals selected yet — pick from the
      <a class="link-gold" href="#services">menu above</a> or choose a Main Ritual, and your chair summary appears here.</p>`;
    return;
  }
  const date = chosenDate();
  const blocked = dayRestrictedServices(list, date);
  wrap.innerHTML = `
    ${list.map((s) => `
      <div class="summary__row">
        <span>${s.name} · ${durationLabel(s.mins)}</span>
        <span><b>${money(s.price)}</b> <button type="button" data-remove="${s.id}" aria-label="Remove ${s.name}">Remove</button></span>
      </div>`).join('')}
    <div class="summary__row"><span>Barber</span><b>${chosenBarber().name}</b></div>
    <div class="summary__row"><span>When</span><b>${date ? date.long : ''}${state.time != null ? ` · ${fmtTime(state.time)}` : ' · pick a time'}</b></div>
    <div class="summary__total"><span>${date?.isSunday ? 'Standard menu total' : 'Total'} · chair time ${durationLabel(t.mins)}</span><strong>${money(t.price)}</strong></div>
    ${date?.isSunday ? `<p class="summary__warn"><b>Sunday — ${SUNDAY_POLICY}</b> The total above is our standard Mon–Sat menu guide; we will confirm your exact premium rate on WhatsApp before your chair is reserved.</p>` : ''}
    ${blocked.length ? `<p class="summary__warn"><b>${blocked.map((s) => s.name).join(', ')}</b> runs <b>Monday to Wednesday only</b> — please choose a Mon, Tue or Wed above to use this offer.</p>` : ''}
    <p class="summary__free">Included FREE: aftershave hand & shoulder massage + coffee / tea / light bites.</p>`;
  $$('[data-remove]', wrap).forEach((b) => b.addEventListener('click', () => selectService(b.dataset.remove)));
}

function showError(msg) {
  const el = $('#formError');
  el.textContent = msg;
  el.hidden = !msg;
  if (msg) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function initBooking() {
  $('#bookBarber').innerHTML = BARBERS.map((b) =>
    `<option value="${b.id}">${b.name}${b.id !== 'any' ? ` — ${b.role}` : ''}</option>`).join('');
  $('#bookService').innerHTML = `<option value="">Choose your main ritual…</option>` + CATEGORIES.filter((c) => c.id !== 'all').map((c) =>
    `<optgroup label="${c.label}">${SERVICES.filter((s) => s.cat === c.id)
      .map((s) => `<option value="${s.id}">${s.name} · ${money(s.price)}</option>`).join('')}</optgroup>`).join('');

  $('#bookBarber').addEventListener('change', (e) => selectBarber(e.target.value));
  $('#bookService').addEventListener('change', (e) => { if (e.target.value) selectService(e.target.value, true); });

  state.dates = buildDates();
  if (state.dates[0]?.isSunday) state.dateIndex = 1; /* today-Sunday cannot be same-day booked */
  renderDates();

  ['bookName', 'bookPhone'].forEach((id) => $('#' + id).addEventListener('input', () => showError('')));

  $('#bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#bookName').value.trim();
    const phone = $('#bookPhone').value.trim();
    const list = selectedServices();
    const date = chosenDate();
    if (!list.length) return showError('Select at least one ritual from the menu (or the Main Ritual dropdown) so we can reserve the right chair time.');
    const blocked = dayRestrictedServices(list, date);
    if (blocked.length) return showError(`${blocked[0].name} runs Monday to Wednesday only — please choose a Monday, Tuesday or Wednesday above, or remove it from your summary.`);
    if (date?.isSunday && date.isToday) return showError(`Sunday is ${SUNDAY_POLICY} Please choose a future Sunday at least one day ahead.`);
    const visitType = $('#bookVisit').value;
    if (visitType.startsWith('Walk-in today') && !date?.isToday) return showError('You chose “Walk-in today” — please pick today’s date above, or change Visit Type to a reservation.');
    if (visitType.startsWith('Sunday') && !date?.isSunday) return showError(`You chose a Sunday premium appointment — please pick a Sunday above (Sunday: ${SUNDAY_POLICY}).`);
    if (state.time == null) return showError('Pick a time slot above — slots refresh every 30 minutes of lounge time.');
    if (name.length < 2) return showError('Please add your name so the desk can check you in.');
    if (phone.replace(/\D/g, '').length < 9) return showError('Please add a valid phone / WhatsApp number (e.g. 0712345678).');
    showError('');

    const t = totals();
    const lines = [
      `Hello Fresh Start Grooming Lounge! I'd like to reserve a chair.`,
      ``,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Barber: ${chosenBarber().name}`,
      `Visit: ${date.isSunday ? `Sunday — ${SUNDAY_POLICY}` : $('#bookVisit').value} · ${$('#bookGuest').value}`,
      `When: ${date.long} at ${fmtTime(state.time)}${date.isSunday ? ` (${SUNDAY_POLICY})` : ''}`,
      ``,
      `Rituals:`,
      ...list.map((s) => `• ${s.name} — ${money(s.price)} (${durationLabel(s.mins)})`),
      ``,
      `${date.isSunday ? 'Standard menu total (guide)' : 'Total'}: ${money(t.price)} · Chair time: ${durationLabel(t.mins)}`,
    ];
    if (date.isSunday) lines.push(`Please confirm my exact Sunday premium rate and availability before reserving my chair.`);
    const notes = $('#bookNotes').value.trim();
    if (notes) lines.push(``, `Notes: ${notes}`);
    lines.push(``, `— sent from the Fresh Start website`);
    window.open(`https://wa.me/${BUSINESS.phoneDigits}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    toast('Opening WhatsApp with your reservation…', 'i-whatsapp');
  });
}

/* ═══════════ 11 · Socials, FAQ ═══════════ */
function renderSocials() {
  $('#socialGrid').innerHTML = SOCIALS.map((s) => `
    <a class="social-card" href="${s.href}" target="_blank" rel="noopener">
      <span class="social-card__ic">${svg(s.icon)}</span>
      <span><strong>${s.label}</strong><span>${s.handle}</span></span>
    </a>`).join('');
}

function renderFaqs() {
  $('#faqList').innerHTML = FAQS.map((f) => `
    <details class="faq__item">
      <summary>${f.q}<span class="faq__ic">${svg('i-plus')}</span></summary>
      <div class="faq__a"><p>${f.a}</p></div>
    </details>`).join('');
  $$('#faqList .faq__item').forEach((item) => item.addEventListener('toggle', () => {
    if (item.open) $$('#faqList .faq__item').forEach((o) => { if (o !== item) o.open = false; });
  }));
}

/* ═══════════ Init ═══════════ */
initTheme();
renderBarbers();
initBarberRailNav();
initServices();
renderProcess();
renderGallery();
initLightbox();
renderAboutBits();
initReviews();
initHours();
initBooking();
renderSocials();
renderFaqs();
initHeader();
initTicker();
$('#year').textContent = String(new Date().getFullYear());
runLoader();
