import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

import Navbar          from './components/Navbar';
import WorkspaceMockup from './components/WorkspaceMockup';
import WorkflowSteps   from './components/WorkflowSteps';
import ArtifactCards   from './components/ArtifactCards';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   Shared animation variants
───────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─────────────────────────────────────────────────────────────
   Section wrapper — scroll-triggered reveal
───────────────────────────────────────────────────────────── */
const Section = ({ id, className = '', children }) => (
  <motion.section
    id={id}
    className={`relative px-6 md:px-10 lg:px-16 ${className}`}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    variants={stagger}
  >
    {children}
  </motion.section>
);

/* ─────────────────────────────────────────────────────────────
   Eyebrow label
───────────────────────────────────────────────────────────── */
const Eyebrow = ({ children }) => (
  <motion.p variants={fadeUp} className="bp-eyebrow mb-4">
    {children}
  </motion.p>
);

/* ─────────────────────────────────────────────────────────────
   Requirement Analysis Counter
───────────────────────────────────────────────────────────── */
const CounterCard = ({ label, value, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          gsap.to({ val: 0 }, {
            val: value,
            duration: 1.2,
            delay,
            ease: 'power2.out',
            onUpdate: function () {
              setCount(Math.round(this.targets()[0].val));
            },
          });
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, delay]);

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="bp-card p-5 flex flex-col gap-1"
    >
      <span className="text-3xl font-bold bp-gradient-text tabular-nums">{count}</span>
      <span className="bp-mono text-[10px] text-white/35 uppercase tracking-wider">{label}</span>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Version timeline item
───────────────────────────────────────────────────────────── */
const VersionItem = ({ version, isCurrent, changes, delay }) => (
  <motion.div
    variants={fadeUp}
    transition={{ delay }}
    className="relative flex gap-5 pb-8 last:pb-0"
  >
    {/* Line + dot */}
    <div className="flex flex-col items-center">
      <div
        className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
          isCurrent ? 'bg-bp-cyan' : 'bg-white/20'
        }`}
        style={isCurrent ? { boxShadow: '0 0 12px rgba(34,211,238,0.6)' } : {}}
      />
      <div className="w-px flex-1 mt-1 bg-white/[0.07]" />
    </div>

    {/* Content */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="bp-mono text-xs font-semibold text-white">{version}</span>
        {isCurrent && (
          <span
            className="bp-mono text-[9px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,211,238,0.1)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.2)' }}
          >
            Current
          </span>
        )}
      </div>
      <div className="space-y-1">
        {changes.map((change, i) => (
          <p key={i} className="text-xs text-white/35 flex items-start gap-2">
            <span className={`mt-0.5 flex-shrink-0 ${change.startsWith('+') ? 'text-green-400' : change.startsWith('-') ? 'text-red-400/60' : 'text-white/25'}`}>
              {change[0]}
            </span>
            <span>{change.slice(2)}</span>
          </p>
        ))}
      </div>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   Cursor spotlight — sits inside hero, follows mouse with spring
───────────────────────────────────────────────────────────── */
const CursorSpotlight = ({ springX, springY }) => {
  // heroRef width/height not easily accessible here — we use vw/vh for % mapping
  const xPx = useTransform(springX, [0, 1], ['0vw', '100vw']);
  const yPx = useTransform(springY, [0, 1], ['0px', '100vh']);

  return (
    <motion.div
      aria-hidden
      className="absolute rounded-full pointer-events-none z-0"
      style={{
        width: 600,
        height: 600,
        left: xPx,
        top:  yPx,
        translateX: '-50%',
        translateY: '-50%',
        background:
          'radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, rgba(34,211,238,0.07) 38%, transparent 68%)',
        filter: 'blur(52px)',
      }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const heroRef = useRef(null);

  // Edit/Regenerate state demo
  const [showImproved, setShowImproved] = useState(false);

  // ── Cursor-reactive gradient ──
  const rawX = useMotionValue(0.5); // 0..1 relative to hero
  const rawY = useMotionValue(0.5);
  // Spring smoothing so gradient lags softly behind cursor
  const springX = useSpring(rawX, { stiffness: 60, damping: 18 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 18 });

  const handleHeroMouseMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top)  / rect.height);
  }, [rawX, rawY]);

  return (
    <div
      className="min-h-screen bp-noise"
      style={{ background: '#080B0F', color: '#F9FAFB' }}
    >
      {/* ══════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════ */}
      <Navbar />

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        id="hero"
        className="relative min-h-[100svh] flex flex-col overflow-hidden"
        style={{ background: '#080B0F' }}
        onMouseMove={handleHeroMouseMove}
      >
        {/* ── Background gradient layer ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>

          {/* Slow-drifting base orb — bottom center */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '80vw', height: '80vw',
              maxWidth: 1000, maxHeight: 1000,
              bottom: '-35%', left: '50%',
              x: '-50%',
              background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 50%, transparent 70%)',
              filter: 'blur(48px)',
            }}
            animate={{
              scale: [1, 1.1, 0.97, 1],
              x: ['-50%', '-48%', '-52%', '-50%'],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Slow-drifting cyan orb — right side */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '50vw', height: '50vw',
              maxWidth: 700, maxHeight: 700,
              bottom: '-10%', right: '-8%',
              background: 'radial-gradient(ellipse, rgba(34,211,238,0.09) 0%, transparent 65%)',
              filter: 'blur(56px)',
            }}
            animate={{
              scale: [1, 1.15, 0.95, 1],
              y: [0, -30, 10, 0],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          {/* Slow-drifting blue orb — top left */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '35vw', height: '35vw',
              maxWidth: 480, maxHeight: 480,
              top: '-5%', left: '-5%',
              background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{
              scale: [1, 1.2, 0.9, 1],
              x: [0, 20, -10, 0],
              y: [0, 15, -5, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Subtle dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Cursor-reactive spotlight — follows mouse with spring smoothing */}
        <CursorSpotlight springX={springX} springY={springY} />

        {/* ── Hero content ── */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-6 md:px-10 lg:px-16 pt-32 pb-20">
          <motion.div
            className="max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Eyebrow */}
            <motion.p variants={fadeUp} className="bp-eyebrow mb-6">
              AI-POWERED SOFTWARE PLANNING
            </motion.p>

            {/* H1 */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6"
            >
              Turn Ideas Into
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.45) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Engineering Blueprints.
              </span>
            </motion.h1>

            {/* Supporting text */}
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-white/40 max-w-xl leading-relaxed mb-10"
            >
              Transform software ideas and requirements into structured BRDs, SRS documents,
              user stories, database schemas, and REST API designs.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link
                to="/register"
                id="hero-cta-primary"
                className="bp-btn-primary px-7 py-3.5 text-sm inline-flex items-center gap-2"
              >
                Create Your Blueprint
                <span aria-hidden>→</span>
              </Link>
              <button
                id="hero-cta-secondary"
                className="bp-btn-ghost px-7 py-3.5 text-sm"
                onClick={() => {
                  document.querySelector('#product')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Workspace
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Bottom gradient fade ── */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #080B0F)' }}
        />
      </section>

      {/* ══════════════════════════════════════════════════
          DIVIDER
      ══════════════════════════════════════════════════ */}
      <div className="bp-divider mx-16" />

      {/* ══════════════════════════════════════════════════
          SECTION 2 — THE PROBLEM
      ══════════════════════════════════════════════════ */}
      <Section id="problem" className="py-24 md:py-32">
        <Eyebrow>THE PROBLEM</Eyebrow>

        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6 max-w-2xl"
        >
          Great software starts with
          <br />
          great planning.
        </motion.h2>

        <motion.p variants={fadeUp} className="text-white/40 max-w-xl leading-relaxed mb-16">
          Turning an idea into implementation-ready documentation takes time, technical
          knowledge, and constant context switching.
        </motion.p>

        {/* 3 problems */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] rounded-xl overflow-hidden">
          {[
            {
              num: '01',
              title: 'Scattered Requirements',
              body: 'Ideas live across chats, notes and documents — never in one structured place.',
            },
            {
              num: '02',
              title: 'Inconsistent Documentation',
              body: 'BRDs, SRS documents, APIs and database designs drift apart without a shared source of truth.',
            },
            {
              num: '03',
              title: 'Slow Planning',
              body: 'Teams spend valuable time preparing documentation before development can begin.',
            },
          ].map((item) => (
            <motion.div
              key={item.num}
              variants={fadeUp}
              id={`problem-${item.num}`}
              className="p-8"
              style={{ background: '#0D1117' }}
            >
              <p className="bp-mono text-xs text-bp-blue/50 mb-4">{item.num}</p>
              <h3 className="text-base font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — WORKFLOW
      ══════════════════════════════════════════════════ */}
      <Section id="workflow" className="py-24 md:py-32" style={{ background: '#0A0E13' }}>
        <Eyebrow>WORKFLOW</Eyebrow>

        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-2xl"
        >
          Five steps from idea to
          <br />
          engineering-ready plan.
        </motion.h2>

        <motion.p variants={fadeUp} className="text-white/35 mb-16 max-w-lg text-sm">
          A structured flow that turns unformed ideas into implementation-ready documentation.
        </motion.p>

        <motion.div variants={fadeUp}>
          <WorkflowSteps />
        </motion.div>
      </Section>

      <div className="bp-divider mx-16" />

      {/* ══════════════════════════════════════════════════
          SECTION 4 — PRODUCT SHOWCASE
      ══════════════════════════════════════════════════ */}
      <Section id="product" className="py-24 md:py-32">
        <Eyebrow>THE BLUEPRINT WORKSPACE</Eyebrow>

        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-2xl"
        >
          One workspace.
          <br />
          <span className="text-white/55">Every engineering decision connected.</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-white/35 mb-12 max-w-lg text-sm">
          BRD, SRS, user stories, database schema and REST API — all generated, edited
          and versioned in a single structured workspace.
        </motion.p>

        <WorkspaceMockup />
      </Section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — BLUEPRINT ARTIFACTS
      ══════════════════════════════════════════════════ */}
      <Section id="features" className="py-24 md:py-32" style={{ background: '#0A0E13' }}>
        <Eyebrow>WHAT BLUEPRINTAI CREATES</Eyebrow>

        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4"
        >
          Everything you need
          <br />
          <span className="text-white/55">before you start coding.</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-white/35 mb-12 max-w-lg text-sm">
          Five core engineering artifacts, generated from your idea and kept in sync
          as your requirements evolve.
        </motion.p>

        <ArtifactCards />
      </Section>

      <div className="bp-divider mx-16" />

      {/* ══════════════════════════════════════════════════
          SECTION 6 — AI REQUIREMENT ANALYSIS
      ══════════════════════════════════════════════════ */}
      <Section id="requirement-analysis" className="py-24 md:py-32">
        <Eyebrow>REQUIREMENT INTELLIGENCE</Eyebrow>

        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-2xl"
        >
          Start with an idea.
          <br />
          <span className="text-white/55">Get structured requirements.</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-white/35 mb-12 max-w-lg text-sm">
          BlueprintAI parses your project description and extracts the full engineering
          context before generating any document.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input card */}
          <motion.div variants={fadeUp} className="bp-card p-6">
            <p className="bp-mono text-[9px] text-white/25 mb-3 tracking-widest">INPUT</p>
            <p className="text-sm text-white/60 italic leading-relaxed">
              &quot;Build a campus placement platform where students can register, companies can
              post drives, and placement coordinators can manage the entire process...&quot;
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-bp-blue animate-pulse" />
              <span className="bp-mono text-[9px] text-white/25">Analyzing...</span>
            </div>
          </motion.div>

          {/* Extracted metrics */}
          <div className="grid grid-cols-2 gap-3">
            <CounterCard label="Functional Requirements" value={12} delay={0}   />
            <CounterCard label="Non-Functional"          value={7}  delay={0.1} />
            <CounterCard label="User Roles"              value={4}  delay={0.2} />
            <CounterCard label="Core Features"           value={14} delay={0.3} />
            <CounterCard label="Dependencies"            value={6}  delay={0.4} />
            <motion.div variants={fadeUp} className="bp-card p-5 flex flex-col justify-center">
              <span className="bp-mono text-[9px] text-bp-cyan/70 uppercase tracking-wider mb-1">AI Model</span>
              <span className="text-sm font-semibold text-white">RAG-enhanced</span>
              <span className="bp-mono text-[9px] text-white/25">context-aware</span>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════
          SECTION 7 — AI COPILOT
      ══════════════════════════════════════════════════ */}
      <Section id="ai-copilot" className="py-24 md:py-32" style={{ background: '#0A0E13' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Eyebrow>AI COPILOT</Eyebrow>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4"
            >
              AI that works around
              <br />
              your blueprint.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/35 mb-6 text-sm leading-relaxed">
              Generate, refine and improve your documentation without losing the
              structure of your project.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="bp-card p-4 mb-6"
            >
              <p className="bp-mono text-[9px] text-white/25 mb-1">NOT ANOTHER CHAT WINDOW.</p>
              <p className="text-sm text-white/55 leading-relaxed">
                Your blueprint stays structured while AI works within it.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {['Improve', 'Expand', 'Regenerate', 'Explain'].map((action) => (
                <span
                  key={action}
                  className="bp-mono text-[10px] px-3 py-1.5 rounded border border-white/[0.08] text-white/40"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  {action}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Copilot mockup */}
          <motion.div variants={fadeUp}>
            <div
              className="rounded-xl overflow-hidden border border-white/[0.07]"
              style={{ background: '#0D1117' }}
            >
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <span className="bp-mono text-[9px] text-white/25">SRS / Authentication</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-bp-cyan" />
                  <span className="bp-mono text-[9px] text-bp-cyan/70">Active</span>
                </div>
              </div>

              <div className="flex">
                {/* Document preview */}
                <div className="flex-1 p-4 border-r border-white/[0.06]">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bp-req-badge">FR-001</span>
                      <span className="text-xs font-medium text-white">User Authentication</span>
                    </div>
                    <p className="text-xs text-white/35 leading-relaxed">
                      The system shall allow students to securely register using their university email address.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="bp-mono text-[9px] text-white/20">Priority</span>
                    <span className="bp-mono text-[9px] text-yellow-400/70">HIGH</span>
                  </div>
                </div>

                {/* Copilot panel */}
                <div className="w-32 p-3">
                  <p className="bp-mono text-[8px] text-white/20 mb-2 tracking-widest">COPILOT</p>
                  <div className="space-y-1.5">
                    {['Improve', 'Expand', 'Regenerate', 'Explain'].map((a) => (
                      <div
                        key={a}
                        className="text-[10px] text-white/30 px-2 py-1.5 rounded border border-white/[0.06] flex items-center justify-between hover:border-bp-blue/30 hover:text-white/50 transition-colors cursor-default"
                        style={{ background: 'rgba(255,255,255,0.02)' }}
                      >
                        {a}
                        <span className="text-white/15 text-[8px]">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      <div className="bp-divider mx-16" />

      {/* ══════════════════════════════════════════════════
          SECTION 8 — RAG / KNOWLEDGE
      ══════════════════════════════════════════════════ */}
      <Section id="technology" className="py-24 md:py-32">
        <Eyebrow>GROUNDED GENERATION</Eyebrow>

        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-2xl"
        >
          Better context.
          <br />
          <span className="text-white/55">Better blueprints.</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-white/35 mb-12 max-w-lg text-sm leading-relaxed">
          BlueprintAI uses Retrieval-Augmented Generation (RAG) to ground every output in your
          project's actual requirements — not generic patterns.
        </motion.p>

        {/* RAG pipeline */}
        <motion.div
          variants={stagger}
          className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0"
        >
          {[
            { label: 'Knowledge', desc: 'Your requirements and context' },
            { label: 'Retrieval', desc: 'Relevant sections surface' },
            { label: 'Project Context', desc: 'Scoped to your blueprint' },
            { label: 'Blueprint', desc: 'Structured, consistent output' },
          ].map((stage, i) => (
            <div key={stage.label} className="flex items-center">
              <motion.div
                variants={fadeUp}
                id={`rag-stage-${i + 1}`}
                className="bp-card px-4 py-3 flex flex-col"
              >
                <span className="text-xs font-semibold text-white mb-1">{stage.label}</span>
                <span className="bp-mono text-[9px] text-white/30">{stage.desc}</span>
              </motion.div>
              {i < 3 && (
                <motion.div
                  variants={fadeUp}
                  className="hidden md:flex items-center px-3 text-white/15 text-sm"
                >
                  →
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      </Section>

      {/* ══════════════════════════════════════════════════
          SECTION 9 — EDIT & REGENERATE
      ══════════════════════════════════════════════════ */}
      <Section id="edit-regenerate" className="py-24 md:py-32" style={{ background: '#0A0E13' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            <Eyebrow>EDIT & REGENERATE</Eyebrow>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4"
            >
              AI generates.
              <br />
              <span className="text-white/55">You stay in control.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/35 mb-8 text-sm leading-relaxed">
              Every generated requirement can be improved, expanded, regenerated or
              manually edited. AI assists — you decide.
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-3">
              <Link to="/register" className="bp-btn-primary px-5 py-2.5 text-sm">
                Try It Free
              </Link>
            </motion.div>
          </div>

          {/* Before/after demo */}
          <motion.div variants={fadeUp}>
            <div
              className="rounded-xl overflow-hidden border border-white/[0.07]"
              style={{ background: '#0D1117' }}
            >
              {/* Actions toolbar */}
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex gap-2">
                {['Improve', 'Expand', 'Regenerate', 'Edit'].map((action) => (
                  <button
                    key={action}
                    id={`edit-action-${action.toLowerCase()}`}
                    className={`text-[10px] px-2.5 py-1 rounded transition-all ${
                      action === 'Improve'
                        ? 'bg-bp-blue/20 text-bp-blue border border-bp-blue/30'
                        : 'text-white/25 border border-white/[0.06] hover:text-white/50'
                    }`}
                    onClick={() => action === 'Improve' && setShowImproved((s) => !s)}
                  >
                    {action}
                  </button>
                ))}
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bp-req-badge">FR-001</span>
                  <span className="text-xs font-medium text-white">User Authentication</span>
                </div>

                <AnimatePresence mode="wait">
                  {!showImproved ? (
                    <motion.p
                      key="original"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-white/35 leading-relaxed"
                    >
                      The system shall allow students to register using their university email address.
                    </motion.p>
                  ) : (
                    <motion.p
                      key="improved"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-white/60 leading-relaxed"
                      style={{ borderLeft: '2px solid #3B82F6', paddingLeft: '12px' }}
                    >
                      The system shall provide a secure registration flow for students, requiring
                      verification of a valid university email domain. Authentication shall use
                      JWT tokens with a 24-hour expiry and support password reset via email.
                    </motion.p>
                  )}
                </AnimatePresence>

                <p className="bp-mono text-[9px] text-white/20 mt-3">
                  {showImproved ? '● Improved · click Improve to toggle' : '● Original · click Improve to see AI enhancement'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      <div className="bp-divider mx-16" />

      {/* ══════════════════════════════════════════════════
          SECTION 10 — VERSIONING
      ══════════════════════════════════════════════════ */}
      <Section id="versioning" className="py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <Eyebrow>VERSION CONTROL</Eyebrow>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4"
            >
              Your blueprint evolves
              <br />
              <span className="text-white/55">with your idea.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/35 text-sm leading-relaxed">
              Every significant change to your blueprint is versioned automatically.
              Review history, compare changes and restore any version.
            </motion.p>
          </div>

          {/* Version timeline */}
          <motion.div variants={stagger} className="pt-2">
            <VersionItem
              version="SRS v1"
              isCurrent={false}
              changes={['+ Initial SRS structure', '+ FR-001 User Authentication', '+ FR-002 Placement Scheduling']}
              delay={0}
            />
            <VersionItem
              version="SRS v2"
              isCurrent={false}
              changes={['+ FR-007 Notification System', '~ Modified Authentication scope', '- Removed redundant requirement']}
              delay={0.1}
            />
            <VersionItem
              version="SRS v3"
              isCurrent={true}
              changes={['+ FR-012 Analytics Dashboard', '+ Non-functional requirements updated', '~ Priority adjustments across 3 items']}
              delay={0.2}
            />
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════
          SECTION 11 — EXPORT
      ══════════════════════════════════════════════════ */}
      <Section id="export" className="py-16 md:py-20" style={{ background: '#0A0E13' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <motion.h2
              variants={fadeUp}
              className="text-2xl md:text-3xl font-bold text-white mb-2"
            >
              Take your blueprint wherever development happens.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/35 text-sm">
              Export your complete blueprint as PDF or Markdown — ready for your team.
            </motion.p>
          </div>
          <motion.div variants={fadeUp} className="flex gap-3 flex-shrink-0">
            <button
              id="export-pdf"
              className="bp-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 5h6M3 7h6M3 9h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
              </svg>
              Export PDF
            </button>
            <button
              id="export-markdown"
              className="bp-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 3h12M1 7l3 3 3-3M7 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
              </svg>
              Export Markdown
            </button>
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════
          SECTION 12 — FINAL CTA
      ══════════════════════════════════════════════════ */}
      <section
        id="cta"
        className="relative py-32 md:py-48 px-6 md:px-10 lg:px-16 overflow-hidden text-center"
        style={{ background: '#080B0F' }}
      >
        {/* Animated blue-cyan glow orb */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '60vw', height: '60vw',
              maxWidth: 800, maxHeight: 800,
              bottom: '-20%', left: '50%', translateX: '-50%',
              background: 'radial-gradient(ellipse, rgba(59,130,246,0.22) 0%, rgba(34,211,238,0.08) 45%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.p
            className="bp-eyebrow mb-6 justify-center flex"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            GET STARTED
          </motion.p>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Start with an idea.
            <br />
            <span className="text-white/60">Leave with a blueprint.</span>
          </motion.h2>

          <motion.p
            className="text-white/35 mb-10 text-base max-w-xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Turn your next software idea into a structured engineering foundation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/register"
              id="final-cta-btn"
              className="bp-btn-primary px-8 py-4 text-base inline-flex items-center gap-2"
              style={{ fontSize: '15px' }}
            >
              Create Your Blueprint
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer
        id="footer"
        className="px-6 md:px-10 lg:px-16 pt-16 pb-8"
        style={{ background: '#060810', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bp-blue/10 border border-bp-blue/20">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2"/>
                  <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.7"/>
                  <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.7"/>
                  <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">BlueprintAI</span>
            </div>
            <p className="text-xs text-white/25 leading-relaxed max-w-[180px]">
              AI-powered software planning.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="bp-mono text-[9px] text-white/25 mb-4 tracking-widest uppercase">Product</p>
            <nav className="space-y-2.5">
              {['Workspace', 'Blueprint', 'AI Copilot'].map((item) => (
                <a key={item} href="#" className="block text-xs text-white/30 hover:text-white/60 transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div>
            <p className="bp-mono text-[9px] text-white/25 mb-4 tracking-widest uppercase">Resources</p>
            <nav className="space-y-2.5">
              {['Documentation', 'RAG', 'Technology'].map((item) => (
                <a key={item} href="#" className="block text-xs text-white/30 hover:text-white/60 transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Project */}
          <div>
            <p className="bp-mono text-[9px] text-white/25 mb-4 tracking-widest uppercase">Project</p>
            <nav className="space-y-2.5">
              {['About', 'GitHub', 'Contact'].map((item) => (
                <a key={item} href="#" className="block text-xs text-white/30 hover:text-white/60 transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bp-divider mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="bp-mono text-[10px] text-white/18">© 2026 BlueprintAI</p>
          <p className="bp-mono text-[10px] text-white/18">
            Idea → Requirements → Blueprint → Engineering
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
