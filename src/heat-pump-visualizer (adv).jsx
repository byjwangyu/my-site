import { useState, useEffect, useCallback } from "react";

/* ───── Data ───── */
const MODES = {
  heating: {
    label: "制热模式", icon: "🔥",
    outdoor: { temp: -5, label: "室外", desc: "低温环境" },
    indoor: { temp: 22, label: "室内", desc: "温暖舒适" },
    accent: "#E05A33", accentSoft: "#FDEAE5", accentMid: "#F4A08A",
    gradBg: "linear-gradient(180deg, #FFF7F4 0%, #FFFFFF 30%, #FFFAF8 100%)",
    cop: "3.0 ~ 4.5",
    meaning: "每消耗 1 度电 → 搬运 3~4.5 度电的热量到室内",
    desc: "从室外低温空气中提取热量，经压缩升温后释放到室内",
  },
  cooling: {
    label: "制冷模式", icon: "❄️",
    outdoor: { temp: 35, label: "室外", desc: "高温酷暑" },
    indoor: { temp: 24, label: "室内", desc: "清凉宜人" },
    accent: "#2B7EC1", accentSoft: "#E6F1FA", accentMid: "#8EC4E8",
    gradBg: "linear-gradient(180deg, #F2F8FD 0%, #FFFFFF 30%, #F6FAFD 100%)",
    cop: "3.5 ~ 5.5",
    meaning: "每消耗 1 度电 → 从室内搬走 3.5~5.5 度电的热量",
    desc: "从室内吸收多余热量，通过制冷剂循环排放到室外",
  },
};

const STEPS = [
  { id: 0, title: "蒸发吸热", icon: "🌡",
    heating: "室外蒸发器从低温空气中吸收热量\n制冷剂由液态 → 气态",
    cooling: "室内蒸发器从房间空气中吸收热量\n制冷剂由液态 → 气态",
    detail: "制冷剂沸点极低（约 -40°C），即使在寒冷环境中也能蒸发吸热",
    state: "低温低压液体 → 低温低压气体" },
  { id: 1, title: "压缩升温", icon: "⚡",
    heating: "压缩机将低温低压气态制冷剂\n压缩为高温高压气体",
    cooling: "压缩机将低温低压气态制冷剂\n压缩为高温高压气体",
    detail: "核心部件！消耗电能做功，是「搬运热量」的动力来源",
    state: "低温低压气体 → 高温高压气体" },
  { id: 2, title: "冷凝放热", icon: "🔄",
    heating: "高温制冷剂在室内冷凝器中放热\n将热量释放给室内空气",
    cooling: "高温制冷剂在室外冷凝器中放热\n将热量排放到室外环境",
    detail: "制冷剂由气态重新变为液态，释放大量热量",
    state: "高温高压气体 → 高温高压液体" },
  { id: 3, title: "膨胀降压", icon: "💧",
    heating: "高压液态制冷剂通过膨胀阀\n迅速降压降温，准备再次吸热",
    cooling: "高压液态制冷剂通过膨胀阀\n迅速降压降温，准备再次吸热",
    detail: "膨胀阀精确控制制冷剂流量，完成一个完整循环",
    state: "高温高压液体 → 低温低压液体" },
];

const TYPES = [
  { name: "空气源热泵", tag: "主流", desc: "从空气中取热，安装灵活，应用最广泛", icon: "🌬" },
  { name: "地源热泵", tag: "高效", desc: "利用地下恒温层，全年效率更稳定", icon: "🌍" },
  { name: "水源热泵", tag: "区域", desc: "利用江河湖水热量，适合临水项目", icon: "💧" },
  { name: "余热回收热泵", tag: "节能", desc: "回收工业废热，综合能源典型场景", icon: "♻️" },
];

/* ───── Animated SVG Diagram ───── */
function CycleDiagram({ mode, activeStep, onStepClick, isPlaying }) {
  const cfg = MODES[mode];
  const [particles, setParticles] = useState([0, 0.2, 0.4, 0.6, 0.8]);

  useEffect(() => {
    if (!isPlaying) return;
    let frame;
    const tick = () => {
      setParticles(prev => prev.map(p => (p + 0.004) % 1));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  const W = 340, H = 300;
  const cx = W / 2, cy = H / 2;
  const nodes = [
    { x: 50, y: cy, label: mode === "heating" ? "蒸发器" : "蒸发器", sub: mode === "heating" ? "（室外）" : "（室内）", step: 0 },
    { x: cx, y: H - 36, label: "压缩机", sub: "（电驱动）", step: 1 },
    { x: W - 50, y: cy, label: "冷凝器", sub: mode === "heating" ? "（室内）" : "（室外）", step: 2 },
    { x: cx, y: 36, label: "膨胀阀", sub: "（节流）", step: 3 },
  ];

  const getPos = (progress) => {
    const seg = progress * 4;
    const idx = Math.floor(seg) % 4;
    const t = seg - Math.floor(seg);
    const from = nodes[idx];
    const to = nodes[(idx + 1) % 4];
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      segIdx: idx,
    };
  };

  const segColors = ["#60B4F0", "#F0933A", "#E05A33", "#8ECAE6"];

  const edgeLabels = [
    { x: (nodes[0].x + nodes[1].x) / 2 - 24, y: (nodes[0].y + nodes[1].y) / 2 + 5, text: "低温气体", color: "#5FADD6" },
    { x: (nodes[1].x + nodes[2].x) / 2 + 24, y: (nodes[1].y + nodes[2].y) / 2 + 5, text: "高温气体", color: "#E0764A" },
    { x: (nodes[2].x + nodes[3].x) / 2 + 24, y: (nodes[2].y + nodes[3].y) / 2 - 1, text: "高温液体", color: "#D4783C" },
    { x: (nodes[3].x + nodes[0].x) / 2 - 24, y: (nodes[3].y + nodes[0].y) / 2 - 1, text: "低温液体", color: "#8EBFD6" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="cardShadow">
          <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor="#000" floodOpacity="0.06" />
        </filter>
        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={cfg.accentMid} stopOpacity="0.6" />
          <stop offset="100%" stopColor={cfg.accent} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Background zones with subtle gradients */}
      <rect x="2" y="2" width={W / 2 - 4} height={H - 4} rx="14" fill={mode === "heating" ? "#EEF4FA" : "#FEF5EF"} opacity="0.6" />
      <rect x={W / 2 + 2} y="2" width={W / 2 - 4} height={H - 4} rx="14" fill={mode === "heating" ? "#FEF5EF" : "#EEF4FA"} opacity="0.6" />
      <line x1={W / 2} y1="16" x2={W / 2} y2={H - 16} stroke="#D6DCE3" strokeDasharray="3 3" strokeWidth="0.8" />

      {/* Zone labels */}
      <text x={W / 4} y={18} textAnchor="middle" fontSize="9" fill="#99A8B6" fontWeight="600">{cfg.outdoor.label} {cfg.outdoor.temp}°C</text>
      <text x={W * 3 / 4} y={18} textAnchor="middle" fontSize="9" fill="#99A8B6" fontWeight="600">{cfg.indoor.label} {cfg.indoor.temp}°C</text>

      {/* Cycle path */}
      <polygon points={nodes.map(n => `${n.x},${n.y}`).join(" ")} fill="none" stroke="url(#pathGrad)" strokeWidth="2.2" strokeLinejoin="round" />

      {/* Direction arrows */}
      {nodes.map((from, i) => {
        const to = nodes[(i + 1) % 4];
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
        return (
          <g key={`arr${i}`} transform={`translate(${mx},${my}) rotate(${angle})`}>
            <polygon points="-4.5,-3.5 5,0 -4.5,3.5" fill={cfg.accent} opacity="0.4" />
          </g>
        );
      })}

      {/* Edge state labels */}
      {edgeLabels.map((el, i) => (
        <text key={`el${i}`} x={el.x} y={el.y} textAnchor="middle" fontSize="7.5" fill={el.color} fontWeight="600" opacity="0.8">{el.text}</text>
      ))}

      {/* Particles */}
      {particles.map((p, i) => {
        const pos = getPos(p);
        const col = segColors[pos.segIdx];
        return (
          <g key={`p${i}`} filter="url(#nodeGlow)">
            <circle cx={pos.x} cy={pos.y} r={4} fill={col} opacity="0.9">
              <animate attributeName="r" values="3;5.5;3" dur="0.9s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}

      {/* Component nodes */}
      {nodes.map((n, i) => {
        const isActive = activeStep === n.step;
        const r = 24;
        return (
          <g key={`node${i}`} onClick={() => onStepClick(n.step)} style={{ cursor: "pointer" }}>
            {isActive && (
              <circle cx={n.x} cy={n.y} r={r + 6} fill="none" stroke={cfg.accent} strokeWidth="1.5" opacity="0.25">
                <animate attributeName="r" values={`${r + 4};${r + 11};${r + 4}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.06;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={n.x} cy={n.y} r={r} fill={isActive ? cfg.accentSoft : "#FFFFFF"} stroke={isActive ? cfg.accent : "#D6DCE3"} strokeWidth={isActive ? 2 : 1.2} filter="url(#cardShadow)" />
            <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="15">{STEPS[n.step].icon}</text>
            <text x={n.x} y={n.y + (n.step === 1 ? r + 13 : n.step === 3 ? -(r + 6) : r + 13)} textAnchor="middle" fontSize="10" fill={isActive ? cfg.accent : "#5A6B7C"} fontWeight={isActive ? "700" : "500"}>{n.label}</text>
            <text x={n.x} y={n.y + (n.step === 1 ? r + 24 : n.step === 3 ? -(r - 5) : r + 24)} textAnchor="middle" fontSize="7.5" fill="#A0ADB8">{n.sub}</text>
          </g>
        );
      })}

      {/* Electricity input */}
      <g transform={`translate(${cx},${H - 8})`}>
        <text x="0" y="0" textAnchor="middle" fontSize="8" fill="#C49B20" fontWeight="700">⚡ 电能输入</text>
      </g>

      {/* Heat flow arrows */}
      <g transform={`translate(14,${cy})`}>
        <text x="0" y="-5" textAnchor="middle" fontSize="7.5" fill={mode === "heating" ? "#5FADD6" : cfg.accent} fontWeight="600">吸热</text>
        <text x="0" y="7" textAnchor="middle" fontSize="11" fill={mode === "heating" ? "#5FADD6" : cfg.accent}>→</text>
      </g>
      <g transform={`translate(${W - 14},${cy})`}>
        <text x="0" y="-5" textAnchor="middle" fontSize="7.5" fill={mode === "heating" ? cfg.accent : "#5FADD6"} fontWeight="600">放热</text>
        <text x="0" y="7" textAnchor="middle" fontSize="11" fill={mode === "heating" ? cfg.accent : "#5FADD6"}>←</text>
      </g>
    </svg>
  );
}

/* ───── Main Component ───── */
export default function HeatPumpVisualizer() {
  const [mode, setMode] = useState("heating");
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const cfg = MODES[mode];

  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => setActiveStep(s => (s + 1) % 4), 3200);
    return () => clearInterval(iv);
  }, [isPlaying]);

  const handleStepClick = useCallback((idx) => {
    setActiveStep(idx);
    setIsPlaying(false);
  }, []);

  const step = STEPS[activeStep];

  const card = {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #EDF0F4",
    boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.02)",
    padding: "18px 16px",
    marginBottom: 12,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: cfg.gradBg,
      fontFamily: "-apple-system, 'PingFang SC', 'Noto Sans SC', 'HarmonyOS Sans SC', 'Microsoft YaHei', sans-serif",
      color: "#2C3E50",
      padding: "0",
      WebkitTextSizeAdjust: "100%",
      WebkitOverflowScrolling: "touch",
      maxWidth: 420,
      margin: "0 auto",
      transition: "background 0.5s ease",
      overflowX: "hidden",
    }}>

      {/* Header */}
      <div style={{ padding: "max(env(safe-area-inset-top, 12px), 12px) 16px 12px", textAlign: "center" }}>
        <div style={{
          display: "inline-block", padding: "3px 12px", borderRadius: 16,
          background: cfg.accentSoft, fontSize: 10, letterSpacing: 1.5,
          color: cfg.accent, fontWeight: 700, marginBottom: 8,
        }}>
          综合能源 · 技术原理
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", color: "#1A2B3C", letterSpacing: 1 }}>
          热泵工作原理
        </h1>
        <p style={{ color: "#8899AA", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
          不产生热量，只搬运热量 —— 高效节能的核心逻辑
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: 8, margin: "0 12px 12px" }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button key={key} onClick={() => { setMode(key); setActiveStep(0); }} style={{
            flex: 1, padding: "10px 0", borderRadius: 12,
            border: mode === key ? `2px solid ${val.accent}` : "2px solid #E8ECF0",
            background: mode === key ? val.accentSoft : "#FAFBFC",
            color: mode === key ? val.accent : "#8899AA",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            transition: "all 0.3s",
            WebkitTapHighlightColor: "transparent",
          }}>
            {val.icon} {val.label}
          </button>
        ))}
      </div>

      {/* Desc banner */}
      <div style={{ margin: "0 12px 10px", padding: "8px 12px", borderRadius: 10, background: cfg.accentSoft, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 11, color: cfg.accent, fontWeight: 500, lineHeight: 1.5 }}>{cfg.desc}</p>
      </div>

      {/* Diagram */}
      <div style={{ margin: "0 8px 10px", ...card, padding: "12px 6px 6px" }}>
        <CycleDiagram mode={mode} activeStep={activeStep} onStepClick={handleStepClick} isPlaying={isPlaying} />

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 6 }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => handleStepClick(i)} style={{
              width: 32, height: 32, borderRadius: "50%",
              border: activeStep === i ? `2px solid ${cfg.accent}` : "1.5px solid #DEE3E8",
              background: activeStep === i ? cfg.accentSoft : "#FAFBFC",
              color: activeStep === i ? cfg.accent : "#8899AA",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              WebkitTapHighlightColor: "transparent", transition: "all 0.25s",
            }}>
              {i + 1}
            </button>
          ))}
          <div style={{ width: 1, height: 18, background: "#E8ECF0", margin: "0 1px" }} />
          <button onClick={() => setIsPlaying(!isPlaying)} style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "1.5px solid #DEE3E8",
            background: isPlaying ? cfg.accentSoft : "#FAFBFC",
            color: isPlaying ? cfg.accent : "#8899AA",
            fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
          }}>
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>
      </div>

      {/* Step detail */}
      <div style={{ margin: "0 8px 10px", ...card, padding: 0, overflow: "hidden", border: `1.5px solid ${cfg.accent}30` }}>
        <div style={{ height: 3, background: "#F0F2F5" }}>
          <div style={{
            height: "100%", width: `${((activeStep + 1) / 4) * 100}%`,
            background: `linear-gradient(90deg, ${cfg.accentMid}, ${cfg.accent})`,
            borderRadius: 2, transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ padding: "14px 14px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{
              background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentMid})`,
              color: "#fff", width: 26, height: 26, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, flexShrink: 0,
              boxShadow: `0 2px 6px ${cfg.accent}35`,
            }}>
              {activeStep + 1}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1A2B3C" }}>{step.title}</h3>
              <span style={{ fontSize: 10, color: cfg.accent, fontWeight: 600 }}>{step.state}</span>
            </div>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.8, color: "#4A5B6C", whiteSpace: "pre-line" }}>
            {step[mode]}
          </p>
          <div style={{ padding: "8px 10px", borderRadius: 8, background: "#F7F9FB", border: "1px solid #EEF1F5" }}>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.7, color: "#6B7C8D" }}>💡 {step.detail}</p>
          </div>
        </div>
      </div>

      {/* COP */}
      <div style={{ margin: "0 8px 10px", ...card }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#1A2B3C" }}>📊 能效比（COP）</h3>

        <div style={{
          textAlign: "center", padding: "14px 0 16px", borderRadius: 12,
          background: `linear-gradient(135deg, ${cfg.accentSoft}, #FFFFFF)`,
          marginBottom: 14, border: `1px solid ${cfg.accent}15`,
        }}>
          <div style={{
            fontSize: 34, fontWeight: 900,
            background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentMid})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {cfg.cop}
          </div>
          <div style={{ fontSize: 10, color: "#8899AA", marginTop: 2, fontWeight: 500 }}>COP 系数范围</div>
        </div>

        {[
          { name: "电锅炉", cop: "0.9", pct: 20, color: "#B0BBC6" },
          { name: "燃气锅炉", cop: "0.85", pct: 19, color: "#C9A87C" },
          { name: "热泵", cop: cfg.cop, pct: 90, color: cfg.accent, bold: true },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: i < 2 ? 8 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: item.bold ? cfg.accent : "#7A8FA0", marginBottom: 4, fontWeight: item.bold ? 700 : 400 }}>
              <span>{item.name}</span><span>COP ≈ {item.cop}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#F0F2F5", overflow: "hidden" }}>
              <div style={{
                width: `${item.pct}%`, height: "100%", borderRadius: 4,
                background: item.bold ? `linear-gradient(90deg, ${cfg.accentMid}, ${cfg.accent})` : item.color,
                transition: "width 0.8s ease",
                boxShadow: item.bold ? `0 2px 6px ${cfg.accent}28` : "none",
              }} />
            </div>
          </div>
        ))}

        <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 8, background: cfg.accentSoft, border: `1px solid ${cfg.accent}12` }}>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: cfg.accent, fontWeight: 600, textAlign: "center" }}>{cfg.meaning}</p>
        </div>
      </div>

      {/* Types */}
      <div style={{ margin: "0 8px 10px", ...card }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#1A2B3C" }}>🏷️ 热泵类型一览</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TYPES.map((t, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              background: "#F8FAFB", border: "1px solid #EEF1F5",
            }}>
              <span style={{
                fontSize: 20, width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 8, background: "#FFFFFF", border: "1px solid #E8ECF0", flexShrink: 0,
              }}>{t.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1A2B3C" }}>{t.name}</span>
                  <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 6, background: cfg.accentSoft, color: cfg.accent, fontWeight: 700 }}>{t.tag}</span>
                </div>
                <p style={{ margin: 0, fontSize: 10, color: "#7A8FA0", lineHeight: 1.4 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <div style={{
        margin: "0 8px 10px", ...card,
        background: `linear-gradient(135deg, ${cfg.accentSoft}, #FFFCF5)`,
        border: `1.5px solid ${cfg.accent}20`,
        textAlign: "center", padding: "18px 16px",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#FFFFFF", border: `2px solid ${cfg.accent}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, margin: "0 auto 10px",
          boxShadow: `0 3px 10px ${cfg.accent}12`,
        }}>💡</div>
        <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "#1A2B3C" }}>热泵 = 热量搬运工</p>
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.8, color: "#5A6B7C" }}>
          不像电锅炉把电能转化为热能（效率 ≤ 100%），热泵用少量电能驱动压缩机，将低温环境中的热量"搬运"到高温环境，实现 <strong style={{ color: cfg.accent }}>300% ~ 450%</strong> 的等效效率。这正是综合能源体系中热泵被视为核心设备的原因。
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "6px 16px 24px", fontSize: 10, color: "#B8C4CE", lineHeight: 1.5 }}>
        点击组件或步骤按钮暂停查看 · 点击播放键恢复演示
      </div>
    </div>
  );
}
