// ===== АРКА 123 — логотип из оригинальных векторных контуров (Задание №1) =====
// Контуры (арка, цифры, буквы, слоган) лежат в инлайн-спрайте в index.html
// и переиспользуются через <use>. Анимация прелоадера: две половинки арки растут
// от основания к вершине (срезаются контуром арки через clip-path), затем цифры
// 1-2-3, слово «АРКА 123» и слоган появляются каскадом. Ховер: цифры «пересчитываются»,
// по арке пробегает золотой блик.

const COLORS = { light: '#F5F2EC', dark: '#203641' };
const GOLD = '#C7A252';

const VB_FULL = '222 200 1330 480'; // иконка + слово + слоган
const VB_NO_SLOGAN = '222 200 1330 480';
const VB_ICON = '222 200 420 480';

// половинки контура арки для прорисовки (в системе координат спрайта)
const ARCH_HALF_L = 'M432,657.5 H247 V405.5 A184.25 184.25 0 0 1 432.25,221.25';
const ARCH_HALF_R = 'M430.5,657.5 H615.5 V405.5 A184.25 184.25 0 0 0 430.25,221.25';

export function logoSVG({ variant = 'dark', wordmark = true, slogan = false, animated = false } = {}) {
  const inherit = variant === 'inherit';
  const c = inherit ? 'currentColor' : (COLORS[variant] || COLORS.dark);
  const vb = !wordmark ? VB_ICON : VB_FULL;
  const digits = `
    <use href="#d1" class="digit digit--1 rise" style="--d:.60s"/>
    <use href="#d2" class="digit digit--2 rise" style="--d:.74s"/>
    <use href="#d3" class="digit digit--3 rise" style="--d:.88s"/>`;
  const word = wordmark ? `
    <g class="wordmark">
      <use href="#wa"  class="rise" style="--d:1.02s"/>
      <use href="#wp"  class="rise" style="--d:1.08s"/>
      <use href="#wk"  class="rise" style="--d:1.14s"/>
      <use href="#wa2" class="rise" style="--d:1.20s"/>
      <use href="#n1"  class="rise" style="--d:1.28s"/>
      <use href="#n2"  class="rise" style="--d:1.34s"/>
      <use href="#n3"  class="rise" style="--d:1.40s"/>
    </g>` : '';
  const sl = slogan ? `
    <g class="slogan">
      <use href="#s1" class="rise" style="--d:1.52s"/>
      <use href="#s2" class="rise" style="--d:1.62s"/>
    </g>` : '';

  const arch = animated
    ? `<clipPath id="ringClip"><use href="#ring"/></clipPath>
       <g clip-path="url(#ringClip)">
         <path class="arch-half" pathLength="100" d="${ARCH_HALF_L}" fill="none" stroke="${c}" stroke-width="44"/>
         <path class="arch-half" pathLength="100" d="${ARCH_HALF_R}" fill="none" stroke="${c}" stroke-width="44"/>
       </g>`
    : `<use href="#ring" class="ring-use"/>`;

  return `
  <svg class="arka-logo${animated ? '' : ' arka-logo--static'}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="АРКА 123"${inherit ? '' : ` style="color:${c}"`}>
    <g fill="currentColor">
      ${arch}
      ${digits}
      ${word}
      ${sl}
    </g>
  </svg>`;
}

export function mountLogo(el, opts = {}, { animate = false } = {}) {
  if (!el) return null;
  el.innerHTML = logoSVG({ ...opts, animated: animate });
  const svg = el.querySelector('svg');
  if (animate) {
    void svg.offsetWidth; // reflow и запуск CSS-анимаций
    svg.classList.add('is-anim');
  }
  return svg;
}
