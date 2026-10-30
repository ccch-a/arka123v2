// ===== АРКА 123 — интерактивный 3D-просмотр помещения (Задание №3) =====
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildLoft } from './loft.js';

export function initSpaceViewer() {
  const canvas = document.getElementById('spaceCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const { scene, setScenario, lighting } = buildLoft();
  setScenario('empty');

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(5.6, 2.6, 3.4);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1.4, -0.5);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.5;
  controls.maxDistance = 10.5;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.55;

  // автоповорот выключаем при первом взаимодействии
  canvas.addEventListener('pointerdown', () => { controls.autoRotate = false; }, { once: true });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  // кнопки сценариев
  const buttons = Array.from(document.querySelectorAll('.space__btn'));
  const cards = Array.from(document.querySelectorAll('[data-scenario-info]'));
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.scenario;
      setScenario(name);
      buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
      cards.forEach((c) => c.classList.toggle('is-active', c.dataset.scenarioInfo === name));
    });
  });
  cards.forEach((c) => c.classList.toggle('is-active', c.dataset.scenarioInfo === 'empty'));

  // режимы освещения
  const lightBtns = Array.from(document.querySelectorAll('.space__light'));
  lightBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      lighting[btn.dataset.light]?.();
      lightBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
    });
  });

  let visible = false;
  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '100px' });
  io.observe(canvas);

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    controls.update();
    renderer.render(scene, camera);
  }
  tick();
}
