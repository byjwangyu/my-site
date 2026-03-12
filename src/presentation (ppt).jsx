import { useState, useEffect, useCallback } from "react";

const S = {
  sans: "'Noto Sans SC', sans-serif",
  mono: "'JetBrains Mono', monospace",
  bg: '#0a0a0f',
  indigo: '#6366f1',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  cyan: '#06b6d4',
};

function SlideHeader({ num, title, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexShrink: 0 }}>
      <span style={{
        fontSize: 12, color: S.indigo, fontFamily: S.mono,
        padding: '4px 10px', borderRadius: 6,
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)',
        animation: active ? 'pulseGlow 2s ease-in-out infinite' : 'none',
      }}>{num}</span>
      <h2 style={{
        fontSize: 26, fontWeight: 700, color: '#e2e8f0', margin: 0, fontFamily: S.sans,
        animation: active ? 'fadeSlideRight 0.6s ease-out both' : 'none',
      }}>{title}</h2>
    </div>
  );
}

function Tag({ children, color = S.indigo, delay = 0, active = true }) {
  return (
    <span style={{
      padding: '5px 14px', borderRadius: 20, fontSize: 12,
      background: `${color}18`, border: `1px solid ${color}30`,
      color: `${color}cc`, fontFamily: S.sans,
      transition: 'all 0.3s ease',
      animation: active ? `popIn 0.4s ease-out ${delay}s both` : 'none',
    }}>{children}</span>
  );
}

function Card({ children, color = S.indigo, style: s, anim, glow }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 14,
      background: `${color}0a`, border: `1px solid ${color}25`,
      animation: anim || 'none',
      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      ...(glow ? { boxShadow: `0 0 20px ${color}15` } : {}),
      ...s,
    }}>{children}</div>
  );
}

function Fa(active, delay = 0) {
  return active ? `fadeUp 0.5s ease-out ${delay}s both` : 'none';
}
function FaLeft(active, delay = 0) {
  return active ? `fadeSlideRight 0.6s ease-out ${delay}s both` : 'none';
}
function FaScale(active, delay = 0) {
  return active ? `scaleIn 0.5s ease-out ${delay}s both` : 'none';
}

// Floating particles for cover
function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: Math.random() * 3 + 1,
          height: Math.random() * 3 + 1,
          borderRadius: '50%',
          background: i % 3 === 0 ? 'rgba(99,102,241,0.4)' : i % 3 === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 4}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

const SLIDES = [
  // 0: Cover - enhanced
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", position:"relative", overflow:"hidden" }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.1) 0%, transparent 50%), #0a0a0f',
        }} />
        {a && <Particles />}
        {/* Animated rings */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, border: '1px solid rgba(99,102,241,0.1)', borderRadius: '50%', animation: a ? 'spin 30s linear infinite' : 'none' }} />
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, border: '1px dashed rgba(99,102,241,0.05)', borderRadius: '50%', animation: a ? 'spin 20s linear infinite reverse' : 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 200, height: 200, border: '1px solid rgba(16,185,129,0.08)', borderRadius: '50%', animation: a ? 'spin 20s linear infinite reverse' : 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 240, height: 240, border: '1px dashed rgba(16,185,129,0.04)', borderRadius: '50%', animation: a ? 'spin 25s linear infinite' : 'none' }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', animation: a ? 'breathe 4s ease-in-out infinite' : 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', animation: a ? 'breathe 5s ease-in-out 1s infinite' : 'none' }} />

        <div style={{ position:"relative", zIndex:10, textAlign:"center" }}>
          {/* Badge */}
          <div style={{
            fontSize: 14, letterSpacing: 6, color: S.indigo, marginBottom: 28, fontFamily: S.mono, textTransform: 'uppercase',
            animation: a ? 'fadeUp 0.6s ease-out 0.1s both, shimmer 3s ease-in-out infinite' : 'none',
          }}>实战指南 2026</div>

          {/* Main title with animated gradient */}
          <h1 style={{
            fontSize: 56, fontWeight: 800, lineHeight: 1.15, fontFamily: S.sans, marginBottom: 24,
            backgroundSize: '200% 200%',
            backgroundImage: 'linear-gradient(135deg, #e2e8f0 0%, #6366f1 25%, #10b981 50%, #f59e0b 75%, #e2e8f0 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: a ? 'fadeUp 0.8s ease-out 0.2s both, gradientShift 6s ease infinite' : 'none',
          }}>AI 办公实战指南</h1>

          {/* Subtitle with staggered words */}
          <div style={{ fontSize: 20, maxWidth: 540, margin: '0 auto 36px', fontFamily: S.sans, lineHeight: 1.8 }}>
            {['从「网页聊天」', '到「编程工具」', '再到「AI Agent」'].map((t, i) => (
              <span key={i} style={{
                display: 'inline-block', margin: '0 4px',
                color: i === 0 ? '#a5b4fc' : i === 1 ? '#6ee7b7' : '#fbbf24',
                animation: a ? `fadeUp 0.5s ease-out ${0.4 + i * 0.15}s both` : 'none',
              }}>{t}</span>
            ))}
            <br />
            <span style={{
              color: '#94a3b8',
              animation: a ? 'fadeUp 0.5s ease-out 0.9s both' : 'none',
              display: 'inline-block',
            }}>逐步解锁 AI 的真正办公生产力</span>
          </div>

          {/* CTA with pulse */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 30,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            color: '#a5b4fc', fontSize: 13, fontFamily: S.mono,
            animation: a ? 'fadeUp 0.5s ease-out 1.1s both, pulseGlow 3s ease-in-out 2s infinite' : 'none',
          }}>
            <span style={{ animation: a ? 'bounceX 1.5s ease-in-out 2s infinite' : 'none', display: 'inline-block' }}>←</span>
            → 方向键翻页 · 点击底部导航
          </div>
        </div>
      </div>
    ),
  },
  // 1: Four Stages
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="01" title="AI办公的四个阶段" active={a} />
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ display: 'flex', gap: 20, maxWidth: 960, width: '100%' }}>
            {[
              { level: '第一层', title: '网页对话', tools: '豆包·Kimi·DeepSeek', items: ['问答', '翻译', '写文案'], color: S.indigo, icon: '💬' },
              { level: '第二层', title: 'Markdown 工具链', tools: 'Obsidian·Mermaid·Typora', items: ['知识管理', '轻量可视化', '结构化'], color: S.green, icon: '📝' },
              { level: '第三层', title: 'Cursor / OpenCode', tools: 'AI 编程工具', items: ['操作文件', '生成文档', '数据处理'], color: S.amber, icon: '⚡' },
              { level: '第四层', title: 'OpenClaw', tools: 'AI Agent · 自主执行', items: ['全自动化', '跨平台', '7×24运行'], color: S.red, icon: '🦞' },
            ].map((s, i) => (
              <div key={i} style={{ 
                flex: 1, padding: '24px 20px', borderRadius: 16,
                background: `${s.color}0a`, border: `1px solid ${s.color}25`,
                display: 'flex', flexDirection: 'column', gap: 12,
                animation: a ? `scaleIn 0.5s ease-out ${i * 0.12}s both` : 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative', overflow: 'hidden',
               }}>
                {/* Top glow bar */}
                <div style={{
                  position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
                  background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)`,
                  animation: a ? `shimmerBar 2s ease-in-out ${i * 0.3 + 1}s infinite` : 'none',
                }} />
                <div style={{ fontSize: 32, animation: a ? `bounceIn 0.6s ease-out ${i * 0.12 + 0.3}s both` : 'none' }}>{s.icon}</div>
                <div style={{ fontSize: 10, letterSpacing: 3, color: s.color, fontFamily: S.mono, textTransform: 'uppercase' }}>{s.level}</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#e2e8f0', fontFamily: S.sans }}>{s.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: S.mono }}>{s.tools}</div>
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {s.items.map((t, j) => (
                    <div key={j} style={{
                      fontSize: 13, color: '#94a3b8', paddingLeft: 10, borderLeft: `2px solid ${s.color}30`, fontFamily: S.sans,
                      animation: a ? `fadeSlideRight 0.4s ease-out ${i * 0.12 + 0.5 + j * 0.08}s both` : 'none',
                    }}>{t}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          textAlign: 'center', color: '#475569', fontSize: 13, fontFamily: S.sans,
          animation: a ? 'fadeUp 0.5s ease-out 0.8s both' : 'none',
        }}>大多数人还停留在第一层 — 真正的生产力在后面三层</div>
      </div>
    ),
  },
  // 2: Web AI
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="02" title="网页版AI — 入门好用，但有天花板" active={a} />
        <div style={{ flex:1, display:"flex", gap:40, alignItems:"center" }}>
          <div style={{ flex: 1, animation: FaLeft(a) }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: S.indigo, marginBottom: 10, fontFamily: S.mono }}>主流工具</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['豆包', 'Kimi', 'DeepSeek', '通义千问', '文心一言'].map((t, i) => <Tag key={i} color={S.indigo} delay={0.1 + i * 0.06} active={a}>{t}</Tag>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: S.green, marginBottom: 10, fontFamily: S.mono, animation: a ? 'fadeUp 0.4s ease-out 0.4s both' : 'none' }}>✓ 能做的</div>
              {['问答与知识查询', '翻译与润色文案', '总结长文 / 分析材料', '头脑风暴 / 写邮件'].map((t, i) => (
                <div key={i} style={{
                  fontSize: 14, color: '#cbd5e1', paddingLeft: 14, borderLeft: `2px solid ${S.green}40`, marginBottom: 8, fontFamily: S.sans,
                  animation: a ? `fadeSlideRight 0.4s ease-out ${0.5 + i * 0.08}s both` : 'none',
                }}>{t}</div>
              ))}
            </div>
          </div>
          <Card color={S.red} style={{ flex: 1, padding: 28, position: 'relative', overflow: 'hidden' }} anim={FaScale(a, 0.3)} glow>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${S.red}40, transparent)`, animation: a ? 'shimmerBar 3s ease-in-out infinite' : 'none' }} />
            <div style={{ fontSize: 13, color: S.red, marginBottom: 16, fontFamily: S.mono }}>✗ 天花板</div>
            {['不能操作本地文件', '不能运行代码', '不能批量处理数据', '输出只有纯文字', '无法生成 Word / PPT / Excel'].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#fca5a5', fontFamily: S.sans, marginBottom: 10,
                animation: a ? `fadeSlideRight 0.4s ease-out ${0.5 + i * 0.08}s both` : 'none',
              }}>🚫 {t}</div>
            ))}
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: `${S.red}10`, fontSize: 13, color: '#f87171', fontFamily: S.sans, animation: a ? 'pulseGlow 3s ease-in-out 1.5s infinite' : 'none' }}>
              定位：日常轻量办公的起点，但远不是终点
            </div>
          </Card>
        </div>
      </div>
    ),
  },
  // 3: Markdown intro
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="03" title="Markdown — 被严重低估的办公格式" active={a} />
        <div style={{ flex:1, display:"flex", gap:40, alignItems:"center" }}>
          <div style={{ flex: 1, animation: Fa(a) }}>
            <div style={{
              padding: 22, borderRadius: 12, marginBottom: 20,
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
              fontFamily: S.mono, fontSize: 13, color: '#a5b4fc', lineHeight: 2, whiteSpace: 'pre',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${S.indigo}40, transparent)`, animation: a ? 'shimmerBar 3s ease-in-out infinite' : 'none' }} />
{`# 会议纪要
## 日期：2026-03-12

### 决议事项
- **项目A**: 下周完成原型
- **项目B**: 需要追加预算
- [ ] 待办：整理需求文档

> 备注：详见附件数据`}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['纯文本', '通用格式', '版本可控', 'AI友好'].map((t, i) => <Tag key={i} color={S.green} delay={0.3 + i * 0.08} active={a}>{t}</Tag>)}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, animation: Fa(a, 0.2) }}>
            <div style={{ fontSize: 16, color: '#e2e8f0', fontWeight: 600, fontFamily: S.sans }}>为什么 Markdown 是 AI 办公的最佳载体？</div>
            {[
              { title: 'AI原生输出', desc: '所有AI工具的默认输出格式就是Markdown' },
              { title: '二次加工友好', desc: '纯文本，任何工具都能打开、编辑、转换' },
              { title: '版本管理', desc: '配合Git，文档变更一目了然' },
              { title: '万物可转', desc: '可转为 Word、PDF、PPT、HTML、博客文章' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '12px 16px', borderRadius: 10, background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(71,85,105,0.2)',
                animation: a ? `fadeSlideRight 0.5s ease-out ${0.3 + i * 0.1}s both` : 'none',
                transition: 'transform 0.2s ease',
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: S.indigo, marginBottom: 3, fontFamily: S.sans }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: S.sans }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  // 4: Markdown tools
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="04" title="Markdown 工具生态 — 让 .md 真正好用" active={a} />
        <div style={{ flex:1, display:"flex", gap:32, alignItems:"flex-start",  marginTop: 8  }}>
          <div style={{
            flex: 2, padding: 24, borderRadius: 16,
            background: `linear-gradient(135deg, ${S.purple}10 0%, ${S.indigo}08 100%)`,
            border: `1px solid ${S.purple}30`, animation: FaScale(a, 0.1),
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 20%, ${S.purple}08 0%, transparent 50%)`, animation: a ? 'breathe 4s ease-in-out infinite' : 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: `${S.purple}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  animation: a ? 'bounceIn 0.6s ease-out 0.3s both, float 3s ease-in-out 1s infinite alternate' : 'none',
                }}>💎</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', fontFamily: S.sans }}>Obsidian</div>
                  <div style={{ fontSize: 12, color: S.purple, fontFamily: S.mono, animation: a ? 'shimmer 3s ease-in-out infinite' : 'none' }}>核心推荐 · 知识管理神器</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { icon: '🔗', title: '双向链接', desc: '笔记互相关联，形成知识网络' },
                  { icon: '🌐', title: '图谱视图', desc: '可视化你的整个知识结构' },
                  { icon: '💾', title: '本地存储', desc: '数据在自己手里，不依赖云端' },
                  { icon: '🧩', title: '插件生态', desc: 'Mermaid、看板、Dataview...' },
                ].map((f, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: 10, background: `${S.purple}08`,
                    animation: a ? `scaleIn 0.4s ease-out ${0.4 + i * 0.1}s both` : 'none',
                  }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{f.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 2, fontFamily: S.sans }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: '#7c7c9a', fontFamily: S.sans }}>{f.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: `${S.purple}0a`, borderLeft: `3px solid ${S.purple}50`, fontSize: 13, color: '#a78bfa', fontFamily: S.sans, animation: a ? 'fadeUp 0.5s ease-out 0.8s both' : 'none' }}>
                最佳实践：AI生成内容 → 存入Obsidian → 逐步构建个人知识库
              </div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, animation: Fa(a, 0.15) }}>
            {[
              { name: 'Typora', desc: '所见即所得，写长文档首选', color: S.green, icon: '✍️' },
              { name: 'VS Code', desc: '程序员首选，MD + Mermaid', color: S.blue, icon: '🔧' },
              { name: '思源笔记', desc: '国产替代，块引用，中文友好', color: S.amber, icon: '📖' },
            ].map((t, i) => (
              <Card key={i} color={t.color} anim={a ? `fadeSlideRight 0.5s ease-out ${0.3 + i * 0.12}s both` : 'none'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: t.color, fontFamily: S.sans }}>{t.name}</span>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: S.sans }}>{t.desc}</div>
              </Card>
            ))}
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(30,41,59,0.5)', fontSize: 12, color: '#64748b', lineHeight: 1.7, fontFamily: S.sans, animation: a ? 'fadeUp 0.5s ease-out 0.7s both' : 'none' }}>
              💡 不懂代码 → Obsidian / Typora<br />懂代码 → VS Code<br />偏好国产 → 思源笔记
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // 5: Mermaid
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="05" title="Mermaid — 纯文本画图，轻量可视化" active={a} />
        <div style={{ flex:1, display:"flex", gap:32,  marginTop: 4  }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, animation: FaLeft(a) }}>
            <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: S.sans, marginBottom: 2 }}>写几行文字 → 自动生成专业图表</div>
            {[
              { type: '流程图', code: 'graph LR\n  A[需求] --> B[设计]\n  B --> C[开发] --> D[上线]', use: '审批流程·业务流程' },
              { type: '时序图', code: 'sequenceDiagram\n  用户->>服务器: 请求\n  服务器->>数据库: 查询\n  数据库-->>用户: 返回', use: '系统交互·API调用' },
              { type: '甘特图', code: 'gantt\n  title 项目排期\n  设计 :a1, 2026-03-01, 7d\n  开发 :after a1, 14d', use: '项目管理·里程碑' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: 10, background: `${S.indigo}08`, border: `1px solid ${S.indigo}15`,
                animation: a ? `fadeSlideRight 0.5s ease-out ${0.2 + i * 0.12}s both` : 'none',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, transparent, ${S.indigo}60, transparent)`, animation: a ? 'shimmerV 2s ease-in-out infinite' : 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#a5b4fc', fontFamily: S.sans }}>{item.type}</span>
                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: S.mono }}>{item.use}</span>
                </div>
                <pre style={{ fontSize: 11, color: '#6ee7b7', lineHeight: 1.5, fontFamily: S.mono, margin: 0, whiteSpace: 'pre-wrap' }}>{item.code}</pre>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, animation: Fa(a, 0.2) }}>
            <Card color={S.green} anim={FaScale(a, 0.3)}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6ee7b7', marginBottom: 10, fontFamily: S.sans }}>还能画</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {['思维导图', '饼图', '类图', '状态图', 'ER图', '用户旅程'].map((t, i) => (
                  <div key={i} style={{
                    padding: '6px 10px', borderRadius: 6, textAlign: 'center', background: `${S.green}08`, fontSize: 12, color: '#94a3b8', fontFamily: S.sans,
                    animation: a ? `popIn 0.3s ease-out ${0.5 + i * 0.06}s both` : 'none',
                  }}>{t}</div>
                ))}
              </div>
            </Card>
            <Card color={S.amber} anim={FaScale(a, 0.4)}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fbbf24', marginBottom: 10, fontFamily: S.sans }}>比 Visio / PPT 画图更快</div>
              {['AI 一句话生成完整图表', '纯文本，随时修改', 'Obsidian 直接预览', '版本可控，Git 友好'].map((t, i) => (
                <div key={i} style={{
                  fontSize: 13, color: '#d4d4d8', paddingLeft: 12, borderLeft: `2px solid ${S.amber}25`, marginBottom: 6, fontFamily: S.sans,
                  animation: a ? `fadeSlideRight 0.4s ease-out ${0.6 + i * 0.08}s both` : 'none',
                }}>{t}</div>
              ))}
            </Card>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(30,41,59,0.5)', fontSize: 12, color: '#6ee7b7', fontFamily: S.mono, lineHeight: 1.7, animation: a ? 'fadeUp 0.5s ease-out 0.9s both' : 'none' }}>
              在 Obsidian 中用 ```mermaid 代码块<br />即可直接渲染图表 ✓
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // 6: Mermaid examples
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="06" title="Mermaid 实战示例" active={a} />
        <div style={{ flex:1, display:"flex", gap:32,  marginTop: 4  }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, animation: FaLeft(a) }}>
            <div style={{ fontSize: 13, color: S.indigo, marginBottom: 2, fontFamily: S.mono }}>思维导图 — 业务梳理</div>
            <div style={{
              padding: 14, borderRadius: 10, background: '#0d1117', border: `1px solid ${S.indigo}15`,
              fontFamily: S.mono, fontSize: 11, lineHeight: 1.7, color: '#6ee7b7',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${S.indigo}50, transparent)`, animation: a ? 'shimmerBar 2.5s ease-in-out infinite' : 'none' }} />
{`mindmap
  root((AI办公))
    网页AI
      豆包
      Kimi
      DeepSeek
    工具链
      Markdown
      Mermaid
      Obsidian
    编程工具
      Cursor
      OpenCode
    Agent
      OpenClaw`}
            </div>
            <div style={{ fontSize: 13, color: S.blue, marginBottom: 2, fontFamily: S.mono }}>饼图 — 数据占比</div>
            <div style={{ padding: 14, borderRadius: 10, background: '#0d1117', border: `1px solid ${S.blue}15`, fontFamily: S.mono, fontSize: 11, lineHeight: 1.7, color: '#6ee7b7' }}>
{`pie title 办公时间分配
  "文档处理" : 30
  "数据分析" : 25
  "沟通协调" : 20
  "创意策划" : 15
  "其他" : 10`}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, animation: Fa(a, 0.15) }}>
            <div style={{ fontSize: 13, color: S.green, marginBottom: 2, fontFamily: S.mono }}>状态图 — 审批流程</div>
            <div style={{ padding: 14, borderRadius: 10, background: '#0d1117', border: `1px solid ${S.green}15`, fontFamily: S.mono, fontSize: 11, lineHeight: 1.7, color: '#6ee7b7' }}>
{`stateDiagram-v2
  [*] --> 草稿
  草稿 --> 待审批: 提交
  待审批 --> 已通过: 批准
  待审批 --> 已驳回: 驳回
  已驳回 --> 草稿: 修改
  已通过 --> [*]`}
            </div>
            <Card color={S.amber} style={{ flex: 1 }} anim={FaScale(a, 0.3)}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fbbf24', marginBottom: 10, fontFamily: S.sans }}>使用技巧</div>
              {[
                '让AI帮你写：「画一个XX的流程图」',
                '复制代码到 Obsidian 即可预览',
                '修改文字内容即可更新图表',
                '搭配 Markdown 文档，图文并茂',
                '导出为 SVG/PNG 可插入 PPT',
              ].map((t, i) => (
                <div key={i} style={{
                  fontSize: 12, color: '#d4d4d8', paddingLeft: 12, borderLeft: `2px solid ${S.amber}25`, marginBottom: 7, fontFamily: S.sans,
                  animation: a ? `fadeSlideRight 0.4s ease-out ${0.5 + i * 0.08}s both` : 'none',
                }}>{t}</div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    ),
  },
  // 7: Python vis
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="07" title="复杂可视化 — Python 出场" active={a} />
        <div style={{ flex:1, display:"flex", gap:32,  marginTop: 4  }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, animation: FaLeft(a) }}>
            <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: S.sans }}>Mermaid 搞不定时 — 数据图表、统计分析</div>
            <div style={{
              padding: 18, borderRadius: 12, background: '#0d1117', border: `1px solid ${S.indigo}20`,
              fontFamily: S.mono, fontSize: 12, lineHeight: 1.8, color: '#e6edf3',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${S.blue}60, ${S.green}60, ${S.amber}60)`, animation: a ? 'shimmerV 3s ease-in-out infinite' : 'none' }} />
              <div style={{ color: '#7ee787' }}># 从 Excel 到可视化，几行搞定</div>
              <div><span style={{ color: '#ff7b72' }}>import</span> pandas <span style={{ color: '#ff7b72' }}>as</span> pd</div>
              <div><span style={{ color: '#ff7b72' }}>import</span> matplotlib.pyplot <span style={{ color: '#ff7b72' }}>as</span> plt</div>
              <br />
              <div>df = pd.read_excel(<span style={{ color: '#a5d6ff' }}>"销售数据.xlsx"</span>)</div>
              <div>df.groupby(<span style={{ color: '#a5d6ff' }}>"月份"</span>)[<span style={{ color: '#a5d6ff' }}>"销售额"</span>]</div>
              <div>  .sum().plot(kind=<span style={{ color: '#a5d6ff' }}>"bar"</span>)</div>
              <div>plt.savefig(<span style={{ color: '#a5d6ff' }}>"报表.png"</span>)</div>
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: 8, background: `${S.green}0a`, border: `1px solid ${S.green}15`,
              fontSize: 13, color: '#6ee7b7', fontFamily: S.sans,
              animation: a ? 'pulseGlow 3s ease-in-out 1s infinite' : 'none',
            }}>
              你不需要会写代码 — 让 AI 替你写！
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, animation: Fa(a, 0.15) }}>
            {[
              { lib: 'matplotlib / seaborn', desc: '柱状图、折线图、热力图', color: S.blue, tags: ['静态图表', '论文级', '可定制'] },
              { lib: 'pandas', desc: 'Excel 数据清洗、分析、转换', color: S.green, tags: ['读写Excel', '数据透视表', '批量处理'] },
              { lib: 'plotly', desc: '交互式图表，可嵌入网页', color: S.amber, tags: ['悬停数据', '缩放拖拽', '仪表盘'] },
            ].map((item, i) => (
              <Card key={i} color={item.color} anim={a ? `scaleIn 0.4s ease-out ${0.3 + i * 0.12}s both` : 'none'}>
                <div style={{ fontSize: 14, fontWeight: 600, color: item.color, fontFamily: S.mono, marginBottom: 4 }}>{item.lib}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, fontFamily: S.sans }}>{item.desc}</div>
                <div style={{ display: 'flex', gap: 6 }}>{item.tags.map((t, j) => <Tag key={j} color={item.color} delay={0.5 + i * 0.12 + j * 0.05} active={a}>{t}</Tag>)}</div>
              </Card>
            ))}
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(30,41,59,0.5)', fontSize: 12, color: '#94a3b8', fontFamily: S.sans, animation: a ? 'fadeUp 0.5s ease-out 0.8s both' : 'none' }}>
              Mermaid 画流程 + Python 画数据 = <span style={{ color: '#a5b4fc' }}>覆盖 90% 可视化需求</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // 8: Cursor / OpenCode
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="08" title="Cursor / OpenCode — AI编程工具" active={a} />
        <div style={{ flex:1, display:"flex", gap:32,  marginTop: 4  }}>
          <div style={{ flex: 1, animation: FaLeft(a) }}>
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 14, background: `${S.amber}08`, border: `1px solid ${S.amber}20`,
              fontSize: 14, color: '#fbbf24', fontFamily: S.sans,
              animation: a ? 'shimmer 4s ease-in-out infinite' : 'none',
            }}>
              核心理念：你说需求，AI写代码，你验收结果
            </div>
            <div style={{ fontSize: 12, color: S.green, marginBottom: 8, fontFamily: S.mono }}>核心能力</div>
            {['直接读写你的本地文件', '理解整个项目上下文', '执行命令行操作', '实时迭代修改'].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#d4d4d8', fontFamily: S.sans, marginBottom: 8,
                animation: a ? `fadeSlideRight 0.4s ease-out ${0.3 + i * 0.08}s both` : 'none',
              }}>
                <span style={{ width: 20, height: 20, borderRadius: 5, background: `${S.green}15`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: S.green }}>✓</span>{t}
              </div>
            ))}
            <div style={{ fontSize: 12, color: S.indigo, margin: '14px 0 8px', fontFamily: S.mono }}>命令行的威力</div>
            <div style={{
              padding: 14, borderRadius: 10, background: '#0d1117', fontFamily: S.mono, fontSize: 11, lineHeight: 1.8, color: '#e6edf3',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${S.green}60, ${S.amber}60)` }} />
              <div style={{ color: '#7ee787' }}># 批量重命名 100 个文件</div>
              <div>for f in *.jpg; do mv "$f" "photo_$f"; done</div>
              <div style={{ color: '#7ee787', marginTop: 4 }}># 合并所有 CSV 并去重</div>
              <div>cat *.csv | sort -u {'>'} merged.csv</div>
            </div>
          </div>
          <div style={{ flex: 1, animation: Fa(a, 0.15) }}>
            <div style={{ fontSize: 12, color: S.amber, marginBottom: 10, fontFamily: S.mono }}>办公实战场景</div>
            {[
              { icon: '📄', title: '生成 Markdown', desc: '会议纪要、周报 → 存入 Obsidian' },
              { icon: '📊', title: '生成 PPT/Word/PDF', desc: '格式规范，直接交付' },
              { icon: '📈', title: '批量处理 Excel', desc: '清洗、合并、分析' },
              { icon: '🎨', title: '可视化图表', desc: 'Mermaid + Python 图表' },
              { icon: '🤖', title: '自动化脚本', desc: '消灭一切重复劳动' },
              { icon: '🌐', title: '生成网页/应用', desc: '数据看板、演示页面' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10,
                background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(71,85,105,0.12)', marginBottom: 6,
                animation: a ? `fadeSlideRight 0.4s ease-out ${0.3 + i * 0.08}s both` : 'none',
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', fontFamily: S.sans }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontFamily: S.sans }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  // 9: OpenClaw intro
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative", overflow:"hidden",  padding: '48px 56px'  }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${S.red}08 0%, transparent 70%)`, animation: a ? 'breathe 4s ease-in-out infinite' : 'none' }} />
        <SlideHeader num="09" title='OpenClaw — 2026最火AI Agent 🦞' active={a} />
        <div style={{ flex:1, display:"flex", gap:32, position:"relative",  marginTop: 4  }}>
          <div style={{ flex: 1, animation: FaLeft(a) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14, background: `${S.red}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                animation: a ? 'bounceIn 0.6s ease-out 0.2s both, float 3s ease-in-out 1s infinite alternate' : 'none',
                boxShadow: `0 0 30px ${S.red}20`,
              }}>🦞</div>
              <div>
                <div style={{
                  fontSize: 20, fontWeight: 700, fontFamily: S.sans,
                  backgroundSize: '200% 200%',
                  backgroundImage: `linear-gradient(90deg, #e2e8f0, ${S.red}, #fbbf24, #e2e8f0)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: a ? 'gradientShift 4s ease infinite' : 'none',
                }}>OpenClaw</div>
                <div style={{ fontSize: 12, color: S.red, fontFamily: S.mono }}>开源 · 本地运行 · 自主 AI Agent</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 14, fontFamily: S.sans }}>
              不是聊天机器人，而是<span style={{ color: '#fbbf24' }}>自主执行的数字员工</span>。运行在你的电脑上，通过 WhatsApp、Telegram、微信等消息平台交互，能自动完成任务、管理文件、操控浏览器。
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '🏠', label: '本地运行', desc: '数据不离开你的电脑' },
                { icon: '🔌', label: '50+集成', desc: 'WhatsApp/Telegram/Discord' },
                { icon: '🧩', label: '100+技能', desc: '社区贡献，持续扩展' },
                { icon: '🧠', label: '持久记忆', desc: '跨对话记住你的偏好' },
              ].map((f, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 10, background: `${S.red}08`, border: `1px solid ${S.red}15`,
                  animation: a ? `scaleIn 0.4s ease-out ${0.4 + i * 0.1}s both` : 'none',
                }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{f.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fca5a5', fontFamily: S.sans }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: '#7c7c9a', fontFamily: S.sans }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, animation: Fa(a, 0.2) }}>
            <div style={{
              padding: '12px 16px', borderRadius: 10, background: `${S.amber}08`, border: `1px solid ${S.amber}20`, marginBottom: 14,
              fontSize: 13, color: '#fbbf24', fontFamily: S.sans,
              animation: a ? 'pulseGlow 3s ease-in-out 1s infinite' : 'none',
            }}>
              GitHub 25万+ ⭐ · 90天成为史上增长最快的开源项目
            </div>
            <div style={{ fontSize: 12, color: S.cyan, marginBottom: 6, fontFamily: S.mono }}>背景故事</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7, marginBottom: 14, fontFamily: S.sans }}>
              奥地利开发者 Peter Steinberger 于2025年11月创建（最初叫Clawdbot）。2026年1月改名 OpenClaw 后因 Moltbook 的病毒式传播爆火。创始人2月加入 OpenAI，项目转交开源基金会。Nvidia CEO 黄仁勋称其为「可能是史上最重要的软件发布」。
            </div>
            <div style={{ fontSize: 12, color: S.green, marginBottom: 6, fontFamily: S.mono }}>在中国的爆火 🇨🇳</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7, fontFamily: S.sans }}>
              被昵称为「龙虾」。腾讯深圳总部千人排队安装，阿里百度纷纷一键部署，深圳龙岗区推出最高200万元补贴，小米发布「miclaw」。各类「养龙虾」课程涌现。
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // 10: OpenClaw capabilities
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="10" title="OpenClaw 能做什么？" active={a} />
        <div style={{ flex:1, display:"flex", gap:32,  marginTop: 4  }}>
          <div style={{ flex: 1, animation: FaLeft(a) }}>
            <div style={{ fontSize: 12, color: S.red, marginBottom: 10, fontFamily: S.mono }}>核心使用场景</div>
            {[
              { icon: '💻', title: '开发与运维', desc: 'GitHub集成、定时任务、Webhook触发' },
              { icon: '📋', title: '个人生产力', desc: '管理 Notion、Obsidian、Trello — 在消息App中操作' },
              { icon: '🌐', title: '网页自动化', desc: '填表单、爬数据、浏览器控制' },
              { icon: '📁', title: '文件与命令行', desc: '读写文件、执行命令、可沙盒化运行' },
              { icon: '🏠', title: '智能家居', desc: '控制IoT设备，结合健康数据优化' },
              { icon: '🤝', title: '多Agent协作', desc: '连接 Claude Code、Cursor、Codex' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '9px 12px', borderRadius: 10,
                background: `${S.red}06`, border: `1px solid ${S.red}12`, marginBottom: 6,
                animation: a ? `fadeSlideRight 0.4s ease-out ${0.2 + i * 0.08}s both` : 'none',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fca5a5', fontFamily: S.sans }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#7c7c9a', fontFamily: S.sans }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, animation: Fa(a, 0.15) }}>
            <div style={{ fontSize: 12, color: S.amber, marginBottom: 10, fontFamily: S.mono }}>工作方式</div>
            <div style={{
              padding: 14, borderRadius: 12, background: '#0d1117', border: `1px solid ${S.red}15`,
              fontFamily: S.mono, fontSize: 11, lineHeight: 2, color: '#e6edf3', marginBottom: 12,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${S.red}60, ${S.amber}60)`, animation: a ? 'shimmerV 2s ease-in-out infinite' : 'none' }} />
              <div style={{ color: '#7ee787' }}># 安装</div>
              <div>npx openclaw@latest</div>
              <br />
              <div style={{ color: '#7ee787' }}># 在 WhatsApp 中发消息</div>
              <div style={{ color: '#a5d6ff' }}>"把这周会议纪要整理成MD</div>
              <div style={{ color: '#a5d6ff' }}> 存到 Obsidian 里"</div>
              <br />
              <div style={{ color: '#7ee787' }}># OpenClaw 自动执行：</div>
              <div style={{ color: '#fca5a5' }}>→ 读取笔记文件</div>
              <div style={{ color: '#fca5a5' }}>→ 整理并格式化</div>
              <div style={{ color: '#fca5a5' }}>→ 写入 Obsidian vault</div>
              <div style={{ color: '#fca5a5' }}>→ 回复确认完成</div>
            </div>
            <Card color={S.red} anim={FaScale(a, 0.5)} glow>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fca5a5', marginBottom: 6, fontFamily: S.sans }}>⚠️ 安全提醒</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, fontFamily: S.sans }}>
                OpenClaw 拥有系统级权限。2026年2月曾发现4万+实例暴露在公网。请审查第三方技能、保持更新、遵循安全指南。
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
  },
  // 11: Cursor vs OpenClaw
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="11" title="Cursor vs OpenClaw — 互补而非竞争" active={a} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24 }}>
          <div style={{ display: 'flex', gap: 24, maxWidth: 780, width: '100%' }}>
            <Card color={S.amber} style={{ flex: 1, padding: 22, position: 'relative', overflow: 'hidden' }} anim={a ? 'scaleIn 0.5s ease-out 0.1s both' : 'none'}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: `linear-gradient(90deg, transparent, ${S.amber}50, transparent)`, animation: a ? 'shimmerBar 3s ease-in-out infinite' : 'none' }} />
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 28, marginBottom: 4, animation: a ? 'bounceIn 0.5s ease-out 0.3s both' : 'none' }}>⚡</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fbbf24', fontFamily: S.sans }}>Cursor / OpenCode</div>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: S.mono }}>AI 编程助手</div>
              </div>
              {['在编辑器中与AI对话', '操作项目文件和代码', '生成文档 / PPT / Excel', '需要你主动发起任务', '适合：具体的创作和处理'].map((t, i) => (
                <div key={i} style={{
                  fontSize: 12, color: '#d4d4d8', paddingLeft: 12, borderLeft: `2px solid ${S.amber}30`, marginBottom: 7, fontFamily: S.sans,
                  animation: a ? `fadeSlideRight 0.4s ease-out ${0.4 + i * 0.07}s both` : 'none',
                }}>{t}</div>
              ))}
            </Card>
            <Card color={S.red} style={{ flex: 1, padding: 22, position: 'relative', overflow: 'hidden' }} anim={a ? 'scaleIn 0.5s ease-out 0.2s both' : 'none'}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: `linear-gradient(90deg, transparent, ${S.red}50, transparent)`, animation: a ? 'shimmerBar 3s ease-in-out 0.5s infinite' : 'none' }} />
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 28, marginBottom: 4, animation: a ? 'bounceIn 0.5s ease-out 0.4s both' : 'none' }}>🦞</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fca5a5', fontFamily: S.sans }}>OpenClaw</div>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: S.mono }}>自主 AI Agent</div>
              </div>
              {['在消息App中随时对话', '自主执行、7×24运行', '连接50+平台和服务', '可主动触发（定时/Webhook）', '适合：持续运行的自动化'].map((t, i) => (
                <div key={i} style={{
                  fontSize: 12, color: '#d4d4d8', paddingLeft: 12, borderLeft: `2px solid ${S.red}30`, marginBottom: 7, fontFamily: S.sans,
                  animation: a ? `fadeSlideRight 0.4s ease-out ${0.5 + i * 0.07}s both` : 'none',
                }}>{t}</div>
              ))}
            </Card>
          </div>
          <div style={{
            padding: '14px 22px', borderRadius: 12, maxWidth: 780, width: '100%',
            background: `linear-gradient(135deg, ${S.amber}08 0%, ${S.red}08 100%)`,
            border: `1px solid ${S.amber}15`, textAlign: 'center',
            animation: a ? 'fadeUp 0.5s ease-out 0.6s both, pulseGlow 4s ease-in-out 1.5s infinite' : 'none',
          }}>
            <div style={{ fontSize: 15, color: '#e2e8f0', fontWeight: 600, fontFamily: S.sans }}>
              <span style={{ color: '#6ee7b7' }}>Cursor 做精细处理</span> → <span style={{ color: '#fca5a5' }}>OpenClaw 做持续自动化</span> → <span style={{ color: '#c4b5fd' }}>Obsidian 做知识积累</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // 12: Workflow
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="12" title="实战工作流 — 端到端串联" active={a} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:64 }}>
          <div style={{ fontSize: 14, color: '#94a3b8', fontFamily: S.sans, animation: Fa(a) }}>把所有工具串成一条完整的生产力链路</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 880 }}>
            {[
              { icon: '🎙️', label: '原始素材', sub: '会议/笔记', color: S.indigo },
              { icon: '💬', label: '网页AI整理', sub: '豆包/Kimi', color: S.purple },
              { icon: '📝', label: 'Markdown化', sub: 'Cursor', color: S.green },
              { icon: '📊', label: '画流程图', sub: 'Mermaid', color: S.blue },
              { icon: '📈', label: '数据处理', sub: 'Python', color: S.amber },
              { icon: '📄', label: '生成报告', sub: 'Word/PPT', color: S.red },
              { icon: '🦞', label: 'Agent化', sub: 'OpenClaw', color: S.red },
              { icon: '💎', label: '归档知识库', sub: 'Obsidian', color: S.purple },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', width: 82, textAlign: 'center',
                  animation: a ? `scaleIn 0.4s ease-out ${i * 0.1}s both` : 'none',
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, background: `${step.color}12`, border: `1.5px solid ${step.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 5,
                    boxShadow: `0 0 15px ${step.color}10`,
                    animation: a ? `float 3s ease-in-out ${i * 0.2}s infinite alternate` : 'none',
                  }}>{step.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', fontFamily: S.sans }}>{step.label}</div>
                  <div style={{ fontSize: 9, color: step.color, fontFamily: S.mono }}>{step.sub}</div>
                </div>
                {i < 7 && <div style={{
                  color: '#334155', fontSize: 14, margin: '0 1px', marginBottom: 18,
                  animation: a ? `fadeUp 0.3s ease-out ${i * 0.1 + 0.2}s both` : 'none',
                }}>→</div>}
              </div>
            ))}
          </div>
          <Card color={S.indigo} style={{ maxWidth: 680, width: '100%', textAlign: 'center' }} anim={a ? 'fadeUp 0.5s ease-out 0.9s both' : 'none'}>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, fontFamily: S.sans }}>
              简单任务用网页AI，结构化用Markdown+Obsidian，精细处理用Cursor，持续自动化用OpenClaw。
              <span style={{ color: '#6ee7b7' }}> 形成闭环，越用越有价值。</span>
            </div>
          </Card>
        </div>
      </div>
    ),
  },
  // 13: Table
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%",  padding: '48px 56px'  }}>
        <SlideHeader num="13" title="工具能力对照表" active={a} />
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",  animation: FaScale(a)  }}>
          <table style={{ width: '100%', maxWidth: 820, borderCollapse: 'separate', borderSpacing: 0, borderRadius: 12, overflow: 'hidden', fontSize: 13, fontFamily: S.sans }}>
            <thead>
              <tr style={{ background: `${S.indigo}15` }}>
                {['能力', '网页AI', 'MD+工具链', 'Cursor/OC', 'OpenClaw'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', textAlign: i === 0 ? 'left' : 'center', color: '#a5b4fc', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['问答 / 文案', '✅', '—', '✅', '✅'],
                ['结构化文档', '❌', '✅', '✅', '✅'],
                ['可视化图表', '❌', '✅轻量', '✅全能', '✅'],
                ['处理 Excel', '❌', '❌', '✅', '✅'],
                ['生成 PPT/Word', '❌', '❌', '✅', '—'],
                ['批量自动化', '❌', '❌', '✅', '✅✅'],
                ['知识管理', '❌', '✅', '✅', '✅'],
                ['7×24 运行', '❌', '❌', '❌', '✅'],
                ['跨平台集成', '❌', '❌', '❌', '✅✅'],
                ['学习门槛', '零', '低', '中低', '中'],
              ].map((row, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0 ? 'rgba(15,23,42,0.5)' : 'rgba(30,41,59,0.3)',
                  animation: a ? `fadeSlideRight 0.3s ease-out ${0.1 + i * 0.05}s both` : 'none',
                }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '9px 14px', textAlign: j === 0 ? 'left' : 'center', color: cell.includes('✅') ? '#6ee7b7' : cell === '❌' ? '#475569' : '#94a3b8', borderBottom: '1px solid rgba(51,65,85,0.3)' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  // 14: Recommendations + ending
  {
    content: (a) => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative", overflow:"hidden",  padding: '48px 56px'  }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(99,102,241,0.06) 0%, transparent 60%)', animation: a ? 'breathe 5s ease-in-out infinite' : 'none' }} />
        <div style={{ position: 'relative' }}>
          <SlideHeader num="14" title="推荐组合与行动建议" active={a} />
        </div>
        <div style={{ flex:1, display:"flex", gap:32, alignItems:"center", position:"relative" }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, animation: FaLeft(a) }}>
            {[
              { level: '🌱 入门', tools: '豆包/Kimi + Obsidian + Typora', who: '不懂代码', color: S.green },
              { level: '🚀 进阶', tools: 'DeepSeek + Obsidian + VS Code + Mermaid', who: '略懂技术', color: S.indigo },
              { level: '⚡ 全能', tools: 'Cursor/OpenCode + Obsidian + Python', who: '愿意深入', color: S.amber },
              { level: '🦞 终极', tools: '以上全部 + OpenClaw', who: '追求极致', color: S.red },
            ].map((c, i) => (
              <Card key={i} color={c.color} anim={a ? `scaleIn 0.4s ease-out ${0.1 + i * 0.1}s both` : 'none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: c.color, fontFamily: S.sans }}>{c.level}</span>
                  <Tag color={c.color} delay={0.3 + i * 0.1} active={a}>{c.who}</Tag>
                </div>
                <div style={{ fontSize: 12, color: '#d4d4d8', fontFamily: S.mono }}>{c.tools}</div>
              </Card>
            ))}
          </div>
          <div style={{ flex: 0.9, animation: Fa(a, 0.2) }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 14, fontFamily: S.sans }}>6周学习路径</div>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${S.green}, ${S.indigo}, ${S.amber}, ${S.red})`, animation: a ? 'shimmerV 4s ease-in-out infinite' : 'none' }} />
              {[
                { step: '第1周', text: '网页AI + Markdown语法', color: S.green },
                { step: '第2周', text: '安装Obsidian，开始积累', color: S.green },
                { step: '第3周', text: 'Mermaid画图，AI生成', color: S.indigo },
                { step: '第4周', text: '尝试Cursor/OpenCode', color: S.amber },
                { step: '第5周', text: 'Python处理Excel', color: S.amber },
                { step: '第6周', text: '探索OpenClaw', color: S.red },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start',
                  animation: a ? `fadeSlideRight 0.4s ease-out ${0.4 + i * 0.08}s both` : 'none',
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 7, background: `${s.color}30`, border: `2px solid ${s.color}`,
                    flexShrink: 0, marginTop: 2,
                    animation: a ? `pulseGlow 2s ease-in-out ${i * 0.3}s infinite` : 'none',
                  }} />
                  <div>
                    <div style={{ fontSize: 10, color: s.color, fontFamily: S.mono }}>{s.step}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: S.sans }}>{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: '16px 20px', borderRadius: 12,
              background: `linear-gradient(135deg, ${S.indigo}0c 0%, ${S.green}0c 100%)`,
              border: `1px solid ${S.indigo}18`, textAlign: 'center',
              animation: a ? 'fadeUp 0.6s ease-out 0.9s both' : 'none',
            }}>
              <div style={{
                fontSize: 18, fontWeight: 700, fontFamily: S.sans, marginBottom: 4,
                backgroundSize: '200% 200%',
                backgroundImage: 'linear-gradient(90deg, #e2e8f0, #6366f1, #10b981, #e2e8f0)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: a ? 'gradientShift 5s ease infinite' : 'none',
              }}>
                不是要变成程序员
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#6ee7b7', fontFamily: S.sans }}>而是让 AI 替你编程</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8, fontFamily: S.sans }}>工具会进化，方法论可以复用一辈子</div>
              <div style={{ fontSize: 11, color: '#334155', marginTop: 8, fontFamily: S.mono }}>AI 办公实战指南 · 2026</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Presentation() {
  const [current, setCurrent] = useState(0);
  const [trans, setTrans] = useState(false);

  const goTo = useCallback((idx) => {
    if (idx < 0 || idx >= SLIDES.length || idx === current || trans) return;
    setTrans(true);
    setTimeout(() => { setCurrent(idx); setTrans(false); }, 200);
  }, [current, trans]);

  useEffect(() => {
    const h = (e) => {
      if (['ArrowRight', 'ArrowDown', ' '].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
      else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [current, goTo]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', fontFamily: S.sans, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeSlideRight { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes popIn { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
        @keyframes bounceIn { 0% { opacity:0; transform:scale(0.3); } 50% { transform:scale(1.08); } 100% { opacity:1; transform:scale(1); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes float { from { transform:translateY(0); } to { transform:translateY(-10px); } }
        @keyframes breathe { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.05); } }
        @keyframes bounceX { 0%,100% { transform:translateX(0); } 50% { transform:translateX(-4px); } }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shimmer {
          0%,100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @keyframes shimmerBar {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes shimmerV {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0px transparent; }
          50% { box-shadow: 0 0 12px rgba(99,102,241,0.15); }
        }
        
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:0; }
        

      `}</style>
      <div style={{
        flex: 1, overflow: 'hidden',
        opacity: trans ? 0 : 1,
        transform: trans ? 'scale(0.98)' : 'scale(1)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}>
        {SLIDES[current].content(true)}
      </div>
      <div style={{
        height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderTop: '1px solid rgba(51,65,85,0.2)', flexShrink: 0, background: 'rgba(10,10,15,0.95)',
      }}>
        <button onClick={() => goTo(current - 1)} disabled={current === 0} style={{
          width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(71,85,105,0.3)',
          background: 'transparent', color: current === 0 ? '#1e293b' : '#64748b',
          cursor: current === 0 ? 'default' : 'pointer', fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}>←</button>
        <div style={{ display: 'flex', gap: 3, margin: '0 6px' }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === current ? 22 : 7, height: 7, borderRadius: 4, border: 'none',
              background: i === current ? S.indigo : 'rgba(71,85,105,0.3)',
              cursor: 'pointer', transition: 'all 0.3s ease', padding: 0,
              boxShadow: i === current ? `0 0 8px ${S.indigo}40` : 'none',
            }} />
          ))}
        </div>
        <button onClick={() => goTo(current + 1)} disabled={current === SLIDES.length - 1} style={{
          width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(71,85,105,0.3)',
          background: 'transparent', color: current === SLIDES.length - 1 ? '#1e293b' : '#64748b',
          cursor: current === SLIDES.length - 1 ? 'default' : 'pointer', fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}>→</button>
        <span style={{ fontSize: 11, color: '#334155', marginLeft: 10, fontFamily: S.mono }}>{current + 1} / {SLIDES.length}</span>
      </div>
    </div>
  );
}
