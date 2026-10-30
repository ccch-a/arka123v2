// ===== АРКА 123 — сборка сайта =====
import './style.css';
import { mountLogo } from './logo.js';
import { initHero } from './hero.js';
import { initSpaceViewer } from './space.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Логотипы ----------
mountLogo(document.getElementById('headerLogo'), { variant: 'inherit', wordmark: true });
mountLogo(document.getElementById('footerLogo'), { variant: 'light', wordmark: true, slogan: true });
mountLogo(document.getElementById('heroLogo'), { variant: 'light', wordmark: true, slogan: true });

// ---------- Прелоадер (Задание №1): один раз за сессию ----------
const loader = document.getElementById('loader');
let skipLoader = REDUCED;
try { if (sessionStorage.getItem('arka-intro')) skipLoader = true; } catch (e) {}

if (skipLoader) {
  loader.remove();
} else {
  mountLogo(document.getElementById('loaderLogo'), { variant: 'light', wordmark: true, slogan: false }, { animate: true });
  const closeLoader = () => {
    loader.classList.add('is-done');
    setTimeout(() => loader.remove(), 1300);
    try { sessionStorage.setItem('arka-intro', '1'); } catch (e) {}
  };
  setTimeout(() => document.querySelector('.loader__slogan').classList.add('is-in'), 1500);
  setTimeout(closeLoader, 2600);
  setTimeout(() => { if (document.body.contains(loader)) closeLoader(); }, 7000); // страховка
}

// ---------- Hero (Задание №4) и 3D-зал (Задание №3) ----------
initHero();
initSpaceViewer();

// ---------- Reveal-анимации секций ----------
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-in');
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

// ---------- Досчёт цифр в фактах ----------
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = +(el.dataset.decimals || 0);
  const dur = 1400;
  const t0 = performance.now();
  function step(t) {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals).replace('.', ',');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); }
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

// ---------- Фотогалерея ----------
const PHOTOS = [
  ['1.jpg', 'Зал с колоннами и ёлочным паркетом'],
  ['2.jpg', 'Панорама зала с арочными окнами'],
  ['3.jpg', 'Материалы отделки'],
  ['4.jpg', 'Арочные окна вечером'],
  ['5.jpg', 'Линейные светильники'],
  ['6.jpg', 'Два арочных окна 4×3,5 м'],
  ['7.jpg', 'Вид на Национальную библиотеку'],
  ['8.jpg', 'Променад у окон'],
  ['9.jpg', 'Арочное окно с витражной наклейкой'],
  ['01.jpg', 'Окна на закате'],
  ['10.jpg', 'Светлый зал днём'],
  ['11.jpg', 'Кухонная зона'],
  ['12.jpg', 'Стеклянная перегородка'],
  ['13.jpg', 'Входная группа'],
  ['14.jpg', 'Холл'],
  ['15.jpg', 'Фасад здания с арками'],
  ['16.jpg', 'Променад у входа'],
  ['17.jpg', 'Здание со стороны улицы'],
  ['18.jpg', 'Арки фасада'],
  ['19.jpg', 'Национальная библиотека напротив'],
  ['20.jpg', 'Парковка у здания'],
  ['21.jpg', 'Вид на библиотеку с променада'],
];
const galleryGrid = document.getElementById('galleryGrid');
PHOTOS.forEach(([file, alt], i) => {
  const a = document.createElement('a');
  a.href = `assets/photos/${file}`;
  a.dataset.index = i;
  const img = document.createElement('img');
  img.src = `assets/photos/${file}`;
  img.alt = alt;
  img.loading = 'lazy';
  a.appendChild(img);
  galleryGrid.appendChild(a);
});

// лайтбокс
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let lbIndex = 0;
function openLB(i) {
  lbIndex = (i + PHOTOS.length) % PHOTOS.length;
  lightboxImg.src = `assets/photos/${PHOTOS[lbIndex][0]}`;
  lightboxImg.alt = PHOTOS[lbIndex][1];
  lightbox.classList.add('is-open');
}
galleryGrid.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  e.preventDefault();
  openLB(+a.dataset.index);
});
document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('is-open'));
document.getElementById('lightboxPrev').addEventListener('click', () => openLB(lbIndex - 1));
document.getElementById('lightboxNext').addEventListener('click', () => openLB(lbIndex + 1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('is-open'); });
window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') lightbox.classList.remove('is-open');
  if (e.key === 'ArrowLeft') openLB(lbIndex - 1);
  if (e.key === 'ArrowRight') openLB(lbIndex + 1);
});

// ---------- Мобильное меню ----------
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
burger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
});
mobileNav.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => mobileNav.classList.remove('is-open'))
);

// ---------- Умная форма бронирования ----------
const form = document.getElementById('bookingForm');
const tariffSelect = document.getElementById('bookingTariff');
const hoursSelect = document.getElementById('bookingHours');
const estimate = document.getElementById('estimate');
const dateInput = document.getElementById('bookingDate');
dateInput.min = new Date().toISOString().split('T')[0];

const TARIFFS = {
  hour: { name: 'Час', rate: 45, unit: 'час' },
  half: { name: 'Полдня', price: 150, note: '4 часа · 37,5 BYN/час вместо 45' },
  day: { name: 'День', price: 260, note: '8 часов · доступ за час до начала' },
};

function updateEstimate() {
  const v = tariffSelect.value;
  hoursSelect.hidden = v !== 'hour';
  if (v === 'unknown') {
    estimate.classList.remove('is-show');
    return;
  }
  let sum, note;
  if (v === 'hour') {
    const h = +hoursSelect.value;
    sum = h * TARIFFS.hour.rate;
    note = `${h} ч × 45 BYN · цены демонстрационные`;
  } else {
    sum = TARIFFS[v].price;
    note = TARIFFS[v].note + ' · цены демонстрационные';
  }
  estimate.innerHTML = `Ориентировочно: <b>${sum} BYN</b><small>${note}</small>`;
  estimate.classList.add('is-show');
}
tariffSelect.addEventListener('change', updateEstimate);
hoursSelect.addEventListener('change', updateEstimate);
updateEstimate();

// кнопки «Выбрать» в тарифах предзаполняют форму
document.querySelectorAll('[data-tariff]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const map = { 'Час': 'hour', 'Полдня': 'half', 'День': 'day' };
    tariffSelect.value = map[btn.dataset.tariff] || 'unknown';
    updateEstimate();
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  form.reset();
  updateEstimate();
  document.getElementById('bookingOk').classList.add('is-show');
});

// ---------- Мобильная липкая кнопка брони ----------
const ctaBar = document.getElementById('ctaBar');
const heroEl = document.querySelector('.hero');
const footerEl = document.getElementById('booking');
function updateCtaBar() {
  const pastHero = window.scrollY > heroEl.offsetHeight - window.innerHeight;
  const fr = footerEl.getBoundingClientRect();
  const nearForm = fr.top < window.innerHeight && fr.bottom > 0;
  ctaBar.classList.toggle('is-show', pastHero && !nearForm);
}
window.addEventListener('scroll', updateCtaBar, { passive: true });
updateCtaBar();

// ---------- Dev-проверка: ?scroll=0.5 прокрутка hero, ?plain=1 без лоадера ----------
const qs = new URLSearchParams(location.search);
if (qs.has('plain')) document.getElementById('loader')?.remove();
if (qs.has('scroll')) {
  document.getElementById('loader')?.remove();
  const hero = document.querySelector('.hero');
  const total = hero.offsetHeight - window.innerHeight;
  window.scrollTo(0, Math.max(0, total * parseFloat(qs.get('scroll'))));
  window.dispatchEvent(new Event('scroll'));
}
