import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

// ============================================================
// EQUIPMENT DATA
// ============================================================
const EQUIPMENT_DATA = {
  heatPump1: {
    name: "空气源热泵 #1",
    nameEn: "Air Source Heat Pump #1",
    icon: "🔥",
    color: "#f59e0b",
    params: [
      ["额定制热量", "71 kW"],
      ["产热水量", "1.327 m³/h"],
      ["运行模式", "24h不间断"],
      ["供水温度", "55℃"],
      ["状态", "运行中"],
    ],
  },
  heatPump2: {
    name: "空气源热泵 #2",
    nameEn: "Air Source Heat Pump #2",
    icon: "🔥",
    color: "#f59e0b",
    params: [
      ["额定制热量", "71 kW"],
      ["产热水量", "1.327 m³/h"],
      ["运行模式", "24h不间断"],
      ["供水温度", "55℃"],
      ["状态", "运行中"],
    ],
  },
  tank: {
    name: "蓄热水箱",
    nameEn: "Thermal Storage Tank (36m³)",
    icon: "💧",
    color: "#3b82f6",
    params: [
      ["总容积", "36 m³"],
      ["可用容积", "~30 m³"],
      ["最大液位", "1.7 m"],
      ["启动补热温度", "< 52℃"],
      ["设定加热温度", "55℃"],
      ["供水温度", "55℃"],
      ["回水温度", "44℃"],
    ],
  },
  chiller1: {
    name: "制冷机房一（新改造）",
    nameEn: "Chiller Room 1 — New",
    icon: "❄️",
    color: "#22c55e",
    params: [
      ["机组1制冷量", "624.5 kW"],
      ["机组2制冷量", "591.9 kW"],
      ["类型", "螺杆冷水机组"],
      ["状态", "新改造机组"],
      ["备注", "不具备双工况/蓄冷"],
    ],
  },
  chiller2: {
    name: "制冷机房二（老旧）",
    nameEn: "Chiller Room 2 — Old (2003)",
    icon: "⚠️",
    color: "#ef4444",
    params: [
      ["机组1制冷量", "464 kW"],
      ["机组2制冷量", "464 kW"],
      ["安装年份", "2003年"],
      ["状态", "老旧，建议更换"],
      ["建议", "更换为节能型冷水机组"],
    ],
  },
  coolingTower: {
    name: "冷却塔",
    nameEn: "Cooling Tower",
    icon: "🌀",
    color: "#94a3b8",
    params: [
      ["位置", "屋面"],
      ["配套系统", "空调制冷"],
      ["备注", "屋面空间已满"],
    ],
  },
  hvacPumps: {
    name: "风冷热泵 ×8（供暖）",
    nameEn: "Air-Cooled Heat Pumps for Heating",
    icon: "🌡️",
    color: "#a78bfa",
    params: [
      ["数量", "8 台"],
      ["单台制热量", "140 kW"],
      ["总制热量", "1,120 kW"],
      ["用途", "冬季空调供热"],
      ["供热方式", "直供（无蓄热）"],
    ],
  },
  kitchen: {
    name: "厨房热水终端",
    nameEn: "Kitchen Hot Water Terminal",
    icon: "🍳",
    color: "#ef4444",
    params: [
      ["供水温度", "55℃"],
      ["用途", "厨房日常热水"],
    ],
  },
  rooms: {
    name: "客房热水终端",
    nameEn: "Guest Room Hot Water Terminal",
    icon: "🚿",
    color: "#8b5cf6",
    params: [
      ["客房数", "127间"],
      ["供水温度", "55℃"],
      ["日用热水量", "~70 m³（估算）"],
    ],
  },
};

// ============================================================
// THREE.JS SCENE
// ============================================================
function buildScene(canvas, w, h) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080c18);
  scene.fog = new THREE.FogExp2(0x080c18, 0.008);

  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500);
  camera.position.set(22, 16, 24);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  // === Lights ===
  scene.add(new THREE.AmbientLight(0x2a3a5c, 0.7));
  const sun = new THREE.DirectionalLight(0xffeedd, 1.0);
  sun.position.set(12, 20, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -25; sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25; sun.shadow.camera.bottom = -25;
  scene.add(sun);
  scene.add(new THREE.DirectionalLight(0x6688cc, 0.3).translateTo?.(-8, 8, -10) || (() => { const l = new THREE.DirectionalLight(0x6688cc, 0.3); l.position.set(-8, 8, -10); return l; })());
  const warmFill = new THREE.PointLight(0xff8844, 0.4, 30);
  warmFill.position.set(-6, 5, 0);
  scene.add(warmFill);

  // === Ground ===
  const groundGeo = new THREE.PlaneGeometry(80, 80);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0d1225, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(60, 30, 0x16213a, 0x0f1830);
  scene.add(grid);

  const clickables = [];
  const fans = [];

  // === Helpers ===
  function box(w2, h2, d2, color, x, y, z, opts = {}) {
    const geo = new THREE.BoxGeometry(w2, h2, d2);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: opts.rough || 0.55, metalness: opts.metal || 0.25, ...opts.matOpts });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (opts.edges) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: opts.edges, transparent: true, opacity: 0.35 }));
      m.add(e);
    }
    scene.add(m);
    return m;
  }

  function cyl(rT, rB, h2, color, x, y, z, seg = 32, opts = {}) {
    const geo = new THREE.CylinderGeometry(rT, rB, h2, seg);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: opts.rough || 0.45, metalness: opts.metal || 0.35, ...opts.matOpts });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  function pipe(pts, color, r = 0.1) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
    const geo = new THREE.TubeGeometry(curve, 48, r, 8, false);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.55, emissive: color, emissiveIntensity: 0.12 });
    const m = new THREE.Mesh(geo, mat); m.castShadow = true;
    scene.add(m);
    return { mesh: m, curve };
  }

  function label(text, x, y, z, color = "#ffffff", scale = 0.55) {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    c.width = 512; c.height = 100;
    ctx.font = "bold 38px sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 50);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    s.position.set(x, y, z);
    s.scale.set(scale * 4, scale, 1);
    scene.add(s);
    return s;
  }

  // =======================================================
  // BUILD: AIR SOURCE HEAT PUMPS ×2 (for domestic hot water)
  // =======================================================
  function makeHeatPump(x, z, id) {
    const g = new THREE.Group();
    // Main body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.6, 2),
      new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.4, metalness: 0.5 })
    );
    body.castShadow = true;
    g.add(body);

    // Side fins
    for (let i = -1; i <= 1; i += 2) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 1.2, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 })
      );
      fin.position.set(i * 1.55, 0, 0);
      g.add(fin);
    }

    // Top fan housing
    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.7, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x78909c, metalness: 0.6 })
    );
    housing.position.y = 0.9;
    g.add(housing);

    // Fan grille (ring)
    const grille = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.7 })
    );
    grille.rotation.x = Math.PI / 2;
    grille.position.y = 1.02;
    g.add(grille);

    // Fan blades
    const fanG = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.025, 0.14),
        new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.7 })
      );
      blade.rotation.y = (i * Math.PI * 2) / 5;
      fanG.add(blade);
    }
    // Hub
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12),
      new THREE.MeshStandardMaterial({ color: 0x455a64, metalness: 0.8 })
    );
    fanG.add(hub);
    fanG.position.y = 1.05;
    g.add(fanG);
    fans.push(fanG);

    // Status LED
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.0 })
    );
    led.position.set(1.2, 0.5, 1.02);
    g.add(led);

    // Pipe stubs
    for (let pz of [-0.6, 0.6]) {
      const stub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.4, 12),
        new THREE.MeshStandardMaterial({ color: 0x78909c, metalness: 0.6 })
      );
      stub.rotation.x = Math.PI / 2;
      stub.position.set(-1.6, -0.3, pz);
      g.add(stub);
    }

    // Base platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.15, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.8 })
    );
    platform.position.y = -0.88;
    platform.receiveShadow = true;
    g.add(platform);

    g.position.set(x, 1.0, z);
    g.userData = { id };
    scene.add(g);
    clickables.push(g);
    return g;
  }

  const hp1 = makeHeatPump(-8, -4, "heatPump1");
  const hp2 = makeHeatPump(-8, 4, "heatPump2");
  label("空气源热泵 #1", -8, 2.8, -4, "#fbbf24", 0.5);
  label("71 kW", -8, 2.35, -4, "#f59e0b", 0.35);
  label("空气源热泵 #2", -8, 2.8, 4, "#fbbf24", 0.5);
  label("71 kW", -8, 2.35, 4, "#f59e0b", 0.35);

  // =======================================================
  // BUILD: THERMAL STORAGE TANK (36m³)
  // =======================================================
  const tankX = 0, tankZ = 0, tankR = 2.0, tankH = 4.5;

  // Outer shell
  const tankShell = cyl(tankR, tankR, tankH, 0x475569, tankX, tankH / 2, tankZ, 36, { metal: 0.45 });
  tankShell.userData = { id: "tank" };
  clickables.push(tankShell);

  // Top & bottom caps
  cyl(tankR + 0.05, tankR + 0.05, 0.12, 0x5a6577, tankX, tankH + 0.06, tankZ, 36, { metal: 0.6 });
  cyl(tankR + 0.05, tankR + 0.05, 0.12, 0x5a6577, tankX, 0.06, tankZ, 36, { metal: 0.6 });

  // Reinforcing bands
  for (let i = 0; i < 4; i++) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(tankR + 0.03, 0.05, 8, 36),
      new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.65 })
    );
    band.rotation.x = Math.PI / 2;
    band.position.set(tankX, 0.6 + i * 1.15, tankZ);
    scene.add(band);
  }

  // Water inside (animated)
  const waterMaxH = tankH * 0.75;
  const waterGeo = new THREE.CylinderGeometry(tankR - 0.15, tankR - 0.15, waterMaxH, 36);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, transparent: true, opacity: 0.45,
    emissive: 0xf59e0b, emissiveIntensity: 0.15,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.set(tankX, waterMaxH / 2 + 0.12, tankZ);
  scene.add(waterMesh);

  // Temperature gauge on tank
  const gaugeBase = box(0.2, 1.2, 0.2, 0x334155, tankX + tankR + 0.25, 2.5, tankZ);
  const gaugeBar = box(0.1, 0.9, 0.1, 0xef4444, tankX + tankR + 0.25, 2.6, tankZ, { matOpts: { emissive: 0xef4444, emissiveIntensity: 0.4 } });

  // Inlet/outlet pipe stubs on tank
  cyl(0.14, 0.14, 0.5, 0xef4444, tankX - tankR - 0.2, 3.5, tankZ - 0.8, 12, { matOpts: { emissive: 0xef4444, emissiveIntensity: 0.2 } }); // hot in
  cyl(0.14, 0.14, 0.5, 0xef4444, tankX + tankR + 0.2, 2.5, tankZ + 0.5, 12, { matOpts: { emissive: 0xef4444, emissiveIntensity: 0.2 } }); // hot out
  cyl(0.14, 0.14, 0.5, 0x3b82f6, tankX - tankR - 0.2, 1.0, tankZ + 0.8, 12, { matOpts: { emissive: 0x3b82f6, emissiveIntensity: 0.2 } }); // cold return

  label("蓄热水箱", tankX, tankH + 1.2, tankZ, "#38bdf8", 0.65);
  label("36m³ / 55℃", tankX, tankH + 0.65, tankZ, "#60a5fa", 0.4);

  // =======================================================
  // BUILD: CHILLERS
  // =======================================================
  function makeChiller(x, z, id, isNew) {
    const g = new THREE.Group();
    const bodyColor = isNew ? 0x1e3a2f : 0x3a1e1e;
    const accentColor = isNew ? 0x22c55e : 0xef4444;

    // Main body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 1.8, 1.6),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5, metalness: 0.3 })
    );
    body.castShadow = true;
    g.add(body);

    // Edge highlight
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(body.geometry),
      new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.4 })
    );
    body.add(edges);

    // Control panel
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: accentColor, emissiveIntensity: 0.15 })
    );
    panel.position.set(1.0, 0.3, 0.83);
    g.add(panel);

    // Status stripe
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(3.52, 0.1, 0.01),
      new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.6 })
    );
    stripe.position.set(0, 0.95, 0.81);
    g.add(stripe);

    // Pipe connectors
    for (let pz of [-0.5, 0.5]) {
      const c = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0x78909c, metalness: 0.5 })
      );
      c.rotation.z = Math.PI / 2;
      c.position.set(-1.9, -0.3, pz);
      g.add(c);
    }

    g.position.set(x, 1.05, z);
    g.userData = { id };
    scene.add(g);
    clickables.push(g);
    return g;
  }

  makeChiller(10, -3.5, "chiller1", true);
  makeChiller(10, 3.5, "chiller2", false);
  label("制冷机房一（新）", 10, 2.8, -3.5, "#4ade80", 0.48);
  label("624.5 + 591.9 kW", 10, 2.3, -3.5, "#22c55e", 0.35);
  label("制冷机房二（旧）", 10, 2.8, 3.5, "#f87171", 0.48);
  label("464×2 kW · 2003年", 10, 2.3, 3.5, "#ef4444", 0.35);

  // =======================================================
  // BUILD: COOLING TOWERS ×2
  // =======================================================
  function makeCoolingTower(x, z) {
    const g = new THREE.Group();
    // Hyperbolic-ish shape
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.9, 2.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.6, metalness: 0.25 })
    );
    body.castShadow = true;
    g.add(body);

    // Top opening ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.06, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.6 })
    );
    ring.rotation.x = Math.PI / 2; ring.position.y = 1.2;
    g.add(ring);

    // Support legs
    for (let a = 0; a < 4; a++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x4b5563 })
      );
      const angle = (a * Math.PI * 2) / 4;
      leg.position.set(Math.cos(angle) * 0.75, -1.45, Math.sin(angle) * 0.75);
      g.add(leg);
    }

    g.position.set(x, 1.5, z);
    g.userData = { id: "coolingTower" };
    scene.add(g);
    clickables.push(g);
    return g;
  }

  makeCoolingTower(14, -1);
  makeCoolingTower(14, 1.5);
  label("冷却塔", 14, 3.5, 0.25, "#9ca3af", 0.45);

  // =======================================================
  // BUILD: HVAC HEAT PUMPS ×8
  // =======================================================
  function makeSmallHP(x, z) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.0, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x4a4a6a, roughness: 0.5, metalness: 0.35 })
    );
    b.castShadow = true;
    g.add(b);

    const fanG = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const bl = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.02, 0.09),
        new THREE.MeshStandardMaterial({ color: 0xa0a0c0, metalness: 0.6 })
      );
      bl.rotation.y = (i * Math.PI) / 2;
      fanG.add(bl);
    }
    fanG.position.y = 0.55;
    g.add(fanG);
    fans.push(fanG);

    g.position.set(x, 0.6, z);
    g.userData = { id: "hvacPumps" };
    scene.add(g);
    clickables.push(g);
    return g;
  }

  for (let i = 0; i < 8; i++) {
    makeSmallHP(10 + (i % 4) * 1.8, i < 4 ? -8 : -6.2);
  }
  label("风冷热泵 ×8", 12.7, 2.2, -7.1, "#a78bfa", 0.48);
  label("140 kW/台 · 冬季供暖", 12.7, 1.75, -7.1, "#7c3aed", 0.35);

  // =======================================================
  // BUILD: KITCHEN & ROOM TERMINALS
  // =======================================================
  // Kitchen
  const kitchenG = new THREE.Group();
  const kBody = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.6, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x44201a, roughness: 0.6 })
  );
  kBody.castShadow = true;
  kitchenG.add(kBody);
  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.18, 1.2, 10),
    new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.4 })
  );
  chimney.position.y = 1.4;
  kitchenG.add(chimney);
  // Counter
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.08, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x78716c })
  );
  counter.position.y = 0.84;
  kitchenG.add(counter);
  kitchenG.position.set(6, 0.85, 10);
  kitchenG.userData = { id: "kitchen" };
  scene.add(kitchenG);
  clickables.push(kitchenG);
  label("厨房", 6, 2.6, 10, "#ef4444", 0.5);

  // Guest rooms terminal (symbolic shower heads)
  const roomsG = new THREE.Group();
  const rBase = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.4, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x2a1a44, roughness: 0.6 })
  );
  rBase.castShadow = true;
  roomsG.add(rBase);
  // Shower symbols
  for (let i = -1; i <= 1; i++) {
    const showerPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0xc4b5fd })
    );
    showerPipe.position.set(i * 0.8, 1.1, 0);
    roomsG.add(showerPipe);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x8b5cf6, emissiveIntensity: 0.3 })
    );
    head.position.set(i * 0.8, 1.55, 0);
    roomsG.add(head);
  }
  roomsG.position.set(-4, 0.75, 10);
  roomsG.userData = { id: "rooms" };
  scene.add(roomsG);
  clickables.push(roomsG);
  label("客房 · 127间", -4, 2.8, 10, "#a78bfa", 0.5);
  label("🚿 日用 ~70m³", -4, 2.3, 10, "#7c3aed", 0.35);

  // =======================================================
  // PIPES
  // =======================================================
  const RED = 0xef4444, BLUE = 0x3b82f6;

  // HP1 → Tank (hot supply)
  const p1 = pipe([
    [-6.4, 0.7, -4], [-4.5, 0.7, -4], [-3.5, 1, -2.5],
    [-2.5, 2.5, -1.2], [-2.0, 3.2, -0.5], [tankX - tankR, 3.2, tankZ - 0.5],
  ], RED, 0.12);

  // HP2 → Tank (hot supply)
  const p2 = pipe([
    [-6.4, 0.7, 4], [-4.5, 0.7, 4], [-3.5, 1, 2.5],
    [-2.5, 2.5, 1.2], [-2.0, 3.2, 0.5], [tankX - tankR, 3.2, tankZ + 0.5],
  ], RED, 0.12);

  // Tank → Rooms (hot supply)
  const p3 = pipe([
    [tankX + tankR, 2.5, tankZ + 0.3], [tankX + 3, 2.5, 2],
    [0, 2, 4], [-2, 1.5, 7], [-4, 1.2, 9],
  ], 0xf97316, 0.11);

  // Tank → Kitchen (hot supply)
  const p4 = pipe([
    [tankX + tankR, 2.5, tankZ - 0.3], [tankX + 3, 2.5, -1],
    [3, 2, 2], [4, 1.5, 5], [5.5, 1.2, 9],
  ], 0xf97316, 0.11);

  // Rooms → HP (cold return)
  const p5 = pipe([
    [-4, 0.35, 9], [-5, 0.35, 7], [-6, 0.35, 4.5],
    [-7, 0.35, 3], [-8, 0.4, 2.2],
  ], BLUE, 0.1);

  // Kitchen → HP (cold return)
  const p6 = pipe([
    [6, 0.35, 9], [4, 0.35, 6], [0, 0.35, 3],
    [-4, 0.35, 0], [-6.5, 0.4, -2], [-8, 0.4, -2.2],
  ], BLUE, 0.1);

  // Pipe labels
  label("供水 55℃ →", -3.5, 3.8, 0, "#ef4444", 0.35);
  label("← 回水 44℃", -5, -0.1, 2, "#60a5fa", 0.32);

  // =======================================================
  // FLOW PARTICLES
  // =======================================================
  const pipeSystems = [
    { pipe: p1, color: 0xef4444, speed: 0.25, count: 12 },
    { pipe: p2, color: 0xef4444, speed: 0.23, count: 12 },
    { pipe: p3, color: 0xf97316, speed: 0.2, count: 10 },
    { pipe: p4, color: 0xf97316, speed: 0.2, count: 10 },
    { pipe: p5, color: 0x3b82f6, speed: 0.18, count: 8 },
    { pipe: p6, color: 0x3b82f6, speed: 0.16, count: 8 },
  ].map(({ pipe: pp, color, speed, count }) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 6, 6),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 })
      );
      s.userData.t = i / count;
      scene.add(s);
      particles.push(s);
    }
    return { curve: pp.curve, particles, speed };
  });

  // =======================================================
  // ORBIT CONTROLS (manual)
  // =======================================================
  let dragging = false, prev = { x: 0, y: 0 };
  const target = new THREE.Vector3(2, 1, 1);
  const sp = {
    theta: Math.atan2(camera.position.x - target.x, camera.position.z - target.z),
    phi: Math.acos(Math.min(1, (camera.position.y - target.y) / camera.position.distanceTo(target))),
    radius: camera.position.distanceTo(target),
  };

  function camUpdate() {
    camera.position.set(
      target.x + sp.radius * Math.sin(sp.phi) * Math.sin(sp.theta),
      target.y + sp.radius * Math.cos(sp.phi),
      target.z + sp.radius * Math.sin(sp.phi) * Math.cos(sp.theta)
    );
    camera.lookAt(target);
  }

  const getXY = (e) => e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
  canvas.addEventListener("mousedown", e => { dragging = true; prev = getXY(e); });
  canvas.addEventListener("touchstart", e => { dragging = true; prev = getXY(e); }, { passive: true });
  const moveHandler = e => {
    if (!dragging) return;
    const c = getXY(e);
    sp.theta -= (c.x - prev.x) * 0.005;
    sp.phi = Math.max(0.25, Math.min(1.45, sp.phi + (c.y - prev.y) * 0.005));
    prev = c; camUpdate();
  };
  canvas.addEventListener("mousemove", moveHandler);
  canvas.addEventListener("touchmove", moveHandler, { passive: true });
  const upHandler = () => { dragging = false; };
  canvas.addEventListener("mouseup", upHandler);
  canvas.addEventListener("mouseleave", upHandler);
  canvas.addEventListener("touchend", upHandler);
  canvas.addEventListener("wheel", e => { sp.radius = Math.max(10, Math.min(50, sp.radius + e.deltaY * 0.03)); camUpdate(); }, { passive: true });

  // =======================================================
  // RAYCASTING
  // =======================================================
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    for (const obj of clickables) {
      const targets = obj.type === "Group" ? obj.children : [obj];
      if (raycaster.intersectObjects(targets, true).length > 0) return obj.userData.id;
    }
    return null;
  }

  // =======================================================
  // ANIMATE
  // =======================================================
  let animId;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    fans.forEach((f, i) => { if (f) f.rotation.y += (i < 2 ? 0.05 : 0.035); });

    // Water level oscillation
    const wl = 0.7 + Math.sin(t * 0.4) * 0.1;
    waterMesh.scale.y = wl / 0.75;
    waterMesh.position.y = (tankH * wl) / 2 + 0.12;

    // Particles
    pipeSystems.forEach(sys => {
      sys.particles.forEach(p => {
        p.userData.t = (p.userData.t + sys.speed * 0.008) % 1;
        p.position.copy(sys.curve.getPoint(p.userData.t));
      });
    });

    renderer.render(scene, camera);
  }
  animate();

  return {
    handleClick,
    resize(w2, h2) { camera.aspect = w2 / h2; camera.updateProjectionMatrix(); renderer.setSize(w2, h2); },
    dispose() { cancelAnimationFrame(animId); renderer.dispose(); },
  };
}

// ============================================================
// INFO PANEL
// ============================================================
function InfoPanel({ id, onClose }) {
  if (!id) return null;
  const info = EQUIPMENT_DATA[id];
  if (!info) return null;

  return (
    <div style={{
      position: "absolute", top: 16, right: 16, width: 300,
      background: "rgba(10, 15, 30, 0.94)", backdropFilter: "blur(20px)",
      borderRadius: 14, border: `1px solid ${info.color}44`,
      boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 20px ${info.color}15`,
      animation: "panelSlide 0.35s ease", overflow: "hidden", zIndex: 100,
    }}>
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${info.color}25`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{info.icon}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{info.name}</div>
            <div style={{ fontSize: 10, color: info.color, letterSpacing: "0.04em", marginTop: 1 }}>{info.nameEn}</div>
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 26, height: 26, borderRadius: 7, border: "1px solid #334155",
          background: "#1e293b", color: "#94a3b8", cursor: "pointer", fontSize: 13,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>
      <div style={{ padding: "10px 18px 14px" }}>
        {info.params.map(([k, v], i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", padding: "7px 0",
            borderBottom: i < info.params.length - 1 ? "1px solid rgba(51,65,85,0.4)" : "none",
          }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{k}</span>
            <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function HotelEquipment3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const clickTimer = useRef(null);
  const dragMoved = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    sceneRef.current = buildScene(canvasRef.current, r.width, r.height);

    const onResize = () => {
      if (!containerRef.current) return;
      const r2 = containerRef.current.getBoundingClientRect();
      sceneRef.current?.resize(r2.width, r2.height);
    };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); sceneRef.current?.dispose(); };
  }, []);

  // Distinguish click from drag
  const onDown = () => { dragMoved.current = false; };
  const onMove = () => { dragMoved.current = true; };
  const onClick = useCallback((e) => {
    if (dragMoved.current) return;
    const id = sceneRef.current?.handleClick(e);
    setSelected(id || null);
  }, []);

  return (
    <div ref={containerRef} style={{
      width: "100%", height: "100vh", position: "relative", overflow: "hidden",
      background: "#080c18", fontFamily: "'Noto Sans SC', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;600;700&family=Outfit:wght@400;600;800&display=swap');
        @keyframes panelSlide { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      <canvas ref={canvasRef} onMouseDown={onDown} onMouseMove={onMove} onClick={onClick}
        style={{ display: "block", width: "100%", height: "100%", cursor: "grab" }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "16px 22px",
        background: "linear-gradient(to bottom, rgba(8,12,24,0.92), transparent)",
        pointerEvents: "none", zIndex: 20,
      }}>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, margin: 0,
          background: "linear-gradient(135deg, #f59e0b, #ef4444, #3b82f6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          丁山大酒店 · 设备系统3D展示
        </h1>
        <p style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
          拖拽旋转 · 滚轮缩放 · 点击设备查看详细参数
        </p>
      </div>

      {/* Quick stats */}
      <div style={{
        position: "absolute", bottom: 16, right: 16, display: "flex", gap: 6, zIndex: 30,
      }}>
        {[
          { l: "热泵", v: "2×71kW", c: "#f59e0b" },
          { l: "水箱", v: "36m³", c: "#3b82f6" },
          { l: "日产水", v: "63.7m³", c: "#f97316" },
          { l: "日用量", v: "~70m³", c: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(10,15,30,0.88)", backdropFilter: "blur(12px)",
            borderRadius: 8, border: `1px solid ${s.c}30`, padding: "6px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: 9, color: "#64748b" }}>{s.l}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.c, fontFamily: "'Outfit'" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 16, left: 16,
        background: "rgba(10,15,30,0.88)", backdropFilter: "blur(12px)",
        borderRadius: 10, border: "1px solid rgba(100,116,139,0.15)",
        padding: "10px 14px", zIndex: 30,
      }}>
        <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}>图例</div>
        {[
          { c: "#ef4444", l: "供水管路 55℃" },
          { c: "#3b82f6", l: "回水管路 44℃" },
          { c: "#f59e0b", l: "蓄热水（水箱）" },
          { c: "#22c55e", l: "新设备" },
          { c: "#ef4444", l: "老旧设备", border: true },
        ].map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 2,
              background: it.border ? "transparent" : it.c,
              border: it.border ? `1.5px solid ${it.c}` : "none",
              boxShadow: it.border ? "none" : `0 0 5px ${it.c}55`,
            }} />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{it.l}</span>
          </div>
        ))}
      </div>

      <InfoPanel id={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
