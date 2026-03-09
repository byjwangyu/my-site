import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  {
    id: "hero",
    title: "OpenClaw",
    subtitle: "你的私人 AI 助手，全平台运行",
    emoji: "🦞",
    color: "#FF4136",
  },
  {
    id: "what",
    title: "它是什么？",
    icon: "💡",
  },
  {
    id: "arch",
    title: "架构概览",
    icon: "🏗️",
  },
  {
    id: "install",
    title: "快速上手",
    icon: "⚡",
  },
  {
    id: "channels",
    title: "支持渠道",
    icon: "💬",
  },
  {
    id: "skills",
    title: "Skills 技能系统",
    icon: "🧩",
  },
  {
    id: "usecases",
    title: "真实用例",
    icon: "🚀",
  },
  {
    id: "security",
    title: "安全提醒",
    icon: "🔒",
  },
];

const channels = [
  { name: "WhatsApp", color: "#25D366" },
  { name: "Telegram", color: "#0088CC" },
  { name: "Discord", color: "#5865F2" },
  { name: "Slack", color: "#4A154B" },
  { name: "Signal", color: "#3A76F0" },
  { name: "iMessage", color: "#34C759" },
  { name: "Teams", color: "#6264A7" },
  { name: "Google Chat", color: "#00AC47" },
  { name: "Matrix", color: "#0DBD8B" },
  { name: "IRC", color: "#888" },
  { name: "LINE", color: "#06C755" },
  { name: "WebChat", color: "#FF6B35" },
];

const useCases = [
  {
    title: "晨间简报",
    desc: "每天早上自动推送天气、日历、健康数据、待办事项和热门新闻摘要",
    tag: "个人效率",
    tagColor: "#FF6B35",
  },
  {
    title: "代码审查 & DevOps",
    desc: "自动化调试、GitHub Issue 管理、依赖扫描和部署流程",
    tag: "开发者",
    tagColor: "#5865F2",
  },
  {
    title: "邮件管理",
    desc: "自动过滤垃圾邮件、起草回复、跟踪重要邮件并设置提醒",
    tag: "工作流",
    tagColor: "#00AC47",
  },
  {
    title: "品牌舆情监控",
    desc: "定时搜索社交平台提及，分析情感倾向，标记需要回复的帖子",
    tag: "商业",
    tagColor: "#FF4136",
  },
  {
    title: "智能家居控制",
    desc: "通过对话控制 Hue 灯光、Home Assistant 设备和各类智能硬件",
    tag: "IoT",
    tagColor: "#FFB700",
  },
  {
    title: "浏览器自动化",
    desc: "自动填写表单、抓取网页数据、导航网站执行任务",
    tag: "自动化",
    tagColor: "#E040FB",
  },
];

const installSteps = [
  { cmd: "npm install -g openclaw@latest", desc: "全局安装 OpenClaw" },
  { cmd: "openclaw onboard --install-daemon", desc: "运行引导向导 + 安装守护进程" },
  { cmd: "openclaw dashboard", desc: "打开控制面板，开始对话" },
];

function FloatingParticle({ delay, size, x, duration }) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(255,65,54,0.08)",
        left: `${x}%`,
        bottom: "-20px",
        animation: `floatUp ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

function ArchDiagram() {
  const boxes = [
    { label: "你 (用户)", x: 180, y: 10, w: 140, h: 44, fill: "#FF4136", text: "#fff" },
    { label: "消息渠道", x: 30, y: 90, w: 120, h: 40, fill: "#FFB700", text: "#1a1a2e" },
    { label: "Gateway 网关", x: 180, y: 90, w: 140, h: 40, fill: "#1a1a2e", text: "#fff" },
    { label: "Skills 技能", x: 350, y: 90, w: 120, h: 40, fill: "#5865F2", text: "#fff" },
    { label: "LLM API", x: 120, y: 170, w: 120, h: 40, fill: "#0088CC", text: "#fff" },
    { label: "本地文件/工具", x: 270, y: 170, w: 130, h: 40, fill: "#00AC47", text: "#fff" },
  ];

  const arrows = [
    { x1: 250, y1: 54, x2: 250, y2: 88 },
    { x1: 178, y1: 110, x2: 152, y2: 110 },
    { x1: 322, y1: 110, x2: 348, y2: 110 },
    { x1: 220, y1: 130, x2: 180, y2: 168 },
    { x1: 280, y1: 130, x2: 320, y2: 168 },
  ];

  return (
    <svg viewBox="0 0 500 230" style={{ width: "100%", maxWidth: 520, display: "block", margin: "0 auto" }}>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#666" />
        </marker>
      </defs>
      {arrows.map((a, i) => (
        <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#666" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
      ))}
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" fill={b.fill} />
          <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 5} textAnchor="middle" fill={b.text} fontSize="13" fontWeight="600" fontFamily="'Noto Sans SC', sans-serif">
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function NavDot({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: active ? 28 : 10,
        height: 10,
        borderRadius: 5,
        border: "none",
        background: active ? "#FF4136" : "rgba(255,255,255,0.2)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        padding: 0,
      }}
    />
  );
}

export default function OpenClawIntro() {
  const [activeSection, setActiveSection] = useState(0);
  const [entered, setEntered] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setEntered(true), 100);
  }, []);

  const goTo = (i) => setActiveSection(i);
  const next = () => setActiveSection((p) => Math.min(p + 1, SECTIONS.length - 1));
  const prev = () => setActiveSection((p) => Math.max(p - 1, 0));

  const section = SECTIONS[activeSection];

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "'Noto Sans SC', 'DM Sans', sans-serif",
        background: "linear-gradient(145deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#e0e0e0",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes lobsterWave {
          0%,100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(255,65,54,0.15); }
        .cmd-line:hover { background: rgba(255,65,54,0.08) !important; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,65,54,0.3); border-radius: 4px; }
      `}</style>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <FloatingParticle key={i} delay={i * 2} size={6 + i * 4} x={10 + i * 12} duration={12 + i * 3} />
      ))}

      {/* Top nav dots */}
      <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 100, background: "rgba(13,13,26,0.8)", backdropFilter: "blur(10px)", padding: "8px 16px", borderRadius: 20 }}>
        {SECTIONS.map((s, i) => (
          <NavDot key={s.id} active={activeSection === i} label={s.title} onClick={() => goTo(i)} />
        ))}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 100px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div key={activeSection} style={{ animation: "slideIn 0.5s ease" }}>

          {/* HERO */}
          {section.id === "hero" && (
            <div style={{ textAlign: "center", paddingTop: 40 }}>
              <div style={{ fontSize: 80, animation: "lobsterWave 3s ease-in-out infinite", display: "inline-block" }}>🦞</div>
              <h1 style={{ fontSize: 56, fontWeight: 700, color: "#FF4136", margin: "16px 0 0", letterSpacing: "-2px", lineHeight: 1.1 }}>OpenClaw</h1>
              <p style={{ fontSize: 14, color: "#888", marginTop: 6, letterSpacing: 4, textTransform: "uppercase" }}>formerly Clawdbot → Moltbot → OpenClaw</p>
              <p style={{ fontSize: 22, color: "#ccc", marginTop: 24, lineHeight: 1.6, fontWeight: 400 }}>
                你的私人开源 AI 助手<br />在你自己的设备上运行，通过你常用的聊天工具交互
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
                {[
                  { num: "247K+", label: "GitHub Stars" },
                  { num: "1700+", label: "社区 Skills" },
                  { num: "22+", label: "聊天渠道" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "rgba(255,65,54,0.08)", border: "1px solid rgba(255,65,54,0.2)", borderRadius: 16, padding: "20px 28px", minWidth: 130 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#FF4136" }}>{s.num}</div>
                    <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WHAT */}
          {section.id === "what" && (
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>💡 它是什么？</h2>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32, lineHeight: 2, fontSize: 16 }}>
                <p style={{ margin: "0 0 16px" }}>
                  <strong style={{ color: "#FF4136" }}>OpenClaw</strong> 是由 Peter Steinberger 创建的开源个人 AI 助手项目。它运行在你自己的设备上，通过你已经在用的消息应用（WhatsApp、Telegram、Discord 等）来与你交互。
                </p>
                <p style={{ margin: "0 0 16px" }}>
                  它不只是一个聊天机器人——它是一个<strong style={{ color: "#FFB700" }}>主动式 Agent</strong>，可以执行 shell 命令、控制浏览器、管理文件、调用 API，甚至在你不在时自主运行任务。
                </p>
                <p style={{ margin: 0 }}>
                  它是<strong style={{ color: "#5865F2" }}>模型无关的</strong>——你可以接入 Claude、GPT、DeepSeek 或本地模型，使用你自己的 API Key，数据全部保存在本地。
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
                {[
                  { icon: "🏠", text: "本地运行，数据私有" },
                  { icon: "🔌", text: "模型无关，自带 Key" },
                  { icon: "🤖", text: "主动执行，24/7 在线" },
                  { icon: "🛠️", text: "可扩展 Skills 生态" },
                ].map((f) => (
                  <div key={f.text} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{f.icon}</span>
                    <span style={{ fontSize: 14, color: "#ccc" }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ARCH */}
          {section.id === "arch" && (
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>🏗️ 架构概览</h2>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 20px" }}>
                <ArchDiagram />
              </div>
              <div style={{ marginTop: 20, lineHeight: 1.9, fontSize: 15, color: "#bbb" }}>
                <p><strong style={{ color: "#FF4136" }}>Gateway（网关）</strong>是核心控制平面，负责消息路由、会话管理、模型调用和 Skills 执行。它以 Node.js 服务形式运行，支持 systemd/launchd 守护进程。</p>
                <p style={{ marginTop: 12 }}><strong style={{ color: "#FFB700" }}>消息渠道</strong>是你和 OpenClaw 交互的入口——WhatsApp、Telegram、Discord 等 22+ 平台，以及内置 WebChat。</p>
                <p style={{ marginTop: 12 }}><strong style={{ color: "#5865F2" }}>Skills</strong> 是可插拔的能力模块，赋予 OpenClaw 浏览器控制、文件管理、API 调用等各种能力。</p>
              </div>
            </div>
          )}

          {/* INSTALL */}
          {section.id === "install" && (
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>⚡ 快速上手</h2>
              <p style={{ color: "#999", marginBottom: 8, fontSize: 14 }}>前置要求：Node.js ≥ 22</p>
              <div style={{ background: "#0a0a14", border: "1px solid rgba(255,65,54,0.2)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }} />
                </div>
                {installSteps.map((step, i) => (
                  <div key={i} className="cmd-line" style={{ padding: "16px 20px", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.2s" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#27C93F" }}>
                      <span style={{ color: "#FF4136", marginRight: 8 }}>$</span>{step.cmd}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6, paddingLeft: 18 }}># {step.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, background: "rgba(255,183,0,0.06)", border: "1px solid rgba(255,183,0,0.2)", borderRadius: 12, padding: "16px 20px", fontSize: 14, color: "#ddd", lineHeight: 1.8 }}>
                <strong style={{ color: "#FFB700" }}>💡 小贴士：</strong>引导向导（onboard wizard）会一步步引导你完成网关配置、工作区设置、渠道绑定和技能安装。完成后访问 <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>http://127.0.0.1:18789</code> 即可开始使用。
              </div>
            </div>
          )}

          {/* CHANNELS */}
          {section.id === "channels" && (
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>💬 支持的消息渠道</h2>
              <p style={{ color: "#999", marginBottom: 20, fontSize: 15, lineHeight: 1.7 }}>OpenClaw 支持 22+ 消息平台作为交互入口，你在哪里聊天，它就在哪里响应。</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {channels.map((ch) => (
                  <div key={ch.name} style={{ background: `${ch.color}18`, border: `1px solid ${ch.color}40`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 500, color: ch.color, transition: "transform 0.2s", cursor: "default" }}>
                    {ch.name}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, fontSize: 14, color: "#aaa", lineHeight: 1.8 }}>
                此外还支持 Feishu（飞书）、Mattermost、Nextcloud Talk、Nostr、Synology Chat、Twitch、Zalo 等。还有内置 WebChat 和 Control UI 面板——无需任何第三方渠道也可立即开始使用。
              </div>
            </div>
          )}

          {/* SKILLS */}
          {section.id === "skills" && (
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>🧩 Skills 技能系统</h2>
              <p style={{ color: "#bbb", marginBottom: 20, fontSize: 15, lineHeight: 1.8 }}>
                Skills 是 OpenClaw 的能力扩展单元——类似插件，但更强大。社区已有 1700+ Skills 可用。
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { icon: "📦", title: "Bundled", desc: "内置技能，开箱即用" },
                  { icon: "🌐", title: "Managed", desc: "社区维护，一键安装" },
                  { icon: "🔧", title: "Workspace", desc: "自定义技能，按需创建" },
                ].map((sk) => (
                  <div key={sk.title} className="card-hover" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, textAlign: "center", transition: "all 0.3s" }}>
                    <div style={{ fontSize: 32 }}>{sk.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginTop: 10 }}>{sk.title}</div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>{sk.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, fontSize: 14, color: "#aaa", lineHeight: 1.9 }}>
                <strong style={{ color: "#E040FB" }}>核心能力示例：</strong>浏览器控制（Chrome/Chromium snapshots & actions）、Canvas 渲染、摄像头/屏幕录制、定时任务（Cron）、Webhook 监听、Gmail Pub/Sub 等。
              </div>
              <div style={{ marginTop: 16, fontSize: 14, color: "#aaa", lineHeight: 1.9 }}>
                <strong style={{ color: "#00AC47" }}>用自然语言创建技能：</strong>你甚至可以直接告诉 OpenClaw 你想要什么能力，它会自动创建对应的 Skill 并热加载。
              </div>
            </div>
          )}

          {/* USE CASES */}
          {section.id === "usecases" && (
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>🚀 真实用例</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {useCases.map((uc) => (
                  <div key={uc.title} className="card-hover" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", transition: "all 0.3s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{uc.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: uc.tagColor, background: `${uc.tagColor}18`, padding: "3px 10px", borderRadius: 20 }}>{uc.tag}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#999", margin: 0, lineHeight: 1.7 }}>{uc.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#666" }}>
                以上仅为冰山一角——社区还有自动交易、视频制作、客户 onboarding、遛狗时语音部署等各种玩法
              </div>
            </div>
          )}

          {/* SECURITY */}
          {section.id === "security" && (
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>🔒 安全提醒</h2>
              <div style={{ background: "rgba(255,65,54,0.06)", border: "1px solid rgba(255,65,54,0.2)", borderRadius: 16, padding: 28, lineHeight: 2, fontSize: 15 }}>
                {[
                  { icon: "⚠️", text: "第三方 Skills 可能存在安全漏洞——安装前务必审查源码" },
                  { icon: "🔑", text: "切勿在 Skill 中硬编码 API Key 或凭据" },
                  { icon: "👤", text: "以非 root 用户运行，限制 Shell 命令权限" },
                  { icon: "🧪", text: "Cisco 安全团队曾发现恶意 Skill 进行数据泄露和 Prompt 注入" },
                  { icon: "📖", text: "社区维护者警告：如果你不能理解命令行操作，这个项目对你来说风险太大" },
                ].map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < 4 ? 14 : 0 }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{w.icon}</span>
                    <span style={{ color: "#ddd" }}>{w.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28, textAlign: "center" }}>
                <div style={{ fontSize: 48, animation: "lobsterWave 3s ease-in-out infinite", display: "inline-block" }}>🦞</div>
                <p style={{ color: "#888", marginTop: 12, fontSize: 15 }}>
                  了解更多：<span style={{ color: "#FF4136", fontWeight: 600 }}>openclaw.ai</span> · <span style={{ color: "#FF4136", fontWeight: 600 }}>github.com/openclaw/openclaw</span> · <span style={{ color: "#FF4136", fontWeight: 600 }}>docs.openclaw.ai</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(13,13,26,0.9)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        zIndex: 100,
      }}>
        <button onClick={prev} disabled={activeSection === 0} style={{
          background: activeSection === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,65,54,0.15)",
          color: activeSection === 0 ? "#555" : "#FF4136",
          border: "none", borderRadius: 10, padding: "10px 24px",
          fontWeight: 600, fontSize: 14, cursor: activeSection === 0 ? "default" : "pointer",
          fontFamily: "'Noto Sans SC', 'DM Sans', sans-serif",
        }}>
          ← 上一页
        </button>
        <span style={{ fontSize: 13, color: "#555" }}>{activeSection + 1} / {SECTIONS.length}</span>
        <button onClick={next} disabled={activeSection === SECTIONS.length - 1} style={{
          background: activeSection === SECTIONS.length - 1 ? "rgba(255,255,255,0.05)" : "#FF4136",
          color: activeSection === SECTIONS.length - 1 ? "#555" : "#fff",
          border: "none", borderRadius: 10, padding: "10px 24px",
          fontWeight: 600, fontSize: 14, cursor: activeSection === SECTIONS.length - 1 ? "default" : "pointer",
          fontFamily: "'Noto Sans SC', 'DM Sans', sans-serif",
        }}>
          下一页 →
        </button>
      </div>
    </div>
  );
}
