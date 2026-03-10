import { useState, useEffect } from "react";

const data = {
  stats: [
    { icon: "🏢", value: "25", unit: "层", label: "崇实楼（约1000间客房）" },
    { icon: "🛏️", value: "60", unit: "%+", label: "崇实楼入住率" },
    { icon: "🎓", value: "3×120", unit: "间", label: "学员楼（3栋·入住率85%）" },
    { icon: "👥", value: "1000", unit: "人/天", label: "高峰期日培训人数" },
  ],
  chongshi: [
    { label: "采暖/热水供应", value: "市政蒸汽制取", type: "normal" },
    { label: "蒸汽单价", value: "190 元/吨", type: "warn" },
    { label: "制冷系统", value: "4台特灵螺杆机 246KW", type: "normal" },
    { label: "蓄冷技术", value: "已采用冰蓄冷", type: "ok" },
    { label: "供暖温度", value: "50°C（11月中–3月中下旬）", type: "normal" },
    { label: "生活热水", value: "全天 53°C", type: "normal" },
  ],
  xueyuan: [
    { label: "空调系统", value: "分体空调（各自独立）", type: "normal" },
    { label: "热水供应", value: "太阳能集热器 + 电加热器", type: "normal" },
    { label: "太阳能系统", value: "漏水", type: "issue" },
    { label: "电加热器", value: "损坏", type: "issue" },
    { label: "运行能耗", value: "电加热成本高", type: "warn" },
    { label: "维护状态", value: "亟需改造", type: "warn" },
  ],
  plans: [
    {
      num: "01",
      target: "崇实楼 + 食堂",
      title: "热泵替代蒸汽",
      detail: "崇实楼生活热水和采暖热水改用热泵制取，食堂生活热水同步改造，全面替代外购市政蒸汽。",
      from: "蒸汽 190元/吨",
      to: "空气源热泵",
    },
    {
      num: "02",
      target: "学员楼 · 2栋",
      title: "热泵热水系统",
      detail: "2栋学员楼新增空气源热泵机组制取热水，替代现有漏水的太阳能集热器和损坏的电加热器。",
      from: "太阳能+电加热",
      to: "热泵机组",
    },
    {
      num: "03",
      target: "学员楼 · 1栋",
      title: "光伏+蓄热系统",
      detail: "拆除屋面现有太阳能集热器，新增光伏发电系统，光伏电力驱动热泵制取热水，形成「光、蓄供热系统」。",
      from: "旧太阳能",
      to: "光伏 + 热泵联动",
    },
  ],
  flows: [
    { sources: ["☀️ 光伏发电", "⚡ 电力驱动", "🔄 空气源热泵", "🚿 生活热水 53°C"], types: ["source", "tech", "tech", "output"] },
    { sources: ["🔌 市电/谷电", "⚡ 电力驱动", "🔄 空气源热泵", "🌡️ 采暖热水 50°C"], types: ["source", "tech", "tech", "output"] },
    { sources: ["🧊 冰蓄冷（保留）", "❄️ 特灵螺杆机组", "🏢 崇实楼制冷"], types: ["source", "tech", "output"] },
  ],
  benefits: [
    { emoji: "💰", title: "降低运行成本", desc: "热泵COP可达3.0–4.0，大幅减少蒸汽外购费用" },
    { emoji: "🌱", title: "绿色低碳", desc: "光伏+热泵联动，提升可再生能源利用比例" },
    { emoji: "🔧", title: "解决设备隐患", desc: "替换漏水太阳能及损坏电加热器，保障学员用热水" },
  ],
};

const Badge = ({ type, children }) => {
  const colors = {
    ok: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)", text: "#34d399" },
    issue: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)", text: "#f87171" },
  };
  const c = colors[type];
  return (
    <span style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 10, fontWeight: 500, background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {children}
    </span>
  );
};

const FadeIn = ({ delay = 0, children }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease-out, transform 0.7s ease-out" }}>
      {children}
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 21, fontWeight: 700, color: "#f1f5f9", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
    <span style={{ width: 4, height: 22, background: "linear-gradient(180deg, #22d3ee, #06b6d4)", borderRadius: 2, flexShrink: 0 }} />
    {children}
  </div>
);

const InfoRow = ({ label, value, type }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
    <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 500, color: type === "warn" ? "#f87171" : type === "ok" ? "#34d399" : "#e2e8f0" }}>
      {type === "ok" ? <Badge type="ok">{value}</Badge> : type === "issue" ? <Badge type="issue">{value}</Badge> : value}
    </span>
  </div>
);

const FlowNode = ({ text, type }) => {
  const styles = {
    source: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", color: "#f59e0b" },
    tech: { bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.3)", color: "#22d3ee" },
    output: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", color: "#34d399" },
  };
  const s = styles[type];
  return (
    <div style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, textAlign: "center", background: s.bg, border: `1px solid ${s.border}`, color: s.color, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};

export default function App() {
  const [hovered, setHovered] = useState(null);

  const cardBase = {
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: 18,
    padding: 26,
    transition: "transform 0.3s, border-color 0.3s",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1a",
      color: "#e2e8f0",
      fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    }}>
      {/* BG glow */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 25% 15%, rgba(34,211,238,0.04) 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, rgba(245,158,11,0.03) 0%, transparent 55%)",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <FadeIn delay={0}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{
              display: "inline-block", background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(6,182,212,0.08))",
              border: "1px solid rgba(34,211,238,0.25)", color: "#22d3ee", fontSize: 12, fontWeight: 500, padding: "5px 16px", borderRadius: 18, letterSpacing: 2, marginBottom: 18,
            }}>
              连云港供电公司 · 后勤部
            </span>
            <h1 style={{
              fontSize: 38, fontWeight: 900, lineHeight: 1.3, marginBottom: 10,
              background: "linear-gradient(135deg, #f8fafc, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              培训中心节能改造方案
            </h1>
            <p style={{ fontSize: 15, color: "#94a3b8", fontWeight: 300 }}>
              2008年建成 · 每年承接全省 <span style={{ color: "#22d3ee", fontWeight: 600 }}>14.5万</span> 农电工培训任务
            </p>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={100}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 48 }}>
            {data.stats.map((s, i) => (
              <div key={i} onMouseEnter={() => setHovered(`s${i}`)} onMouseLeave={() => setHovered(null)}
                style={{ ...cardBase, textAlign: "center", padding: 22, transform: hovered === `s${i}` ? "translateY(-4px)" : "none", borderColor: hovered === `s${i}` ? "rgba(34,211,238,0.3)" : "#1e293b", cursor: "default" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#f8fafc", lineHeight: 1, marginBottom: 5 }}>
                  {s.value}<span style={{ fontSize: 15, fontWeight: 400, color: "#94a3b8" }}>{s.unit}</span>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Situation */}
        <FadeIn delay={200}>
          <SectionTitle>现状概览</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 40 }}>
            <div style={cardBase}>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#f1f5f9", marginBottom: 3 }}>崇实楼</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 18 }}>25层主楼 · 住宿 + 用餐 + 培训</div>
              {data.chongshi.map((r, i) => <InfoRow key={i} {...r} />)}
            </div>
            <div style={{ ...cardBase }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: "radial-gradient(circle, rgba(248,113,113,0.06) 0%, transparent 70%)", borderRadius: "0 18px 0 0" }} />
              <div style={{ fontSize: 19, fontWeight: 700, color: "#f1f5f9", marginBottom: 3 }}>学员楼 ×3栋</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 18 }}>每栋120间 · 年入住率85%</div>
              {data.xueyuan.map((r, i) => <InfoRow key={i} {...r} />)}
            </div>
          </div>
        </FadeIn>

        {/* Problem */}
        <FadeIn delay={300}>
          <div style={{
            background: "linear-gradient(135deg, rgba(248,113,113,0.07), rgba(251,146,60,0.04))",
            border: "1px solid rgba(248,113,113,0.15)", borderRadius: 14, padding: "18px 24px", marginBottom: 44,
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>⚡</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f87171", marginBottom: 5 }}>核心痛点</div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.75 }}>
                崇实楼依赖外购蒸汽（190元/吨）供应采暖及生活热水，运行成本高；学员楼太阳能集热器漏水、电加热器损坏，设备老化严重；食堂热水同样依赖外购蒸汽，能源结构单一。
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Plans */}
        <FadeIn delay={400}>
          <SectionTitle>节能改造方案</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 44 }}>
            {data.plans.map((p, i) => (
              <div key={i} onMouseEnter={() => setHovered(`p${i}`)} onMouseLeave={() => setHovered(null)}
                style={{ ...cardBase, transform: hovered === `p${i}` ? "translateY(-4px)" : "none", borderColor: hovered === `p${i}` ? "rgba(34,211,238,0.25)" : "#1e293b", cursor: "default" }}>
                <div style={{ position: "absolute", top: 12, right: 16, fontSize: 58, fontWeight: 900, color: "rgba(34,211,238,0.05)", lineHeight: 1 }}>{p.num}</div>
                <span style={{
                  display: "inline-block", background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)",
                  color: "#22d3ee", fontSize: 11, fontWeight: 500, padding: "3px 11px", borderRadius: 7, marginBottom: 14,
                }}>{p.target}</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 10, lineHeight: 1.4 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, marginBottom: 14 }}>{p.detail}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ color: "#f87171", textDecoration: "line-through", opacity: 0.7 }}>{p.from}</span>
                  <span style={{ color: "#64748b" }}>→</span>
                  <span style={{ color: "#34d399", fontWeight: 600 }}>{p.to}</span>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Flow */}
        <FadeIn delay={500}>
          <SectionTitle>改造后能源流向</SectionTitle>
          <div style={{ ...cardBase, padding: 32, marginBottom: 44 }}>
            {data.flows.map((row, ri) => (
              <div key={ri} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: ri < data.flows.length - 1 ? 14 : 0, flexWrap: "wrap" }}>
                {row.sources.map((s, si) => (
                  <div key={si} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {si > 0 && <span style={{ color: "#64748b", fontSize: 16 }}>→</span>}
                    <FlowNode text={s} type={row.types[si]} />
                  </div>
                ))}
              </div>
            ))}
            <div style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 14, fontWeight: 300 }}>
              光伏 + 热泵 + 蓄冷 三位一体 · 多能互补
            </div>
          </div>
        </FadeIn>

        {/* Benefits */}
        <FadeIn delay={600}>
          <SectionTitle>预期效果</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 40 }}>
            {data.benefits.map((b, i) => (
              <div key={i} style={{
                background: "linear-gradient(135deg, rgba(52,211,153,0.07), rgba(34,211,238,0.03))",
                border: "1px solid rgba(52,211,153,0.15)", borderRadius: 14, padding: 22, textAlign: "center",
              }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>{b.emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399", marginBottom: 5 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.65 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 40, paddingTop: 20, borderTop: "1px solid #1e293b", fontSize: 12, color: "#475569" }}>
          连云港供电公司培训中心 · 节能改造方案汇报 · 2026
        </div>
      </div>
    </div>
  );
}
