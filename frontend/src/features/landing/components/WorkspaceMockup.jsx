import { motion } from 'framer-motion';

// Workspace mockup matching the reference image exactly:
// 3-column layout: left=project nav, center=SRS doc, right=AI Copilot

const WorkspaceMockup = () => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 24 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div
      id="workspace-mockup"
      className="w-full rounded-xl overflow-hidden border border-white/[0.07] shadow-2xl"
      style={{
        background: '#0D1117',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.6)',
      }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* ── Top bar (breadcrumb) ── */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="bp-mono text-xs text-white/30 ml-2">
            blueprintai / campus-placement-platform / srs
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="bp-mono text-xs text-white/30">v3 · synced</span>
        </div>
      </motion.div>

      {/* ── 3-column workspace ── */}
      <div className="flex" style={{ minHeight: '440px' }}>

        {/* Left: Project navigation */}
        <motion.div
          variants={itemVariants}
          className="w-40 flex-shrink-0 border-r border-white/[0.06] p-4"
          style={{ background: 'rgba(8,11,15,0.5)' }}
        >
          <p className="bp-mono text-[9px] text-white/25 mb-3 tracking-widest">PROJECT</p>
          <nav className="space-y-0.5">
            {[
              { label: 'BRD',         active: false },
              { label: 'SRS',         active: true  },
              { label: 'User Stories',active: false },
              { label: 'Database',    active: false },
              { label: 'API',         active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-default transition-colors ${
                  item.active
                    ? 'text-white bg-white/[0.06]'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                {item.active && (
                  <div className="w-0.5 h-4 bg-bp-blue rounded-full -ml-2 mr-0.5 flex-shrink-0" />
                )}
                <span className={`text-xs ${item.active ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </nav>
        </motion.div>

        {/* Center: SRS document */}
        <motion.div
          variants={itemVariants}
          className="flex-1 p-6 overflow-hidden"
          style={{ background: '#0D1117' }}
        >
          <p className="bp-mono text-[9px] text-white/20 mb-4 tracking-widest uppercase">
            Software Requirements Specification
          </p>

          <h2 className="text-lg font-semibold text-white mb-2">01 Introduction</h2>
          <p className="text-xs text-white/45 mb-5 leading-relaxed">
            This document defines the functional and non-functional requirements
            for the campus placement platform, including scope, actors and system constraints.
          </p>

          <h2 className="text-base font-semibold text-white mb-3">02 Functional Requirements</h2>

          {/* FR-001 */}
          <motion.div
            variants={itemVariants}
            className="rounded-lg p-3 mb-2 border border-white/[0.06]"
            style={{ background: 'rgba(59, 130, 246, 0.04)' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bp-req-badge">FR-001</span>
              <span className="text-sm font-medium text-white">User Authentication</span>
            </div>
            <p className="text-xs text-white/40 mb-2 leading-relaxed">
              The system shall allow students to securely register using their university email address.
            </p>
            <div className="flex gap-4">
              <div>
                <span className="bp-mono text-[9px] text-white/25 mr-1.5">Priority</span>
                <span className="bp-mono text-[9px] text-yellow-400 font-medium">HIGH</span>
              </div>
              <div>
                <span className="bp-mono text-[9px] text-white/25 mr-1.5">Status</span>
                <span className="bp-mono text-[9px] text-green-400 font-medium">APPROVED</span>
              </div>
            </div>
          </motion.div>

          {/* FR-002 */}
          <motion.div
            variants={itemVariants}
            className="rounded-lg p-3 border border-white/[0.04]"
            style={{ background: 'rgba(255,255,255,0.01)' }}
          >
            <div className="flex items-center gap-2">
              <span className="bp-req-badge" style={{ opacity: 0.6 }}>FR-002</span>
              <span className="text-sm font-medium text-white/50">Placement Drive Scheduling</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: AI Copilot */}
        <motion.div
          variants={itemVariants}
          className="w-44 flex-shrink-0 border-l border-white/[0.06] p-4 flex flex-col gap-4"
          style={{ background: 'rgba(8,11,15,0.6)' }}
        >
          <div>
            <p className="bp-mono text-[9px] text-white/25 mb-1 tracking-widest">AI COPILOT</p>
            <p className="bp-mono text-[9px] text-white/30">SRS / Authentication</p>
          </div>

          {/* Copilot action buttons */}
          <div className="space-y-1.5">
            {['Improve', 'Expand', 'Regenerate', 'Validate'].map((action) => (
              <div
                key={action}
                className="flex items-center justify-between px-2.5 py-2 rounded border border-white/[0.07] text-xs text-white/50 cursor-default hover:border-bp-blue/30 hover:text-white/70 transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <span>{action}</span>
                <span className="text-white/20">→</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <p className="bp-mono text-[9px] text-white/20 mb-1.5 tracking-widest">STATE</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-bp-cyan animate-pulse" />
              <span className="bp-mono text-[9px] text-bp-cyan">Structuring</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WorkspaceMockup;
