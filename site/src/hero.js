// ===== АРКА 123 — скролл-пролёт по залу (Задание №4, без персонажа) =====
// Фон сайта — 3D-пролёт камеры через лофт, привязанный к скроллу.
// На ключевых точках появляются текстовые подписи о пространстве.
import * as THREE from 'three';
import { buildLoft } from './loft.js';

export function initHero() {
  const canvas = document.getElementById('heroCanvas');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const { scene, setScenario } = buildLoft();
  setScenario('masterclass'); // в пролёте зал наполнен жизнью

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);

  // Траектория камеры: от входа → через зал → к арочным окнам
  const camPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.2, 1.85, 3.6),
    new THREE.Vector3(-2.2, 1.8, 2.2),
    new THREE.Vector3(1.2, 1.8, 1.0),
    new THREE.Vector3(3.4, 1.75, -0.6),
    new THREE.Vector3(3.6, 1.9, -2.6),
  ]);
  const lookPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.35, 0),
    new THREE.Vector3(2.5, 1.4, 0.5),
    new THREE.Vector3(4.5, 1.8, -1.5),
    new THREE.Vector3(3.6, 2.0, -6.0),
    new THREE.Vector3(3.6, 2.2, -10.0), // финал — взгляд в окно на Библиотеку
  ]);

  const stages = Array.from(document.querySelectorAll('.hero__caption'));
  const title = document.querySelector('.hero__title');
  const header = document.getElementById('header');

  let progress = 0;
  let target = 0;
  let visible = true;

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  function onScroll() {
    if (reduced) return;
    const rect = hero.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    target = Math.min(1, Math.max(0, -rect.top / total));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // хедер становится «твёрдым» после hero
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-solid', window.scrollY > window.innerHeight * 4.4);
  }, { passive: true });

  // prefers-reduced-motion: статичный кадр без скролл-пролёта
  if (reduced) target = 0.12;

  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();

  function stageFor(p) {
    if (p < 0.14) return 0;
    if (p < 0.45) return 1;
    if (p < 0.75) return 2;
    return 3;
  }

  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; });
  io.observe(hero);

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    progress += (target - progress) * 0.08; // плавность

    const p = THREE.MathUtils.clamp(progress, 0, 1);
    camPath.getPoint(p, pos);
    lookPath.getPoint(p, look);
    camera.position.copy(pos);
    camera.lookAt(look);

    // лёгкое «дыхание» камеры
    const t = performance.now() / 1000;
    camera.position.y += Math.sin(t * 1.4) * 0.02;

    // переключение сцен с героем
    const st = stageFor(p);
    stages.forEach((el) => el.classList.toggle('is-in', +el.dataset.stage === st));
    if (title) {
      const o = st === 0 ? 1 : 0;
      title.style.opacity = o;
      title.style.transform = st === 0 ? 'none' : 'translateY(-30px)';
      title.style.pointerEvents = st === 0 ? 'auto' : 'none';
    }

    renderer.render(scene, camera);
  }
  tick();
}
