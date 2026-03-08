import { useState, useEffect, useCallback, useRef } from "react";

/* ══════════════════════ DATA ══════════════════════ */
const MODES = {
  heating: {
    label: "制热模式", icon: "🔥",
    outdoor: { temp: -5, label: "室外" },
    indoor: { temp: 22, label: "室内" },
    accent: "#F27A3A", accentDark: "#D45E1E", accentSoft: "rgba(242,122,58,0.15)", accentGlow: "rgba(242,122,58,0.35)",
    cop: "3.0 ~ 4.5", copNum: 3.8,
    meaning: "每消耗 1 度电 → 搬运 3~4.5 度电的热量到室内",
    desc: "从室外低温空气中提取热量，经压缩升温后释放到室内",
    bgTint: "rgba(242,122,58,0.03)",
  },
  cooling: {
    label: "制冷模式", icon: "❄️",
    outdoor: { temp: 35, label: "室外" },
    indoor: { temp: 24, label: "室内" },
    accent: "#4AADE8", accentDark: "#2B8AC4", accentSoft: "rgba(74,173,232,0.15)", accentGlow: "rgba(74,173,232,0.35)",
    cop: "3.5 ~ 5.5", copNum: 4.5,
    meaning: "每消耗 1 度电 → 从室内搬走 3.5~5.5 度电的热量",
    desc: "从室内吸收多余热量，通过制冷剂循环排放到室外",
    bgTint: "rgba(74,173,232,0.03)",
  },
};

const STEPS = [
  { id: 0, title: "蒸发吸热", icon: "🌡",
    heating: "室外蒸发器从低温空气中吸收热量，制冷剂由液态蒸发为气态。",
    cooling: "室内蒸发器从房间空气中吸收热量，制冷剂由液态蒸发为气态。",
    detail: "制冷剂沸点极低（约 -40°C），即使在寒冷环境中也能蒸发吸热。您家空调室外机冬天吹冷风，就是蒸发器在吸热。",
    state: "低温低压液体 → 低温低压气体" },
  { id: 1, title: "压缩升温", icon: "⚡",
    heating: "压缩机将低温低压气态制冷剂压缩为高温高压气体。",
    cooling: "压缩机将低温低压气态制冷剂压缩为高温高压气体。",
    detail: "核心部件！消耗电能做功，是「搬运热量」的动力来源。空调外机嗡嗡响的声音，就是压缩机在工作。",
    state: "低温低压气体 → 高温高压气体" },
  { id: 2, title: "冷凝放热", icon: "🔄",
    heating: "高温制冷剂在室内冷凝器中放热，将热量释放给室内空气。",
    cooling: "高温制冷剂在室外冷凝器中放热，将热量排放到室外环境。",
    detail: "制冷剂由气态重新变为液态，释放大量热量。夏天您站在空调外机旁感受到的热风，就是冷凝器在放热。",
    state: "高温高压气体 → 高温高压液体" },
  { id: 3, title: "膨胀降压", icon: "💧",
    heating: "高压液态制冷剂通过膨胀阀迅速降压降温，准备再次吸热。",
    cooling: "高压液态制冷剂通过膨胀阀迅速降压降温，准备再次吸热。",
    detail: "膨胀阀精确控制制冷剂流量，使其迅速降压降温，完成一个完整循环。",
    state: "高温高压液体 → 低温低压液体" },
];

const TYPES = [
  { name: "空气源热泵", tag: "主流", icon: "🌬",
    brief: "从空气中取热，安装灵活，应用最广泛",
    detail: "适用温度：-25°C ~ 43°C\nCOP 范围：2.8 ~ 4.5\n典型场景：居民采暖、商业建筑\n安装成本：较低，无需打井或水源",
  },
  { name: "地源热泵", tag: "高效", icon: "🌍",
    brief: "利用地下恒温层，全年效率更稳定",
    detail: "适用温度：全年稳定（地下 15°C 左右）\nCOP 范围：4.0 ~ 5.5\n典型场景：大型公建、园区供暖制冷\n安装成本：较高，需钻井埋管",
  },
  { name: "水源热泵", tag: "区域", icon: "💧",
    brief: "利用江河湖水热量，适合临水项目",
    detail: "适用温度：水温 5°C ~ 33°C\nCOP 范围：4.5 ~ 6.0\n典型场景：滨水建筑、城市集中供冷热\n安装成本：中等，需取水/回灌系统",
  },
  { name: "余热回收热泵", tag: "节能", icon: "♻️",
    brief: "回收工业废热，综合能源典型场景",
    detail: "热源温度：30°C ~ 80°C 废热\nCOP 范围：5.0 ~ 8.0\n典型场景：数据中心、工厂余热利用\n安装成本：因项目而异，节能回报高",
  },
];

/* COP vs 温度模拟数据 */
const copCurve = (outdoorTemp, isHeating) => {
  if (isHeating) return Math.max(1.5, Math.min(5.5, 3.2 + (outdoorTemp + 5) * 0.08));
  return Math.max(2.0, Math.min(7.0, 5.5 - (outdoorTemp - 25) * 0.12));
};

/* ══════════════════════ SHARED STYLES ══════════════════════ */
const FONT = "-apple-system, 'PingFang SC', 'HarmonyOS Sans SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";

const glassCard = (tint) => ({
  background: `linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))`,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  padding: "20px 18px",
  marginBottom: 14,
  ...(tint ? { boxShadow: `inset 0 0 40px ${tint}` } : {}),
});

/* ══════════════════════ CYCLE DIAGRAM ══════════════════════ */
function CycleDiagram({ mode, activeStep, onStepClick, isPlaying, compact = false }) {
  const cfg = MODES[mode];
  const [particles, setParticles] = useState([0, 0.17, 0.34, 0.51, 0.68, 0.85]);

  useEffect(() => {
    if (!isPlaying) return;
    let frame;
    const tick = () => {
      setParticles(prev => prev.map(p => (p + 0.0015) % 1));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  const W = compact ? 300 : 600, H = compact ? 240 : 380;
  const cxV = W / 2, cyV = H / 2 + 5;
  const spreadX = compact ? 80 : 180, spreadY = compact ? 72 : 130;
  const nodes = [
    { x: cxV - spreadX, y: cyV, step: 0 },
    { x: cxV, y: cyV + spreadY, step: 1 },
    { x: cxV + spreadX, y: cyV, step: 2 },
    { x: cxV, y: cyV - spreadY, step: 3 },
  ];

  const nodeLabels = [
    { label: "蒸发器", sub: mode === "heating" ? "(室外)" : "(室内)" },
    { label: "压缩机", sub: "(电驱动)" },
    { label: "冷凝器", sub: mode === "heating" ? "(室内)" : "(室外)" },
    { label: "膨胀阀", sub: "(节流)" },
  ];

  const getPos = (progress) => {
    const seg = progress * 4;
    const idx = Math.floor(seg) % 4;
    const t = seg - Math.floor(seg);
    const f = nodes[idx], to = nodes[(idx + 1) % 4];
    return { x: f.x + (to.x - f.x) * t, y: f.y + (to.y - f.y) * t, segIdx: idx };
  };

  const segColors = ["#60C0F8", "#F8B048", "#F27A3A", "#88D8F0"];
  const r = compact ? 20 : 32;
  const fs = compact ? 0.72 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <filter id={`glow_${compact}`}><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id={`nodeSh_${compact}`}><feDropShadow dx="0" dy="2" stdDeviation="5" floodColor={cfg.accent} floodOpacity="0.2" /></filter>
        <linearGradient id={`pGrad_${compact}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={cfg.accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor={cfg.accent} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Zone bg */}
      <rect x="2" y="2" width={W / 2 - 3} height={H - 4} rx="14"
        fill={mode === "heating" ? "rgba(70,140,220,0.06)" : "rgba(240,120,60,0.06)"} />
      <rect x={W / 2 + 1} y="2" width={W / 2 - 3} height={H - 4} rx="14"
        fill={mode === "heating" ? "rgba(240,120,60,0.06)" : "rgba(70,140,220,0.06)"} />
      <line x1={W / 2} y1="16" x2={W / 2} y2={H - 16} stroke="rgba(255,255,255,0.1)" strokeDasharray="5 4" />

      {!compact && <>
        <text x={W / 4} y={22} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontWeight="600">{cfg.outdoor.label} {cfg.outdoor.temp}°C</text>
        <text x={W * 3 / 4} y={22} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontWeight="600">{cfg.indoor.label} {cfg.indoor.temp}°C</text>
      </>}

      {/* Path */}
      <polygon points={nodes.map(n => `${n.x},${n.y}`).join(" ")} fill="none" stroke={`url(#pGrad_${compact})`} strokeWidth="2.5" strokeLinejoin="round" />

      {/* Arrows */}
      {nodes.map((from, i) => {
        const to = nodes[(i + 1) % 4];
        const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
        const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
        return <g key={i} transform={`translate(${mx},${my}) rotate(${angle})`}><polygon points="-5,-4 7,0 -5,4" fill={cfg.accent} opacity="0.5" /></g>;
      })}

      {/* Edge labels (full only) */}
      {!compact && [
        { x: (nodes[0].x + nodes[1].x) / 2 - 42, y: (nodes[0].y + nodes[1].y) / 2 + 8, text: "低温低压气体", color: "#70C8F8" },
        { x: (nodes[1].x + nodes[2].x) / 2 + 42, y: (nodes[1].y + nodes[2].y) / 2 + 8, text: "高温高压气体", color: "#F0905A" },
        { x: (nodes[2].x + nodes[3].x) / 2 + 42, y: (nodes[2].y + nodes[3].y) / 2 - 4, text: "高温高压液体", color: "#E08040" },
        { x: (nodes[3].x + nodes[0].x) / 2 - 42, y: (nodes[3].y + nodes[0].y) / 2 - 4, text: "低温低压液体", color: "#88CCE8" },
      ].map((el, i) => (
        <text key={i} x={el.x} y={el.y} textAnchor="middle" fontSize="10" fill={el.color} fontWeight="600">{el.text}</text>
      ))}

      {/* Particles */}
      {particles.map((p, i) => {
        const pos = getPos(p);
        return (
          <g key={i} filter={`url(#glow_${compact})`}>
            <circle cx={pos.x} cy={pos.y} r={compact ? 4 : 6} fill={segColors[pos.segIdx]} opacity="0.95">
              <animate attributeName="r" values={compact ? "3;5;3" : "4.5;7.5;4.5"} dur="1.4s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const isActive = activeStep === n.step;
        return (
          <g key={i} onClick={() => onStepClick(n.step)} style={{ cursor: "pointer" }}>
            {isActive && (
              <circle cx={n.x} cy={n.y} r={r + 10} fill="none" stroke={cfg.accent} strokeWidth="2" opacity="0.3">
                <animate attributeName="r" values={`${r + 6};${r + 16};${r + 6}`} dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={n.x} cy={n.y} r={r}
              fill={isActive ? cfg.accentSoft : "rgba(255,255,255,0.06)"}
              stroke={isActive ? cfg.accent : "rgba(255,255,255,0.15)"}
              strokeWidth={isActive ? 2.5 : 1.5}
              filter={`url(#nodeSh_${compact})`} />
            <text x={n.x} y={n.y + 2} textAnchor="middle" dominantBaseline="central" fontSize={18 * fs}>{STEPS[n.step].icon}</text>
            <text x={n.x} y={n.y + (n.step === 1 ? r + 14 * fs : n.step === 3 ? -(r + 6 * fs) : r + 14 * fs)} textAnchor="middle" fontSize={12 * fs}
              fill={isActive ? "#FFFFFF" : "rgba(255,255,255,0.7)"} fontWeight={isActive ? "700" : "500"}>{nodeLabels[i].label}</text>
            {!compact && <text x={n.x} y={n.y + (n.step === 1 ? r + 28 : n.step === 3 ? -(r - 8) : r + 28)} textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.4)">{nodeLabels[i].sub}</text>}
          </g>
        );
      })}

      {/* Electricity */}
      {!compact && <text x={cxV} y={H - 8} textAnchor="middle" fontSize="10" fill="#F0C840" fontWeight="700">⚡ 电能输入</text>}

      {/* Heat flow */}
      {!compact && <>
        <g transform={`translate(22,${cyV})`}>
          <text x="0" y="-6" textAnchor="middle" fontSize="10" fill={mode === "heating" ? "#70C8F8" : cfg.accent} fontWeight="700">吸热</text>
          <text x="0" y="10" textAnchor="middle" fontSize="15" fill={mode === "heating" ? "#70C8F8" : cfg.accent}>→</text>
        </g>
        <g transform={`translate(${W - 22},${cyV})`}>
          <text x="0" y="-6" textAnchor="middle" fontSize="10" fill={mode === "heating" ? cfg.accent : "#70C8F8"} fontWeight="700">放热</text>
          <text x="0" y="10" textAnchor="middle" fontSize="15" fill={mode === "heating" ? cfg.accent : "#70C8F8"}>←</text>
        </g>
      </>}
    </svg>
  );
}

/* ══════════════════════ COP SLIDER ══════════════════════ */
function COPSlider({ mode }) {
  const [temp, setTemp] = useState(mode === "heating" ? 0 : 35);
  const isHeating = mode === "heating";
  const cfg = MODES[mode];

  useEffect(() => {
    setTemp(isHeating ? 0 : 35);
  }, [mode, isHeating]);

  const cop = copCurve(temp, isHeating);
  const minT = isHeating ? -20 : 25;
  const maxT = isHeating ? 20 : 45;
  const pct = ((temp - minT) / (maxT - minT)) * 100;

  // Generate curve points for mini chart
  const chartW = 260, chartH = 80;
  const points = [];
  for (let t = minT; t <= maxT; t += 1) {
    const x = ((t - minT) / (maxT - minT)) * chartW;
    const c = copCurve(t, isHeating);
    const maxCOP = isHeating ? 5.5 : 7.0;
    const y = chartH - ((c - 1) / (maxCOP - 1)) * chartH;
    points.push(`${x},${y}`);
  }
  const curX = pct / 100 * chartW;
  const maxCOP = isHeating ? 5.5 : 7.0;
  const curY = chartH - ((cop - 1) / (maxCOP - 1)) * chartH;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          {isHeating ? "室外温度" : "室外温度"}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: cfg.accent }}>{cop.toFixed(1)}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>COP</span>
        </div>
      </div>

      {/* Mini chart */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <svg viewBox={`-10 -10 ${chartW + 20} ${chartH + 20}`} style={{ width: "100%", height: "auto" }}>
          <polyline points={points.join(" ")} fill="none" stroke={cfg.accent} strokeWidth="2.5" opacity="0.6" strokeLinejoin="round" />
          {/* Current point */}
          <circle cx={curX} cy={curY} r="5" fill={cfg.accent}>
            <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <line x1={curX} y1={curY} x2={curX} y2={chartH} stroke={cfg.accent} strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
          {/* Axis labels */}
          <text x="0" y={chartH + 14} fontSize="9" fill="rgba(255,255,255,0.4)">{minT}°C</text>
          <text x={chartW} y={chartH + 14} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.4)">{maxT}°C</text>
        </svg>
      </div>

      {/* Slider */}
      <div style={{ position: "relative", padding: "0 2px" }}>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${cfg.accent}80, ${cfg.accent})`, transition: "width 0.1s" }} />
        </div>
        <input type="range" min={minT} max={maxT} step={1} value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          style={{
            position: "absolute", top: -8, left: 0, width: "100%", height: 22,
            WebkitAppearance: "none", appearance: "none", background: "transparent",
            cursor: "pointer", margin: 0,
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none;
            width: 22px; height: 22px; border-radius: 50%;
            background: ${cfg.accent}; border: 3px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
        `}</style>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{minT}°C</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{temp}°C</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{maxT}°C</span>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, textAlign: "center" }}>
        {isHeating
          ? (temp < -10 ? "极寒天气下 COP 下降明显，可能需要辅助电加热"
            : temp < 5 ? "低温环境中热泵仍能保持较好的效率"
            : "室外温度越高，热泵制热效率越高")
          : (temp > 40 ? "极端高温下效率降低，室外散热困难"
            : temp > 33 ? "高温天气制冷 COP 有所下降"
            : "温和气候下制冷效率非常理想")}
      </p>
    </div>
  );
}

/* ══════════════════════ MAIN ══════════════════════ */
export default function HeatPumpVisualizer() {
  const [mode, setMode] = useState("heating");
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCompare, setShowCompare] = useState(false);
  const [expandedType, setExpandedType] = useState(null);
  const cfg = MODES[mode];

  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => setActiveStep(s => (s + 1) % 4), 4000);
    return () => clearInterval(iv);
  }, [isPlaying]);

  const handleStepClick = useCallback((idx) => { setActiveStep(idx); setIsPlaying(false); }, []);
  const step = STEPS[activeStep];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(165deg, #0C1926 0%, #142535 40%, #101D2C 100%)`,
      fontFamily: FONT,
      color: "#E0E8F0",
      padding: "0 0 env(safe-area-inset-bottom, 24px)",
      WebkitTextSizeAdjust: "100%",
      overflowX: "hidden",
    }}>
      {/* Subtle tint overlay */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: cfg.bgTint, pointerEvents: "none", transition: "background 0.8s" }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ─── Header ─── */}
        <div style={{ padding: "max(env(safe-area-inset-top, 18px), 18px) 20px 14px", textAlign: "center" }}>
          <div style={{
            display: "inline-block", padding: "4px 16px", borderRadius: 20,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 10,
          }}>
            综合能源 · 技术原理
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 6.5vw, 36px)", fontWeight: 800, margin: "0 0 6px",
            background: `linear-gradient(135deg, #FFFFFF, ${cfg.accent})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2,
          }}>
            热泵工作原理
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(12px, 3.2vw, 15px)", margin: 0, lineHeight: 1.6 }}>
            不产生热量，只搬运热量 —— 高效节能的核心逻辑
          </p>
        </div>

        {/* ─── Air Conditioner Connection Banner ─── */}
        <div style={{
          margin: "0 14px 14px", padding: "14px 16px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(240,200,64,0.1), rgba(240,200,64,0.03))",
          border: "1px solid rgba(240,200,64,0.2)",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>🏠</span>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "clamp(13px, 3.5vw, 14px)", fontWeight: 700, color: "#F0D050" }}>
              其实，您家的空调就是一台热泵
            </p>
            <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 12.5px)", lineHeight: 1.75, color: "rgba(255,255,255,0.55)" }}>
              家用空调的制冷制热原理与热泵完全一致——都是利用制冷剂循环来「搬运热量」。工业热泵只是功率更大、应用场景更广的「大号空调」。
            </p>
          </div>
        </div>

        {/* ─── Mode Toggle ─── */}
        <div style={{ display: "flex", gap: 10, margin: "0 14px 14px" }}>
          {Object.entries(MODES).map(([key, val]) => (
            <button key={key} onClick={() => { setMode(key); setActiveStep(0); setShowCompare(false); }} style={{
              flex: 1, padding: "12px 0", borderRadius: 14,
              border: mode === key ? `2px solid ${val.accent}` : "2px solid rgba(255,255,255,0.08)",
              background: mode === key ? val.accentSoft : "rgba(255,255,255,0.03)",
              color: mode === key ? val.accent : "rgba(255,255,255,0.4)",
              fontSize: "clamp(13px, 3.6vw, 15px)", fontWeight: 700, cursor: "pointer",
              transition: "all 0.35s", WebkitTapHighlightColor: "transparent",
              boxShadow: mode === key ? `0 0 20px ${val.accentGlow}` : "none",
            }}>
              {val.icon} {val.label}
            </button>
          ))}
        </div>

        {/* ─── Compare Toggle ─── */}
        <div style={{ margin: "0 14px 10px", textAlign: "center" }}>
          <button onClick={() => setShowCompare(!showCompare)} style={{
            padding: "8px 20px", borderRadius: 20,
            background: showCompare ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${showCompare ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
            color: showCompare ? "#FFFFFF" : "rgba(255,255,255,0.5)",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            WebkitTapHighlightColor: "transparent", transition: "all 0.3s",
          }}>
            {showCompare ? "✕ 关闭对比" : "⚡ 制热 vs 制冷 对比视图"}
          </button>
        </div>

        {/* ─── Compare View ─── */}
        {showCompare && (
          <div style={{ margin: "0 8px 14px", ...glassCard(), padding: "16px 10px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#FFFFFF", textAlign: "center" }}>
              制热 vs 制冷：热量流向对比
            </h3>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.6 }}>
              核心区别在于四通阀切换制冷剂流向，蒸发器与冷凝器的角色互换
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, borderRadius: 12, padding: "8px 4px", background: "rgba(242,122,58,0.06)", border: "1px solid rgba(242,122,58,0.15)" }}>
                <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#F27A3A", marginBottom: 6 }}>🔥 制热</div>
                <CycleDiagram mode="heating" activeStep={activeStep} onStepClick={handleStepClick} isPlaying={isPlaying} compact={true} />
              </div>
              <div style={{ flex: 1, borderRadius: 12, padding: "8px 4px", background: "rgba(74,173,232,0.06)", border: "1px solid rgba(74,173,232,0.15)" }}>
                <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#4AADE8", marginBottom: 6 }}>❄️ 制冷</div>
                <CycleDiagram mode="cooling" activeStep={activeStep} onStepClick={handleStepClick} isPlaying={isPlaying} compact={true} />
              </div>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.6 }}>
              注意观察：两种模式下「蒸发器」和「冷凝器」的室内外位置恰好互换。秘密就在于「四通阀」—— 它切换制冷剂的流向，让同一台设备既能制热也能制冷，您家空调也是同样的原理
            </p>
          </div>
        )}

        {/* ─── Main Diagram ─── */}
        {!showCompare && (
          <div style={{ margin: "0 8px 10px", ...glassCard(cfg.bgTint), padding: "14px 8px 10px" }}>
            <div style={{ margin: "0 8px 8px", padding: "8px 12px", borderRadius: 10, background: cfg.accentSoft, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 12.5px)", color: cfg.accent, fontWeight: 600, lineHeight: 1.5 }}>{cfg.desc}</p>
            </div>
            <CycleDiagram mode={mode} activeStep={activeStep} onStepClick={handleStepClick} isPlaying={isPlaying} />
            {/* Controls */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 8 }}>
              {STEPS.map((s, i) => (
                <button key={i} onClick={() => handleStepClick(i)} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: activeStep === i ? `2.5px solid ${cfg.accent}` : "1.5px solid rgba(255,255,255,0.12)",
                  background: activeStep === i ? cfg.accentSoft : "rgba(255,255,255,0.04)",
                  color: activeStep === i ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  WebkitTapHighlightColor: "transparent", transition: "all 0.3s",
                  boxShadow: activeStep === i ? `0 0 12px ${cfg.accentGlow}` : "none",
                }}>
                  {i + 1}
                </button>
              ))}
              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />
              <button onClick={() => setIsPlaying(!isPlaying)} style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.12)",
                background: isPlaying ? cfg.accentSoft : "rgba(255,255,255,0.04)",
                color: isPlaying ? cfg.accent : "rgba(255,255,255,0.4)",
                fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                WebkitTapHighlightColor: "transparent",
              }}>
                {isPlaying ? "⏸" : "▶"}
              </button>
            </div>
          </div>
        )}

        {/* ─── Step Detail ─── */}
        <div style={{ margin: "0 8px 12px", ...glassCard(), padding: 0, overflow: "hidden", border: `1.5px solid ${cfg.accent}40` }}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
            <div style={{
              height: "100%", width: `${((activeStep + 1) / 4) * 100}%`,
              background: `linear-gradient(90deg, ${cfg.accent}88, ${cfg.accent})`,
              borderRadius: 2, transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ padding: "16px 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{
                background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})`,
                color: "#fff", width: 30, height: 30, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, flexShrink: 0,
                boxShadow: `0 3px 10px ${cfg.accentGlow}`,
              }}>{activeStep + 1}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "clamp(15px, 4vw, 17px)", fontWeight: 700, color: "#FFFFFF" }}>{step.title}</h3>
                <span style={{ fontSize: 11, color: cfg.accent, fontWeight: 600 }}>{step.state}</span>
              </div>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: "clamp(12.5px, 3.4vw, 14px)", lineHeight: 1.85, color: "rgba(255,255,255,0.75)" }}>{step[mode]}</p>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 12.5px)", lineHeight: 1.8, color: "rgba(255,255,255,0.55)" }}>💡 {step.detail}</p>
            </div>
          </div>
        </div>

        {/* ─── COP > 1 Explainer ─── */}
        <div style={{ margin: "0 8px 12px", ...glassCard(), background: "linear-gradient(135deg, rgba(240,200,64,0.08), rgba(255,255,255,0.03))", border: "1px solid rgba(240,200,64,0.15)" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "clamp(14px, 3.8vw, 16px)", fontWeight: 800, color: "#F0D050" }}>
            🤔 为什么效率能超过 100%？
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: "clamp(12px, 3.2vw, 13px)", lineHeight: 1.9, color: "rgba(255,255,255,0.65)" }}>
            很多人第一反应：效率超过100%不违反能量守恒吗？其实并没有！关键在于热泵的「效率」衡量方式和传统设备完全不同。
          </p>

          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {/* Electric heater */}
            <div style={{
              flex: "1 1 calc(50% - 5px)", minWidth: 140,
              borderRadius: 14, padding: "14px 12px", textAlign: "center",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🔌</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>电锅炉</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.7)", flexWrap: "wrap" }}>
                <span style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 8px", fontWeight: 700 }}>1度电</span>
                <span>→</span>
                <span style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 8px", fontWeight: 700 }}>1份热</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>电能直接「转化」为热能</div>
              <div style={{ marginTop: 4, fontSize: 20, fontWeight: 900, color: "rgba(255,255,255,0.35)" }}>COP ≈ 0.9</div>
            </div>
            {/* Heat pump */}
            <div style={{
              flex: "1 1 calc(50% - 5px)", minWidth: 140,
              borderRadius: 14, padding: "14px 12px", textAlign: "center",
              background: cfg.accentSoft, border: `1.5px solid ${cfg.accent}50`,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🏭</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: cfg.accent, marginBottom: 8 }}>热泵</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 12, color: "#FFFFFF", flexWrap: "wrap" }}>
                <span style={{ background: `${cfg.accent}30`, borderRadius: 6, padding: "4px 8px", fontWeight: 700 }}>1度电</span>
                <span style={{ fontSize: 10 }}>+</span>
                <span style={{ background: `${cfg.accent}30`, borderRadius: 6, padding: "4px 6px", fontWeight: 700, fontSize: 11 }}>环境热</span>
                <span>=</span>
                <span style={{ background: `${cfg.accent}50`, borderRadius: 6, padding: "4px 8px", fontWeight: 800, color: "#FFFFFF" }}>3~4份热</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>电能「搬运」环境中的热量</div>
              <div style={{ marginTop: 4, fontSize: 20, fontWeight: 900, color: cfg.accent }}>COP ≈ {cfg.copNum}</div>
            </div>
          </div>

          {/* Analogy */}
          <div style={{ padding: "14px 14px", borderRadius: 12, background: "rgba(240,200,64,0.06)", border: "1px solid rgba(240,200,64,0.12)" }}>
            <p style={{ margin: "0 0 6px", fontSize: "clamp(12px, 3.2vw, 13px)", fontWeight: 700, color: "#F0D050" }}>🚚 通俗比喻</p>
            <p style={{ margin: "0 0 4px", fontSize: "clamp(11px, 3vw, 12.5px)", lineHeight: 1.9, color: "rgba(255,255,255,0.6)" }}>
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>电锅炉</strong>好比自己烧水 —— 花多少燃料就只能产出等量的热水。
            </p>
            <p style={{ margin: "0 0 8px", fontSize: "clamp(11px, 3vw, 12.5px)", lineHeight: 1.9, color: "rgba(255,255,255,0.6)" }}>
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>热泵</strong>好比用水泵抽水 —— 只需一点电驱动水泵，就能把大量河水搬运上山。水本身就在河里，你只花了「搬运的力气」。
            </p>
            <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 12.5px)", lineHeight: 1.9, color: "#F0D050", fontWeight: 600 }}>
              所以 COP {'>'} 1 没有违反能量守恒：输入电能 + 搬运来的环境热 = 输出总热能，能量完全守恒！
            </p>
          </div>

          {/* Policy connection */}
          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: "linear-gradient(135deg, rgba(80,200,120,0.1), rgba(80,200,120,0.03))", border: "1px solid rgba(80,200,120,0.2)", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>🌱</span>
            <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 12.5px)", lineHeight: 1.85, color: "rgba(255,255,255,0.6)" }}>
              <strong style={{ color: "#60D88A" }}>这也是国家大力推广热泵替代燃煤锅炉的核心原因</strong> —— 同样供暖面积，热泵的碳排放比燃煤锅炉降低 60%~70%，是实现「双碳目标」的关键技术路径之一。
            </p>
          </div>
        </div>

        {/* ─── COP Slider ─── */}
        <div style={{ margin: "0 8px 12px", ...glassCard(cfg.bgTint) }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "clamp(14px, 3.8vw, 16px)", fontWeight: 700, color: "#FFFFFF" }}>
            🎛️ COP 模拟器
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            拖动滑块改变室外温度，观察 COP 如何变化
          </p>
          <COPSlider mode={mode} />
        </div>

        {/* ─── COP Comparison Bars ─── */}
        <div style={{ margin: "0 8px 12px", ...glassCard() }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "clamp(14px, 3.8vw, 16px)", fontWeight: 700, color: "#FFFFFF" }}>📊 能效对比</h3>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "家用空调", cop: "3.0~4.0", icon: "🏠" },
              { label: "商用热泵", cop: "3.5~5.0", icon: "🏢" },
              { label: "地源热泵", cop: "4.5~6.0", icon: "🌍" },
            ].map((item, i) => (
              <div key={i} style={{
                flex: "1 1 90px", textAlign: "center", padding: "12px 8px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 22 }}>{item.icon}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: cfg.accent, marginTop: 2 }}>{item.cop}</div>
              </div>
            ))}
          </div>

          {[
            { name: "电锅炉", cop: "0.9", pct: 16, color: "rgba(255,255,255,0.2)" },
            { name: "燃气锅炉", cop: "0.85", pct: 15, color: "#A08460" },
            { name: "家用空调(热泵)", cop: "~3.5", pct: 64, color: cfg.accent, bold: false, mid: true },
            { name: "工业热泵", cop: cfg.cop, pct: 90, color: cfg.accent, bold: true },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: i < 3 ? 10 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: item.bold ? cfg.accent : item.mid ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: item.bold ? 700 : 500 }}>
                <span>{item.name}</span><span>COP ≈ {item.cop}</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  width: `${item.pct}%`, height: "100%", borderRadius: 5,
                  background: item.bold ? `linear-gradient(90deg, ${cfg.accent}88, ${cfg.accent})` : item.mid ? `${cfg.accent}60` : item.color,
                  transition: "width 0.8s ease",
                  boxShadow: item.bold ? `0 0 12px ${cfg.accentGlow}` : "none",
                }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: cfg.accentSoft, border: `1px solid ${cfg.accent}30` }}>
            <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 13px)", lineHeight: 1.6, color: cfg.accent, fontWeight: 600, textAlign: "center" }}>{cfg.meaning}</p>
          </div>
        </div>

        {/* ─── Types Accordion ─── */}
        <div style={{ margin: "0 8px 12px", ...glassCard() }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "clamp(14px, 3.8vw, 16px)", fontWeight: 700, color: "#FFFFFF" }}>🏷️ 热泵类型一览</h3>
          <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>点击展开查看详细信息</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TYPES.map((t, i) => {
              const isOpen = expandedType === i;
              return (
                <div key={i}
                  onClick={() => setExpandedType(isOpen ? null : i)}
                  style={{
                    borderRadius: 14,
                    background: isOpen ? cfg.accentSoft : "rgba(255,255,255,0.04)",
                    border: isOpen ? `1.5px solid ${cfg.accent}40` : "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden", cursor: "pointer",
                    transition: "all 0.3s",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                    <span style={{
                      fontSize: 22, width: 40, height: 40,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0,
                    }}>{t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{t.name}</span>
                        <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 6, background: cfg.accentSoft, color: cfg.accent, fontWeight: 700 }}>{t.tag}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{t.brief}</p>
                    </div>
                    <span style={{
                      fontSize: 14, color: "rgba(255,255,255,0.3)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s", flexShrink: 0,
                    }}>▼</span>
                  </div>
                  {isOpen && (
                    <div style={{
                      padding: "0 14px 14px 66px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <p style={{ margin: "10px 0 0", fontSize: 12, lineHeight: 2, color: "rgba(255,255,255,0.6)", whiteSpace: "pre-line" }}>{t.detail}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Key Insight ─── */}
        <div style={{
          margin: "0 8px 14px", ...glassCard(),
          background: `linear-gradient(135deg, ${cfg.accentSoft}, rgba(255,255,255,0.03))`,
          border: `2px solid ${cfg.accent}30`,
          textAlign: "center", padding: "24px 18px",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", border: `2.5px solid ${cfg.accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 14px",
            boxShadow: `0 0 24px ${cfg.accentGlow}`,
          }}>💡</div>
          <p style={{ margin: "0 0 8px", fontSize: "clamp(17px, 4.5vw, 20px)", fontWeight: 800, color: "#FFFFFF" }}>热泵 = 热量搬运工</p>
          <p style={{ margin: 0, fontSize: "clamp(12px, 3.2vw, 13.5px)", lineHeight: 1.9, color: "rgba(255,255,255,0.6)" }}>
            不像电锅炉把电能转化为热能（效率 ≤ 100%），热泵用少量电能驱动压缩机，将环境中的免费热量「搬运」到目标空间，实现{" "}
            <strong style={{ color: cfg.accent, fontSize: "1.15em" }}>300% ~ 450%</strong>{" "}
            的等效效率。这正是综合能源体系中热泵被视为核心设备的原因。
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "6px 16px 28px", fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
          点击图中组件或步骤按钮暂停查看 · 点击播放键恢复演示 · 拖动滑块体验 COP 变化
        </div>
      </div>
    </div>
  );
}
