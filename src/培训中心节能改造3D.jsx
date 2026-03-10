import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// ── Data ──
const plans = [
  { id: "chongshi", label: "崇实楼", floors: 25, rooms: "~1000间客房", occupancy: "60%+", color: "#22d3ee", emissive: "#0e7490",
    current: ["市政蒸汽供热（190元/吨）", "4台特灵螺杆机246KW制冷", "已采用冰蓄冷技术", "供暖50°C / 热水53°C"],
    plan: ["热泵替代蒸汽制取生活热水", "热泵替代蒸汽制取采暖热水", "保留冰蓄冷制冷系统"],
    painPoints: ["蒸汽外购成本高昂"],
  },
  { id: "xueyuan1", label: "学员楼A", floors: 6, rooms: "120间", occupancy: "85%", color: "#f59e0b", emissive: "#92400e",
    current: ["分体空调供冷", "太阳能集热器+电加热器"],
    plan: ["新增空气源热泵制取热水", "替代电加热器"],
    painPoints: ["太阳能漏水", "电加热器损坏"],
  },
  { id: "xueyuan2", label: "学员楼B", floors: 6, rooms: "120间", occupancy: "85%", color: "#fb923c", emissive: "#9a3412",
    current: ["分体空调供冷", "太阳能集热器+电加热器"],
    plan: ["新增空气源热泵制取热水", "替代电加热器"],
    painPoints: ["太阳能漏水", "电加热器损坏"],
  },
  { id: "xueyuan3", label: "学员楼C", floors: 6, rooms: "120间", occupancy: "85%", color: "#34d399", emissive: "#065f46",
    current: ["分体空调供冷", "太阳能集热器+电加热器"],
    plan: ["拆除太阳能集热器", "新增屋顶光伏发电系统", "光伏驱动热泵制取热水", "形成「光、蓄供热系统」"],
    painPoints: ["太阳能漏水", "电加热器损坏"],
    special: true,
  },
  { id: "canteen", label: "食堂", floors: 2, rooms: "餐饮服务", occupancy: "—", color: "#a78bfa", emissive: "#4c1d95",
    current: ["外购蒸汽制取热水（190元/吨）"],
    plan: ["热泵替代蒸汽制取生活热水"],
    painPoints: ["蒸汽成本高"],
  },
];

// ── 3D Scene ──
function Scene3D({ selected, onSelect }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const frameRef = useRef(0);
  const hoveredRef = useRef(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const buildingMeshes = useRef([]);

  const createBuilding = useCallback((scene, x, z, floors, color, emissive, id, isSpecial) => {
    const group = new THREE.Group();
    const w = id === "chongshi" ? 2.6 : id === "canteen" ? 2.8 : 1.6;
    const d = id === "chongshi" ? 2.2 : id === "canteen" ? 1.8 : 1.4;
    const h = floors * 0.38;

    // Main body
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color).multiplyScalar(0.35),
      emissive: new THREE.Color(emissive).multiplyScalar(0.15),
      specular: new THREE.Color(0x222244),
      shininess: 60,
      transparent: true,
      opacity: 0.88,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { id, baseColor: color, emissive };
    group.add(mesh);

    // Window grid (lines)
    const edgesColor = new THREE.Color(color).multiplyScalar(0.5);
    for (let i = 1; i < floors; i++) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-w / 2 - 0.01, i * 0.38, d / 2 + 0.01),
        new THREE.Vector3(w / 2 + 0.01, i * 0.38, d / 2 + 0.01),
      ]);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: edgesColor, transparent: true, opacity: 0.25 }));
      group.add(line);
    }

    // Roof accent
    const roofGeo = new THREE.BoxGeometry(w + 0.1, 0.08, d + 0.1);
    const roofMat = new THREE.MeshPhongMaterial({ color, emissive: new THREE.Color(emissive).multiplyScalar(0.3) });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + 0.04;
    group.add(roof);

    // Solar panels / PV on special building
    if (isSpecial) {
      for (let px = -0.5; px <= 0.5; px += 0.5) {
        for (let pz = -0.4; pz <= 0.4; pz += 0.4) {
          const panelGeo = new THREE.BoxGeometry(0.35, 0.03, 0.28);
          const panelMat = new THREE.MeshPhongMaterial({ color: 0x1a5276, emissive: 0x0a2a3f, specular: 0x4488aa, shininess: 100 });
          const panel = new THREE.Mesh(panelGeo, panelMat);
          panel.position.set(px, h + 0.12, pz);
          panel.rotation.x = -0.15;
          group.add(panel);
        }
      }
    }

    // Glow ring at base
    const ringGeo = new THREE.RingGeometry(Math.max(w, d) * 0.7, Math.max(w, d) * 0.75, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    group.position.set(x, 0, z);
    scene.add(group);

    return { mesh, group, id, mat, ring: ringMat };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c18, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
    camera.position.set(14, 12, 16);
    camera.lookAt(0, 2.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x0c1225, specular: 0x111828 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(30, 30, 0x1a2744, 0x111d33);
    grid.position.y = 0.01;
    scene.add(grid);

    // Lights
    const ambient = new THREE.AmbientLight(0x8899bb, 0.5);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffeedd, 0.9);
    dir.position.set(8, 15, 10);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 40;
    dir.shadow.camera.left = -15;
    dir.shadow.camera.right = 15;
    dir.shadow.camera.top = 15;
    dir.shadow.camera.bottom = -15;
    scene.add(dir);

    const point1 = new THREE.PointLight(0x22d3ee, 0.4, 25);
    point1.position.set(-5, 8, 5);
    scene.add(point1);

    const point2 = new THREE.PointLight(0xf59e0b, 0.3, 20);
    point2.position.set(6, 6, -4);
    scene.add(point2);

    // Buildings
    const meshes = [];
    meshes.push(createBuilding(scene, 0, 0, 25, "#22d3ee", "#0e7490", "chongshi", false));
    meshes.push(createBuilding(scene, -5.5, 2, 6, "#f59e0b", "#92400e", "xueyuan1", false));
    meshes.push(createBuilding(scene, -5.5, -1.2, 6, "#fb923c", "#9a3412", "xueyuan2", false));
    meshes.push(createBuilding(scene, -5.5, -4.4, 6, "#34d399", "#065f46", "xueyuan3", true));
    meshes.push(createBuilding(scene, 5, -2, 2, "#a78bfa", "#4c1d95", "canteen", false));
    buildingMeshes.current = meshes;

    // Particles
    const particleCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 30;
      pPositions[i * 3 + 1] = Math.random() * 15 + 1;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.06, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    sceneRef.current = { scene, camera, renderer, particles, ground };

    // Mouse
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      if (hoveredRef.current) {
        onSelect(hoveredRef.current);
      }
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", onClick);

    // Animate
    let angle = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      angle += 0.002;

      camera.position.x = 18 * Math.cos(angle);
      camera.position.z = 18 * Math.sin(angle);
      camera.position.y = 11 + Math.sin(angle * 0.5) * 1.5;
      camera.lookAt(0, 2.5, 0);

      // Particles drift
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += 0.005;
        if (pos[i * 3 + 1] > 16) pos[i * 3 + 1] = 1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Raycasting
      raycaster.current.setFromCamera(mouse.current, camera);
      const allMesh = meshes.map((m) => m.mesh);
      const intersects = raycaster.current.intersectObjects(allMesh);

      let newHovered = null;
      meshes.forEach((m) => {
        const isHit = intersects.length > 0 && intersects[0].object === m.mesh;
        if (isHit) newHovered = m.id;
        const isSelected = selected === m.id;
        const brightness = isHit || isSelected ? 0.6 : 0.35;
        const emBrightness = isHit || isSelected ? 0.4 : 0.15;
        const targetOpacity = isHit || isSelected ? 1.0 : 0.88;

        m.mat.color.lerp(new THREE.Color(m.mesh.userData.baseColor).multiplyScalar(brightness), 0.1);
        m.mat.emissive.lerp(new THREE.Color(m.mesh.userData.emissive).multiplyScalar(emBrightness), 0.1);
        m.mat.opacity += (targetOpacity - m.mat.opacity) * 0.1;
        m.ring.opacity += ((isHit || isSelected ? 0.35 : 0.15) - m.ring.opacity) * 0.1;

        const scaleTarget = isHit || isSelected ? 1.03 : 1.0;
        m.group.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), 0.08);
      });
      hoveredRef.current = newHovered;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selected, onSelect, createBuilding]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "pointer" }} />;
}

// ── Info Panel ──
function InfoPanel({ building, onClose }) {
  if (!building) return null;
  const b = plans.find((p) => p.id === building);
  if (!b) return null;

  return (
    <div style={{
      position: "absolute", top: 20, right: 20, width: 340, maxHeight: "calc(100% - 40px)", overflowY: "auto",
      background: "rgba(15,23,42,0.92)", backdropFilter: "blur(16px)", border: `1px solid ${b.color}33`,
      borderRadius: 16, padding: 24, zIndex: 10,
      animation: "slideIn 0.35s ease-out",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: b.color }}>{b.label}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{b.floors}层 · {b.rooms} · 入住率{b.occupancy}</div>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", width: 30, height: 30,
          borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {/* Pain points */}
      {b.painPoints.length > 0 && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 6, letterSpacing: 1 }}>⚠ 问题</div>
          {b.painPoints.map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.7 }}>• {p}</div>
          ))}
        </div>
      )}

      {/* Current */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, letterSpacing: 1 }}>现状</div>
        {b.current.map((c, i) => (
          <div key={i} style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, paddingLeft: 12, position: "relative" }}>
            <span style={{ position: "absolute", left: 0, color: "#475569" }}>›</span>{c}
          </div>
        ))}
      </div>

      {/* Plan */}
      <div style={{ background: `${b.color}0d`, border: `1px solid ${b.color}25`, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: b.color, marginBottom: 8, letterSpacing: 1 }}>✦ 改造方案</div>
        {b.plan.map((p, i) => (
          <div key={i} style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.8, paddingLeft: 12, position: "relative" }}>
            <span style={{ position: "absolute", left: 0, color: b.color }}>→</span>{p}
          </div>
        ))}
      </div>

      {b.special && (
        <div style={{
          marginTop: 14, background: "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(34,211,238,0.05))",
          border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10, padding: "10px 14px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#34d399", marginBottom: 4 }}>☀ 亮点工程</div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65 }}>
            屋顶光伏发电驱动热泵，实现「光、蓄供热系统」，零碳热水供应示范楼
          </div>
        </div>
      )}
    </div>
  );
}

// ── Legend ──
function Legend({ selected, onSelect }) {
  return (
    <div style={{
      position: "absolute", bottom: 20, left: 20, right: 20, display: "flex", gap: 8,
      justifyContent: "center", flexWrap: "wrap", zIndex: 10,
    }}>
      {plans.map((b) => (
        <button key={b.id} onClick={() => onSelect(selected === b.id ? null : b.id)}
          style={{
            background: selected === b.id ? `${b.color}22` : "rgba(15,23,42,0.8)",
            border: `1px solid ${selected === b.id ? b.color + "55" : "#1e293b"}`,
            borderRadius: 10, padding: "8px 16px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(8px)",
            transition: "all 0.25s",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, display: "inline-block", boxShadow: `0 0 8px ${b.color}44` }} />
          <span style={{ fontSize: 13, fontWeight: selected === b.id ? 600 : 400, color: selected === b.id ? b.color : "#94a3b8" }}>{b.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main ──
export default function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#080c18", position: "relative", overflow: "hidden", fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif" }}>
      {/* Title */}
      <div style={{
        position: "absolute", top: 20, left: 24, zIndex: 10, pointerEvents: "none",
      }}>
        <div style={{
          display: "inline-block", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)",
          color: "#22d3ee", fontSize: 11, fontWeight: 500, padding: "4px 14px", borderRadius: 14, letterSpacing: 2, marginBottom: 10,
        }}>
          连云港供电公司 · 培训中心
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 900, lineHeight: 1.3, margin: 0,
          background: "linear-gradient(135deg, #f8fafc, #64748b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          节能改造 3D 总览
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>点击建筑查看详情 · 场景自动旋转</p>
      </div>

      {/* 3D Scene */}
      <Scene3D selected={selected} onSelect={setSelected} />

      {/* Info Panel */}
      <InfoPanel building={selected} onClose={() => setSelected(null)} />

      {/* Legend */}
      <Legend selected={selected} onSelect={setSelected} />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
