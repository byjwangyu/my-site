import { useState, useEffect, useRef } from "react";

const sections = [
  { id: "hero", title: "Hero" },
  { id: "overview", title: "核心洞察" },
  { id: "scenarios", title: "应用场景" },
  { id: "support", title: "支撑体系" },
  { id: "china", title: "中国借鉴" },
];

function AnimNum({ target, suffix, dur }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !ran.current) {
          ran.current = true;
          let s = 0;
          const step = target / ((dur || 1800) / 16);
          const t = setInterval(() => {
            s += step;
            if (s >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(s));
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, dur]);
  return <span ref={ref}>{val}{suffix || ""}</span>;
}

function FadeIn({ children, delay, style }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(36px)",
        transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) " + (delay || 0) + "s",
      }}
    >
      {children}
    </div>
  );
}

const cssText = [
  "@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');",
  "*{margin:0;padding:0;box-sizing:border-box}",
  "html{scroll-behavior:smooth}",
  "::-webkit-scrollbar{width:5px}",
  "::-webkit-scrollbar-track{background:#0a0f1a}",
  "::-webkit-scrollbar-thumb{background:#f59e0b;border-radius:3px}",
  ".stat-card{background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.02));border:1px solid rgba(245,158,11,0.15);border-radius:16px;padding:30px 24px;text-align:center;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden}",
  ".stat-card:hover{transform:translateY(-4px);border-color:rgba(245,158,11,0.35);box-shadow:0 20px 60px rgba(245,158,11,0.08)}",
  ".sc{background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:36px 28px;transition:all 0.5s cubic-bezier(0.16,1,0.3,1)}",
  ".sc:hover{transform:translateY(-5px);border-color:rgba(255,255,255,0.15);box-shadow:0 30px 80px rgba(0,0,0,0.3)}",
  ".pc{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:34px 26px;transition:all 0.4s}",
  ".pc:hover{background:rgba(255,255,255,0.05);border-color:rgba(245,158,11,0.2)}",
  ".nd{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);cursor:pointer;transition:all 0.3s;border:none;padding:0}",
  ".nd.ac{background:#f59e0b;box-shadow:0 0 12px rgba(245,158,11,0.5);transform:scale(1.3)}",
  ".nd:hover{background:rgba(245,158,11,0.6)}",
  ".tag{display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:600;letter-spacing:0.5px}",
  "@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}",
  "@keyframes gshift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}",
].join("\n");

export default function App() {
  const [active, setActive] = useState("hero");
  const [sy, setSy] = useState(0);

  useEffect(() => {
    const h = () => setSy(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold: 0.3 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const mono = { fontFamily: "'Space Mono', monospace" };
  const dm = { fontFamily: "'DM Sans', sans-serif" };
  const serif = { fontFamily: "'Noto Serif SC', Georgia, serif" };
  const muted = "rgba(232,230,225,0.55)";
  const amber = "#f59e0b";
  const blue = "#3b82f6";
  const red = "#ef4444";
  const green = "#22c55e";

  const stats = [
    { n: 50, s: "%+", l: "新能源电力消纳占比", c: amber },
    { n: 99, s: "%", l: "电蒸汽锅炉能源效率", c: green },
    { n: 67, s: "%", l: "2030年建筑减碳目标", c: blue },
    { n: 55, s: "\u20AC/t", l: "2025年碳价水平", c: red },
  ];

  const flowSteps = [
    { t: "可再生能源发电", e: "\u2600\uFE0F" },
    { t: "电转热设备", e: "\u26A1" },
    { t: "储热设施", e: "\uD83D\uDD0B" },
    { t: "终端供热", e: "\uD83C\uDFE0" },
  ];

  const scenarios = [
    {
      num: "01", title: "建筑与社区", accent: blue,
      tags: ["空气源热泵", "地源热泵", "老旧建筑改造"],
      pts: [
        "中部和北部：新一代变频空气源热泵，-20\u00B0C下COP>2.5",
        "南部：地源热泵+社区地热网络，垂直地热交换器共享设计",
        "75%老旧建筑渐进改造：围护结构保温 \u2192 供暖升级 \u2192 混合供热过渡",
        "柏林EUREF Campus：热泵+太阳能集热器+储热，跨季节热能存取",
      ],
    },
    {
      num: "02", title: "工业生产", accent: red,
      tags: ["电蒸汽锅炉", "工业热泵", "余热回收"],
      pts: [
        "电蒸汽锅炉：99%+能效，5分钟待机至满负荷，精准负荷调节",
        "Veltins啤酒厂：9MW电蒸汽锅炉，利用风电光伏盈余电量",
        "工业热泵制热COP达2.0-5.0，回收工业废热实现热能升级",
        "造纸、化工行业供热-冷却一机两用，不与电网形成回流",
      ],
    },
    {
      num: "03", title: "区域供热", accent: green,
      tags: ["多热源整合", "季节性储热", "数字化调度"],
      pts: [
        "汉堡回购供热网络所有权，电转热与工业余热、可再生能源深度耦合",
        "EnergyPRO小时级调度：工业余热为基荷，电转热承担调峰",
        "Stellingen含水层季节性储热，解决电价低谷与供热高峰不重合",
        "Dradenau污水处理厂热泵：废水余热转化为区域供热低碳热源",
      ],
    },
  ];

  const pillars = [
    {
      icon: "\uD83D\uDCDC", title: "政策体系", color: amber, sub: "目标明确 \u00B7 推拉结合",
      items: [
        { l: "联邦气候保护法", d: "2030年建筑碳排放较1990年减少67%" },
        { l: "建筑能源法 2023修订", d: "2024年起新供暖系统至少65%可再生能源" },
        { l: "补贴+碳价双驱动", d: "区域供热补贴覆盖40%投资，碳价55\u20AC/t" },
      ],
    },
    {
      icon: "\uD83D\uDD2C", title: "技术创新", color: blue, sub: "因地制宜 \u00B7 电网友好",
      items: [
        { l: "设备端", d: "热泵低温适应、噪音控制、智能化升级" },
        { l: "系统端", d: "数字化平台+机器学习，全系统优化调度" },
        { l: "储能端", d: "DLR熔盐单罐分层储热，复合储热降本" },
      ],
    },
    {
      icon: "\uD83D\uDCB0", title: "市场机制", color: green, sub: "模式多元 \u00B7 降低门槛",
      items: [
        { l: "社区能源合作社", d: "居民共同投资、共享收益" },
        { l: "热泵即服务(HaaS)", d: "按月固定费用，设备+电力+维护一体化" },
        { l: "动态电价+绿色证书", d: "低价时段运行降本，绿色供暖溢价" },
      ],
    },
  ];

  const chinaItems = [
    { n: "\u2460", t: "强化电转热调节功能", d: "突出负荷侧响应的灵活性价值，推动电转热从单一应用场景向系统性调节资源转型。在负电价时段将冗余电力转化为热能储存，缓解负电价冲击。", c: amber },
    { n: "\u2461", t: "因地制宜分类施策", d: "工业领域聚焦高温工艺电气化与余热梯级利用；建筑供暖统筹集中供热与分布式系统，构建多元融合的清洁供热体系。", c: blue },
    { n: "\u2462", t: "强化顶层战略协同", d: "将清洁供热规划与新型电力系统建设、工业能效提升、城市更新等国家战略有机衔接，推动财政支持向系统价值激励转变。", c: red },
    { n: "\u2463", t: "绿色金融与市场支撑", d: "对负电价时段参与消纳的电转热项目给予额外激励，发挥绿色金融在降低融资成本、优化资本配置中的作用。", c: green },
  ];

  return (
    <div style={{ ...serif, background: "#0a0f1a", color: "#e8e6e1", minHeight: "100vh", overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />

      {/* Nav Dots */}
      <nav style={{ position: "fixed", right: 18, top: "50%", transform: "translateY(-50%)", zIndex: 100, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        {sections.map((s) => (
          <button key={s.id} className={"nd" + (active === s.id ? " ac" : "")}
            onClick={() => document.getElementById(s.id).scrollIntoView({ behavior: "smooth" })} />
        ))}
      </nav>

      {/* HERO */}
      <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "40px 24px" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(120px)", opacity: 0.15, background: amber, top: -200, left: -100, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(120px)", opacity: 0.12, background: red, bottom: -200, right: -100, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", filter: "blur(120px)", opacity: 0.1, background: blue, top: "30%", right: "10%", pointerEvents: "none" }} />

        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)", backgroundSize: "80px 80px", transform: "translateY(" + (sy * 0.1) + "px)" }} />

        <FadeIn>
          <div style={{ ...mono, fontSize: 13, color: amber, letterSpacing: 6, textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
            Power-to-Heat Technology
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <h1 style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, textAlign: "center", lineHeight: 1.15, background: "linear-gradient(135deg, #ffffff 0%, #f59e0b 50%, #ef4444 100%)", backgroundSize: "200% 200%", animation: "gshift 6s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", maxWidth: 800 }}>
            德国电转热技术
          </h1>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", color: "rgba(232,230,225,0.6)", textAlign: "center", maxWidth: 650, lineHeight: 1.8, marginTop: 24 }}>
            规模化消纳新能源 · 终端高效利用 · 零电网负担
          </p>
        </FadeIn>
        <FadeIn delay={0.5}>
          <div style={{ marginTop: 60, display: "flex", gap: 12, alignItems: "center", color: "rgba(255,255,255,0.3)", ...dm, fontSize: 13 }}>
            <span>向下滚动探索</span>
            <span style={{ animation: "floaty 2s ease-in-out infinite", fontSize: 18 }}>{"\u2193"}</span>
          </div>
        </FadeIn>
      </section>

      {/* OVERVIEW */}
      <section id="overview" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ ...mono, fontSize: 12, color: amber, letterSpacing: 4, marginBottom: 16 }}>01 — CORE INSIGHTS</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, marginBottom: 20, lineHeight: 1.3 }}>核心洞察</h2>
          <p style={{ fontSize: 17, lineHeight: 2, color: "rgba(232,230,225,0.65)", maxWidth: 800, marginBottom: 60 }}>
            德国并未依靠成本高昂的电化学储能消纳新能源，而是通过规模化推广电转热技术配套大容量储热设施，消纳全国超过50%的新能源电力，形成了可持续转型路径。
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 70 }}>
          {stats.map((st, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="stat-card">
                <div style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 900, ...dm, color: st.c, marginBottom: 10 }}>
                  <AnimNum target={st.n} suffix={st.s} />
                </div>
                <div style={{ fontSize: 14, color: "rgba(232,230,225,0.5)", ...dm }}>{st.l}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "40px 28px" }}>
            <div style={{ ...mono, fontSize: 13, color: amber, marginBottom: 24, letterSpacing: 2 }}>技术路径</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              {flowSteps.map((fs, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "16px 22px", textAlign: "center", minWidth: 130 }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{fs.e}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fs.t}</div>
                  </div>
                  {i < 3 && (
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: "rgba(245,158,11,0.1)", color: amber, fontSize: 16, flexShrink: 0 }}>{"\u2192"}</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "rgba(232,230,225,0.4)", ...dm }}>
              单向转换 · 不向电网反向送电 · 避免反向潮流 · 简化电网管理
            </div>
          </div>
        </FadeIn>
      </section>

      {/* SCENARIOS */}
      <section id="scenarios" style={{ padding: "80px 24px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ ...mono, fontSize: 12, color: amber, letterSpacing: 4, marginBottom: 16 }}>02 — APPLICATION SCENARIOS</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, marginBottom: 60, lineHeight: 1.3 }}>三大应用场景</h2>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {scenarios.map((card, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="sc">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
                  <div style={{ ...dm, fontSize: 56, fontWeight: 700, color: card.accent, opacity: 0.2, lineHeight: 1, minWidth: 80 }}>{card.num}</div>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 14, color: "#fff" }}>{card.title}</h3>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
                      {card.tags.map((tg, j) => (
                        <span key={j} className="tag" style={{ background: card.accent + "15", color: card.accent, border: "1px solid " + card.accent + "30" }}>{tg}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {card.pts.map((p, j) => (
                        <div key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, lineHeight: 1.7, color: "rgba(232,230,225,0.65)", ...dm }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: card.accent, flexShrink: 0, marginTop: 8, opacity: 0.6 }} />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div style={{ marginTop: 50, background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.01))", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 16, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, color: green, ...mono, marginBottom: 6 }}>汉堡区域供热成效</div>
              <div style={{ fontSize: 15, color: "rgba(232,230,225,0.7)" }}>热损失率仅11%，2030年完全淘汰煤炭</div>
            </div>
            <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: green, fontWeight: 600, ...dm }}>
              电网始终稳定运行 {"\u2713"}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* SUPPORT SYSTEM */}
      <section id="support" style={{ padding: "80px 24px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ ...mono, fontSize: 12, color: amber, letterSpacing: 4, marginBottom: 16 }}>03 — SUPPORT SYSTEM</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>三大支撑体系</h2>
          <p style={{ fontSize: 16, lineHeight: 1.9, color: muted, maxWidth: 700, marginBottom: 50 }}>
            政策、技术、市场三大支撑体系协同发力，形成相互促进、良性循环的创新生态
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
          {pillars.map((pl, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="pc">
                <div style={{ fontSize: 36, marginBottom: 16 }}>{pl.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: pl.color }}>{pl.title}</h3>
                <div style={{ fontSize: 12, ...dm, color: "rgba(232,230,225,0.4)", marginBottom: 24, letterSpacing: 1 }}>{pl.sub}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {pl.items.map((it, j) => (
                    <div key={j}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(232,230,225,0.85)", marginBottom: 4 }}>{it.l}</div>
                      <div style={{ fontSize: 13, color: "rgba(232,230,225,0.45)", lineHeight: 1.6, ...dm }}>{it.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CHINA */}
      <section id="china" style={{ padding: "80px 24px 120px", maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ ...mono, fontSize: 12, color: amber, letterSpacing: 4, marginBottom: 16 }}>04 — IMPLICATIONS FOR CHINA</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, marginBottom: 50, lineHeight: 1.3 }}>对中国能源转型的借鉴</h2>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {chinaItems.map((it, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: "28px 24px", background: "linear-gradient(135deg, " + it.c + "0a, transparent)", borderLeft: "3px solid " + it.c, borderRadius: "0 12px 12px 0" }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: it.c, ...dm, lineHeight: 1, flexShrink: 0 }}>{it.n}</span>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{it.t}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: muted, ...dm }}>{it.d}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "50px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "rgba(232,230,225,0.25)", ...dm, lineHeight: 1.8 }}>
          基于微信公众号文章内容可视化呈现
        </div>
      </footer>
    </div>
  );
}
