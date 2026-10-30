// ===== АРКА 123 — 3D-сцена лофта (Задание №3) =====
// Стилизованно-реалистичная модель зала 123 м²: ёлочный паркет, тёмный потолок
// с линейными светильниками, графитовые колонны и два арочных окна 4×3,5 м
// с видом на Национальную библиотеку. Три сценария: пустой / мастер-класс / столы.
import * as THREE from 'three';

const INK = 0x203641;
const GOLD = 0xc7a252;
const PLASTER = 0xe9e2d4;

// --- процедурная текстура паркета «ёлочкой» ---
function herringboneTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#b98d5f';
  g.fillRect(0, 0, 512, 512);
  const tones = ['#c49a6b', '#b98d5f', '#a97e52', '#c09263', '#b3855a'];
  const pw = 44, pl = 176; // плашка
  g.save();
  g.translate(256, 256);
  for (let row = -6; row < 6; row++) {
    for (let col = -6; col < 6; col++) {
      const t = tones[Math.abs(row * 7 + col * 13) % tones.length];
      g.save();
      g.translate(col * pw * 2 + (row % 2) * pw, row * pw * 2);
      g.rotate(Math.PI / 4);
      g.fillStyle = t;
      g.fillRect(-pl / 2, -pw / 2, pl, pw);
      g.strokeStyle = 'rgba(90,60,35,.16)';
      g.strokeRect(-pl / 2, -pw / 2, pl, pw);
      g.restore();
      g.save();
      g.translate(col * pw * 2 + (row % 2) * pw + pw, row * pw * 2 + pw);
      g.rotate(-Math.PI / 4);
      g.fillStyle = tones[Math.abs(row * 5 + col * 11 + 2) % tones.length];
      g.fillRect(-pl / 2, -pw / 2, pl, pw);
      g.strokeStyle = 'rgba(90,60,35,.16)';
      g.strokeRect(-pl / 2, -pw / 2, pl, pw);
      g.restore();
    }
  }
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 1.4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function archedHolePath(cx, base, w, h) {
  // арочный проём: прямоугольник с полукруглым верхом
  const r = w / 2;
  const springY = base + h - r; // линия пяты арки
  const p = new THREE.Path();
  p.moveTo(cx - r, base);
  p.lineTo(cx - r, springY);
  p.absarc(cx, springY, r, Math.PI, 0, true);
  p.lineTo(cx + r, base);
  p.lineTo(cx - r, base);
  return p;
}

export function buildLoft(THREE_OPTS = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9db6c4);

  const W = 14, D = 9, H = 4.5; // размеры зала (м)

  // ---------- Свет ----------
  scene.add(new THREE.HemisphereLight(0xdfeaf2, 0x6b5844, 0.95));
  const sun = new THREE.DirectionalLight(0xfff2dd, 2.2);
  sun.position.set(4, 7, -14); // светит сквозь окна внутрь
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -10; sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xcfe0ea, 0.5);
  fill.position.set(-6, 8, 10);
  scene.add(fill);

  // ---------- Пол ----------
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({ map: herringboneTexture(), roughness: 0.55, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // ---------- Потолок (графит) ----------
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({ color: 0x1b2830, roughness: 0.95, side: THREE.DoubleSide })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = H;
  scene.add(ceil);

  // линейные светильники — 33 дизайнерских (11 × 3 ряда), висят ниже,
  // чтобы читались в кадре пролёта и не сливались с потолком
  const lampGeo = new THREE.BoxGeometry(0.18, 0.09, 2.6);
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xfff6e6, emissiveIntensity: 3.0,
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x0e161b });
  for (let i = 0; i < 11; i++) {
    const x = -W / 2 + 1.2 + i * (W - 2.4) / 10;
    for (const z of [-2.6, 0, 2.6]) {
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(x, H - 0.85, z);
      scene.add(lamp);
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.85), wireMat);
      wire.position.set(x, H - 0.425, z);
      scene.add(wire);
    }
  }
  // мягкое тёплое свечение под светильниками — оживляет потолок в кадре
  for (const x of [-3.5, 3.5]) {
    const glow = new THREE.PointLight(0xffe9c4, 14, 12, 1.8);
    glow.position.set(x, H - 1.2, 0);
    scene.add(glow);
  }

  // ---------- Стена с арочными окнами (z = -D/2) ----------
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-W / 2, 0);
  wallShape.lineTo(W / 2, 0);
  wallShape.lineTo(W / 2, H);
  wallShape.lineTo(-W / 2, H);
  wallShape.lineTo(-W / 2, 0);
  wallShape.holes.push(archedHolePath(-3.6, 0.45, 4, 3.5));
  wallShape.holes.push(archedHolePath(3.6, 0.45, 4, 3.5));
  const winWall = new THREE.Mesh(
    new THREE.ExtrudeGeometry(wallShape, { depth: 0.3, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ color: PLASTER, roughness: 0.9 })
  );
  winWall.position.set(0, 0, -D / 2 - 0.3);
  winWall.castShadow = true;
  scene.add(winWall);

  // оконные рамы + стекло
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x14100d, roughness: 0.6 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbfd8e4, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0,
  });
  for (const cx of [-3.6, 3.6]) {
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.6), glassMat);
    glass.position.set(cx, 0.45 + 1.8, -D / 2 - 0.12);
    scene.add(glass);
    // импосты: 2 вертикали + 1 горизонталь
    for (const dx of [-2 / 3, 2 / 3]) {
      const mull = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.5, 0.1), frameMat);
      mull.position.set(cx + dx, 0.45 + 1.75, -D / 2 - 0.12);
      scene.add(mull);
    }
    const trans = new THREE.Mesh(new THREE.BoxGeometry(4, 0.07, 0.1), frameMat);
    trans.position.set(cx, 0.45 + 1.5, -D / 2 - 0.12);
    scene.add(trans);
    // подоконник
    const sill = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xd8d0c0 }));
    sill.position.set(cx, 0.45, -D / 2 - 0.05);
    scene.add(sill);
    // радиатор под окном
    const rad = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.5, metalness: 0.6 }));
    rad.position.set(cx, 0.24, -D / 2 + 0.25);
    scene.add(rad);
  }

  // ---------- Вид за окном: Национальная библиотека ----------
  const loader = new THREE.TextureLoader();
  loader.load('assets/photos/21wide.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    // Одна широкая панорама на оба окна (3344×941: слева зеркальная копия —
    // стык бесшовный). Правая арка кадрирует Библиотеку по центру,
    // левая видит улицу слева от неё — как в реальности, без серых зазоров.
    const aspect = tex.image.width / tex.image.height; // 3.554
    const bw = 72, bh = bw / aspect; // 72 × 20.25
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(bw, bh),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    backdrop.position.set(-9.2, 1.3, -D / 2 - 5);
    scene.add(backdrop);
  });
  // Променад-плоскость убран: из окон под углом вниз теперь виден асфальт
  // с самой фотографии (её нижняя часть — дорога), а не серая «пустота».

  // ---------- Остальные стены ----------
  const wallMat = new THREE.MeshStandardMaterial({ color: PLASTER, roughness: 0.9, side: THREE.DoubleSide });
  const mkWall = (w, h, x, y, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    scene.add(m);
    return m;
  };
  mkWall(W, H, 0, H / 2, D / 2, Math.PI);            // входная стена
  mkWall(D, H, -W / 2, H / 2, 0, Math.PI / 2);       // левая
  mkWall(D, H, W / 2, H / 2, 0, -Math.PI / 2);       // правая

  // белые стеновые панели (левая стена)
  const panelMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.7 });
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, H * 0.92, 1.1), panelMat);
    p.position.set(-W / 2 + 0.06, H * 0.46, -D / 2 + 1 + i * 1.25);
    scene.add(p);
  }

  // ---------- Колонны (графит) ----------
  const colMat = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.55 });
  for (const x of [-2.4, 2.4]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, H, 0.55), colMat);
    col.position.set(x, H / 2, 0.6);
    col.castShadow = true;
    scene.add(col);
  }

  // ---------- Кухонный блок у входной стены ----------
  const kitchenMat = new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: 0.4 });
  const kitchen = new THREE.Group();
  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.65), kitchenMat);
  counter.position.set(0, 0.45, 0);
  kitchen.add(counter);
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.05, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.3 }));
  top.position.set(0, 0.93, 0);
  kitchen.add(top);
  kitchen.position.set(-4.6, 0, D / 2 - 0.6);
  scene.add(kitchen);

  // ---------- Растения ----------
  const plant = (x, z) => {
    const g = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x9a938a }));
    pot.position.y = 0.2;
    g.add(pot);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1),
      new THREE.MeshStandardMaterial({ color: 0x4c7a45, roughness: 1 }));
    crown.position.y = 0.95;
    crown.castShadow = true;
    g.add(crown);
    g.position.set(x, 0, z);
    scene.add(g);
  };
  plant(6.3, D / 2 - 0.8);
  plant(-6.3, -D / 2 + 0.9);

  // ---------- СЦЕНАРИИ ----------
  const scenarios = {
    empty: new THREE.Group(),
    masterclass: new THREE.Group(),
    tables: new THREE.Group(),
  };

  // общий конструктор стула
  const chairMats = {
    seat: new THREE.MeshStandardMaterial({ color: INK, roughness: 0.6 }),
    leg: new THREE.MeshStandardMaterial({ color: 0x333a40, metalness: 0.5, roughness: 0.4 }),
  };
  function makeChair() {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), chairMats.seat);
    seat.position.y = 0.45;
    seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.05), chairMats.seat);
    back.position.set(0, 0.72, -0.19);
    g.add(back);
    for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), chairMats.leg);
      leg.position.set(dx, 0.225, dz);
      g.add(leg);
    }
    return g;
  }

  // --- Сценарий «Мастер-класс»: экран + ряды кресел + трибуна спикера ---
  {
    const g = scenarios.masterclass;
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x8899aa, emissiveIntensity: 0.25 })
    );
    screen.position.set(W / 2 - 0.25, 2.2, 0);
    screen.rotation.y = -Math.PI / 2;
    g.add(screen);
    // презентация на экране
    const slide = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.7),
      new THREE.MeshBasicMaterial({ color: 0x203641 }));
    slide.position.set(W / 2 - 0.24, 2.2, 0);
    slide.rotation.y = -Math.PI / 2;
    g.add(slide);
    const slideTitle = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.35),
      new THREE.MeshBasicMaterial({ color: GOLD }));
    slideTitle.position.set(W / 2 - 0.23, 2.55, 0);
    slideTitle.rotation.y = -Math.PI / 2;
    g.add(slideTitle);
    // трибуна
    const lectern = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.1, 0.45),
      new THREE.MeshStandardMaterial({ color: INK, roughness: 0.5 }));
    lectern.position.set(W / 2 - 1.2, 0.55, -1.5);
    lectern.castShadow = true;
    g.add(lectern);
    // ряды кресел (4 ряда × 6)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const ch = makeChair();
        ch.position.set(2.4 - r * 1.05, 0, -2.6 + c * 1.05);
        ch.rotation.y = Math.PI / 2; // лицом к экрану
        g.add(ch);
      }
    }
  }

  // --- Сценарий «Столы»: большой общий стол + 16 стульев ---
  {
    const g = scenarios.tables;
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.07, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.45 })
    );
    tableTop.position.set(0, 0.74, 0.3);
    tableTop.castShadow = true;
    g.add(tableTop);
    for (const dx of [-2.5, 2.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x2b2b2b, metalness: 0.4, roughness: 0.5 }));
      leg.position.set(dx, 0.37, 0.3);
      g.add(leg);
    }
    for (let i = 0; i < 8; i++) {
      const x = -2.45 + i * 0.7;
      const ch1 = makeChair(); ch1.position.set(x, 0, -0.75); g.add(ch1);
      const ch2 = makeChair(); ch2.position.set(x, 0, 1.35); ch2.rotation.y = Math.PI; g.add(ch2);
    }
  }

  // --- Сценарий «Отдельные столы»: 6 столов × 5 стульев для малых групп ---
  scenarios.groups = new THREE.Group();
  {
    const g = scenarios.groups;
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.45 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, metalness: 0.4, roughness: 0.5 });
    const spots = [
      [-4.2, -1.6], [-4.2, 2.2], [0, -1.6], [0, 2.2], [4.2, -1.6], [4.2, 2.2],
    ];
    for (const [tx, tz] of spots) {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 1.0), tableMat);
      top.position.set(tx, 0.74, tz);
      top.castShadow = true;
      g.add(top);
      for (const [dx, dz] of [[-0.68, -0.4], [0.68, -0.4], [-0.68, 0.4], [0.68, 0.4]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.72, 0.07), legMat);
        leg.position.set(tx + dx, 0.37, tz + dz);
        g.add(leg);
      }
      // 5 стульев вокруг стола
      const chairPos = [
        [-0.45, -0.85, 0], [0.45, -0.85, 0], [0, 0.85, Math.PI], [-1.05, 0, Math.PI / 2], [1.05, 0, -Math.PI / 2],
      ];
      for (const [cx, cz, ry] of chairPos) {
        const ch = makeChair();
        ch.position.set(tx + cx, 0, tz + cz);
        ch.rotation.y = ry;
        g.add(ch);
      }
    }
  }

  for (const key of Object.keys(scenarios)) {
    scenarios[key].visible = false;
    scene.add(scenarios[key]);
  }
  scenarios.empty.visible = true;

  // ---------- Режимы освещения ----------
  const lighting = {
    day() {
      sun.intensity = 2.2; sun.color.set(0xfff2dd);
      fill.intensity = 0.5;
      scene.background.set(0x9db6c4);
      scene.traverse((o) => { if (o.material === lampMat) o.material.emissiveIntensity = 2.4; });
    },
    evening() {
      sun.intensity = 0.5; sun.color.set(0xffb27a);
      fill.intensity = 0.2;
      scene.background.set(0x35424e);
      scene.traverse((o) => { if (o.material === lampMat) o.material.emissiveIntensity = 4.2; });
    },
  };

  return {
    scene,
    scenarios,
    lighting,
    setScenario(name) {
      for (const key of Object.keys(scenarios)) scenarios[key].visible = key === name;
    },
  };
}
