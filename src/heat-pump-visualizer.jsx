import { useState, useEffect, useRef } from "react";

const MODES = {
  heating: {
    label: "制热模式",
    icon: "🔥",
    outdoor: { temp: -5, label: "室外低温", color: "#4A90D9" },
    indoor: { temp: 22, label: "室内温暖", color: "#E8734A" },
    flowDirection: 1,
    accent: "#E8734A",
    accentLight: "#FFF0EB",
    description: "从室外低温空气中提取热量，通过压缩升温后释放到室内",
    cop: "3.0~4.5",
    meaning: "每消耗1度电，搬运3~4.5度电的热量到室内",
  },
  cooling: {
    label: "制冷模式",
    icon: "❄️",
    outdoor: { temp: 35, label: "室外高温", color: "#E8734A" },
    indoor: { temp: 24, label: "室内凉爽", color: "#4A90D9" },
    flowDirection: -1,
    accent: "#4A90D9",
    accentLight: "#EBF3FF",
    description: "从室内吸收多余热量，通过制冷剂循环排放到室外",
    cop: "3.5~5.5",
    meaning: "每消耗1度电，从室内搬走3.5~5.5度电的热量",
  },
};

const STEPS = [
  {
    id: "evaporate",
    title: "蒸发吸热",
    heating: "室外蒸发器从低温空气中吸收热量，制冷剂由液态变为气态",
    cooling: "室内蒸发器从房间空气中吸收热量，制冷剂由液态变为气态",
    detail: "利用制冷剂沸点极低（约-40°C）的特性，即使在寒冷环境中也能蒸发吸热",
  },
  {
    id: "compress",
    title: "压缩升温",
    heating: "压缩机将低温低压气态制冷剂压缩为高温高压气体",
    cooling: "压缩机将低温低压气态制冷剂压缩为高温高压气体",
    detail: "这是热泵的核心部件，消耗电能做功，是\"搬运热量\"的动力来源",
  },
  {
    id: "condense",
    title: "冷凝放热",
    heating: "高温制冷剂在室内冷凝器中放热，将热量释放给室内空气",
    cooling: "高温制冷剂在室外冷凝器中放热，将热量排放到室外环境",
    detail: "制冷剂由气态重新变为液态，释放大量热量",
  },
  {
    id: "expand",
    title: "膨胀降压",
    heating: "高压液态制冷剂通过膨胀阀降压降温，准备再次吸热",
    cooling: "高压液态制冷剂通过膨胀阀降压降温，准备再次吸热",
    detail: "膨胀阀控制制冷剂流量，使其迅速降压降温，完成一个循环",
  },
];

// Animated particle along cycle path
function Particle({ progress, mode, pathPoints }) {
  if (!pathPoints || pathPoints.length < 2) return null;
  const totalLen = pathPoints.length - 1;
  const idx = progress * totalLen;
  const i = Math.floor(idx);
  const t = idx - i;
  const p1 = pathPoints[Math.min(i, totalLen)];
  const p2 = pathPoints[Math.min(i + 1, totalLen)];
  const x = p1[0] + (p2[0] - p1[0]) * t;
  const y = p1[1] + (p2[1] - p1[1]) * t;

  // Color gradient based on progress (temperature)
  const isHeating = mode === "heating";
  let color;
  if (progress < 0.25) color = isHeating ? "#6BB8F0" : "#6BB8F0";
  else if (progress < 0.5) color = "#F5A623";
  else if (progress < 0.75) color = "#E8734A";
  else color = "#9BC4E2";

  return (
    <circle cx={x} cy={y} r={5} fill={color} opacity={0.9}>
      <animate
        attributeName="r"
        values="4;6;4"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </circle>
  );
}

export default function HeatPumpVisualizer() {
  const [mode, setMode] = useState("heating");
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [particles, setParticles] = useState([0, 0.25, 0.5, 0.75]);
  const animRef = useRef();
  const cfg = MODES[mode];
  const step = STEPS[activeStep];

  useEffect(() => {
    if (!isPlaying) return;
    let frame;
    const speed = 0.003;
    const tick = () => {
      setParticles((prev) => prev.map((p) => (p + speed) % 1));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  // Auto-advance steps
  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => setActiveStep((s) => (s + 1) % 4), 3000);
    return () => clearInterval(iv);
  }, [isPlaying]);

  // Cycle path points (simplified rectangle path for the diagram)
  const pathPoints = (() => {
    const pts = [];
    const segs = 80;
    // Define 4 corners: evaporator(left) -> compressor(bottom) -> condenser(right) -> expansion(top)
    const corners = [
      [120, 200], // left (evaporator)
      [300, 330], // bottom (compressor)
      [480, 200], // right (condenser)
      [300, 80],  // top (expansion valve)
    ];
    for (let seg = 0; seg < 4; seg++) {
      const from = corners[seg];
      const to = corners[(seg + 1) % 4];
      const steps = segs / 4;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        pts.push([
          from[0] + (to[0] - from[0]) * t,
          from[1] + (to[1] - from[1]) * t,
        ]);
      }
    }
    return pts;
  })();

  const componentPositions = [
    { x: 120, y: 200, label: mode === "heating" ? "室外蒸发器" : "室内蒸发器", icon: "🌡️", step: 0 },
    { x: 300, y: 330, label: "压缩机", icon: "⚡", step: 1 },
    { x: 480, y: 200, label: mode === "heating" ? "室内冷凝器" : "室外冷凝器", icon: "🔄", step: 2 },
    { x: 300, y: 80, label: "膨胀阀", icon: "💧", step: 3 },
  ];

  const stateLabels = [
    { x: 190, y: 275, text: "低温低压气体", color: "#6BB8F0" },
    { x: 400, y: 290, text: "高温高压气体", color: "#E8734A" },
    { x: 400, y: 120, text: "高温高压液体", color: "#D4783C" },
    { x: 180, y: 130, text: "低温低压液体", color: "#9BC4E2" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0D1B2A 0%, #1B2838 40%, #172A3A 100%)",
        fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        color: "#E0E6ED",
        padding: "0",
        overflow: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "32px 24px 20px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "4px 16px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.06)",
            fontSize: "12px",
            letterSpacing: "3px",
            color: "#8899AA",
            marginBottom: "12px",
            textTransform: "uppercase",
          }}
        >
          综合能源 · 技术原理
        </div>
        <h1
          style={{
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: 700,
            margin: "0 0 6px",
            background: `linear-gradient(135deg, #fff, ${cfg.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "2px",
          }}
        >
          热泵工作原理
        </h1>
        <p style={{ color: "#7A8FA0", fontSize: "14px", margin: 0 }}>
          不产生热量，只搬运热量 —— 高效节能的核心逻辑
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => { setMode(key); setActiveStep(0); }}
            style={{
              padding: "10px 28px",
              borderRadius: "24px",
              border: mode === key ? `2px solid ${val.accent}` : "2px solid rgba(255,255,255,0.08)",
              background: mode === key ? `${val.accent}18` : "rgba(255,255,255,0.03)",
              color: mode === key ? val.accent : "#7A8FA0",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{val.icon}</span> {val.label}
          </button>
        ))}
      </div>

      {/* Main Diagram */}
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto 20px",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 8px 8px",
            position: "relative",
          }}
        >
          {/* Indoor / Outdoor labels */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 24px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: mode === "heating" ? "#4A90D9" : "#E8734A",
                display: "inline-block",
              }} />
              <span style={{ fontSize: 12, color: "#8899AA" }}>
                {cfg.outdoor.label} {cfg.outdoor.temp}°C
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: mode === "heating" ? "#E8734A" : "#4A90D9",
                display: "inline-block",
              }} />
              <span style={{ fontSize: 12, color: "#8899AA" }}>
                {cfg.indoor.label} {cfg.indoor.temp}°C
              </span>
            </div>
          </div>

          <svg viewBox="0 0 600 410" style={{ width: "100%", height: "auto" }}>
            {/* Background zones */}
            <rect x="0" y="40" width="300" height="340" rx="12" fill={mode === "heating" ? "rgba(74,144,217,0.06)" : "rgba(232,115,74,0.06)"} />
            <rect x="300" y="40" width="300" height="340" rx="12" fill={mode === "heating" ? "rgba(232,115,74,0.06)" : "rgba(74,144,217,0.06)"} />
            <line x1="300" y1="50" x2="300" y2="370" stroke="rgba(255,255,255,0.08)" strokeDasharray="6 4" />

            {/* Cycle path */}
            <polygon
              points={`120,200 300,330 480,200 300,80`}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />

            {/* Direction arrows on path */}
            {[
              { x: 210, y: 270, angle: 60 },
              { x: 390, y: 270, angle: -60 },
              { x: 390, y: 136, angle: 60 },
              { x: 210, y: 136, angle: -60 },
            ].map((a, i) => (
              <g key={i} transform={`translate(${a.x},${a.y}) rotate(${a.angle})`}>
                <polygon points="-5,-4 5,0 -5,4" fill="rgba(255,255,255,0.2)" />
              </g>
            ))}

            {/* State labels */}
            {stateLabels.map((sl, i) => (
              <text
                key={i}
                x={sl.x}
                y={sl.y}
                fill={sl.color}
                fontSize="10"
                textAnchor="middle"
                opacity={0.7}
                fontWeight="500"
              >
                {sl.text}
              </text>
            ))}

            {/* Component nodes */}
            {componentPositions.map((comp, i) => {
              const isActive = activeStep === comp.step;
              return (
                <g
                  key={i}
                  onClick={() => { setActiveStep(comp.step); setIsPlaying(false); }}
                  style={{ cursor: "pointer" }}
                >
                  {isActive && (
                    <circle cx={comp.x} cy={comp.y} r={38} fill="none" stroke={cfg.accent} strokeWidth="2" opacity={0.4}>
                      <animate attributeName="r" values="36;42;36" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={comp.x}
                    cy={comp.y}
                    r={32}
                    fill={isActive ? `${cfg.accent}30` : "rgba(255,255,255,0.05)"}
                    stroke={isActive ? cfg.accent : "rgba(255,255,255,0.12)"}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <text x={comp.x} y={comp.y + 2} textAnchor="middle" fontSize="20" dominantBaseline="central">
                    {comp.icon}
                  </text>
                  <text
                    x={comp.x}
                    y={comp.y + (comp.step === 1 ? 52 : comp.step === 3 ? -46 : 50)}
                    textAnchor="middle"
                    fill={isActive ? "#fff" : "#8899AA"}
                    fontSize="12"
                    fontWeight={isActive ? "600" : "400"}
                  >
                    {comp.label}
                  </text>
                </g>
              );
            })}

            {/* Animated particles */}
            {particles.map((p, i) => (
              <Particle key={i} progress={p} mode={mode} pathPoints={pathPoints} />
            ))}

            {/* Energy flow indicators */}
            <g>
              {/* Heat absorbed arrow */}
              <g transform={mode === "heating" ? "translate(55,200)" : "translate(535,200)"}>
                <line x1="0" y1="-20" x2="0" y2="20" stroke={cfg.accent} strokeWidth="2" opacity="0.5" />
                <polygon points="-5,12 5,12 0,22" fill={cfg.accent} opacity="0.5" />
                <text x="0" y="36" textAnchor="middle" fill={cfg.accent} fontSize="10" opacity="0.7">吸热</text>
              </g>
              {/* Heat released arrow */}
              <g transform={mode === "heating" ? "translate(545,200)" : "translate(55,200)"}>
                <line x1="0" y1="20" x2="0" y2="-20" stroke={cfg.accent} strokeWidth="2" opacity="0.5" />
                <polygon points="-5,-12 5,-12 0,-22" fill={cfg.accent} opacity="0.5" />
                <text x="0" y="-30" textAnchor="middle" fill={cfg.accent} fontSize="10" opacity="0.7">放热</text>
              </g>
            </g>

            {/* Electricity input */}
            <g transform="translate(300,380)">
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#F5C842" strokeWidth="2" />
              <text x="0" y="16" textAnchor="middle" fill="#F5C842" fontSize="10">电能输入 ⚡</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Step Info Card */}
      <div style={{ maxWidth: 640, margin: "0 auto 20px", padding: "0 16px" }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${cfg.accent}12, rgba(255,255,255,0.03))`,
            borderRadius: "16px",
            border: `1px solid ${cfg.accent}30`,
            padding: "20px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, width: `${((activeStep + 1) / 4) * 100}%`,
            height: "3px", background: cfg.accent, borderRadius: "2px",
            transition: "width 0.5s ease",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{
              background: cfg.accent, color: "#fff", width: 26, height: 26,
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
            }}>
              {activeStep + 1}
            </span>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#fff" }}>
              {step.title}
            </h3>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.7, color: "#B8C7D6" }}>
            {step[mode]}
          </p>
          <button
            onClick={() => setShowDetail(!showDetail)}
            style={{
              background: "none", border: "none", color: cfg.accent,
              fontSize: 13, cursor: "pointer", padding: 0, fontWeight: 500,
            }}
          >
            {showDetail ? "收起详情 ▲" : "查看详情 ▼"}
          </button>
          {showDetail && (
            <p style={{
              margin: "8px 0 0", fontSize: 13, lineHeight: 1.7,
              color: "#8899AA", borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 10,
            }}>
              💡 {step.detail}
            </p>
          )}
        </div>
      </div>

      {/* Step Navigation */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setActiveStep(i); setIsPlaying(false); }}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              border: activeStep === i ? `2px solid ${cfg.accent}` : "1px solid rgba(255,255,255,0.1)",
              background: activeStep === i ? `${cfg.accent}22` : "rgba(255,255,255,0.03)",
              color: activeStep === i ? "#fff" : "#667788",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: isPlaying ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
            color: "#B8C7D6", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      </div>

      {/* COP Insight */}
      <div style={{ maxWidth: 640, margin: "0 auto 20px", padding: "0 16px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 24px",
          }}
        >
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#C8D6E0" }}>
            📊 能效比（COP）—— 热泵的核心优势
          </h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {/* COP visual */}
            <div style={{ flex: "1 1 180px" }}>
              <div style={{
                background: `linear-gradient(135deg, ${cfg.accent}15, transparent)`,
                borderRadius: "12px", padding: "16px", textAlign: "center",
              }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: cfg.accent }}>{cfg.cop}</div>
                <div style={{ fontSize: 12, color: "#8899AA", marginTop: 4 }}>COP 范围</div>
              </div>
            </div>
            {/* Comparison bars */}
            <div style={{ flex: "1 1 260px" }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8899AA", marginBottom: 4 }}>
                  <span>电锅炉</span><span>COP ≈ 0.9</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ width: "22%", height: "100%", borderRadius: 4, background: "#667788" }} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8899AA", marginBottom: 4 }}>
                  <span>燃气锅炉</span><span>COP ≈ 0.85</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ width: "20%", height: "100%", borderRadius: 4, background: "#886644" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: cfg.accent, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>热泵</span><span style={{ fontWeight: 600 }}>COP ≈ {cfg.cop}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ width: "88%", height: "100%", borderRadius: 4, background: cfg.accent, transition: "all 0.5s" }} />
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#7A8FA0", marginTop: 10, lineHeight: 1.6 }}>
                {cfg.meaning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Types */}
      <div style={{ maxWidth: 640, margin: "0 auto 20px", padding: "0 16px" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "20px 24px",
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#C8D6E0" }}>
            🏷️ 热泵类型一览
          </h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { name: "空气源热泵", desc: "最普及，从空气取热，安装灵活", tag: "主流" },
              { name: "地源热泵", desc: "利用地下恒温层，效率更高", tag: "高效" },
              { name: "水源热泵", desc: "利用江河湖水，适合临水区域", tag: "区域性" },
              { name: "工业余热热泵", desc: "回收工业废热，综合能源典型场景", tag: "节能" },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  flex: "1 1 calc(50% - 10px)",
                  minWidth: 200,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#D8E2EC" }}>{t.name}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 10,
                    background: `${cfg.accent}20`, color: cfg.accent, fontWeight: 500,
                  }}>{t.tag}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#7A8FA0", lineHeight: 1.5 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div style={{ maxWidth: 640, margin: "0 auto 32px", padding: "0 16px" }}>
        <div style={{
          background: `linear-gradient(135deg, ${cfg.accent}08, rgba(245,198,66,0.05))`,
          borderRadius: "16px",
          border: "1px solid rgba(245,198,66,0.15)",
          padding: "20px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💡</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: "#C8D6E0", fontWeight: 500 }}>
            热泵的本质是一台"热量搬运工"
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.7, color: "#8899AA" }}>
            它不像电锅炉那样把电能转化为热能（效率≤100%），而是用少量电能驱动压缩机，
            将低温环境中的热量"搬运"到高温环境中，实现 300%~450% 的等效效率。
            这正是综合能源体系中热泵被视为核心设备的原因。
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "0 0 32px", fontSize: 11, color: "#4A5B6C" }}>
        点击循环图中的组件或步骤按钮可暂停并查看详情 · 点击播放键恢复自动演示
      </div>
    </div>
  );
}
