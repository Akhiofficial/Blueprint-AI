import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Spotlight component centered on the mouse inside the layout
const AuthSpotlight = ({ springX, springY }) => {
  const xPx = useTransform(springX, [0, 1], ['0vw', '100vw']);
  const yPx = useTransform(springY, [0, 1], ['0px', '100vh']);

  return (
    <motion.div
      aria-hidden
      className="absolute rounded-full pointer-events-none z-0"
      style={{
        width: 500,
        height: 500,
        left: xPx,
        top: yPx,
        translateX: '-50%',
        translateY: '-50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, rgba(34,211,238,0.05) 40%, transparent 70%)',
        filter: 'blur(44px)',
      }}
    />
  );
};

const AuthLayout = ({ children, title, subtitle }) => {
  const containerRef = useRef(null);

  // Mouse tracking for the spotlight
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const springX = useSpring(rawX, { stiffness: 65, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 65, damping: 20 });

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  }, [rawX, rawY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bp-noise"
      style={{ background: '#080B0F', color: '#F4F7FA' }}
    >
      {/* ── Background Gradients & Spotlight ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {/* Subtle base blue glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: '60vw', height: '60vw',
            bottom: '-15%', left: '50%', transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Spot light overlay */}
      <AuthSpotlight springX={springX} springY={springY} />

      {/* ── Auth Card wrapper ── */}
      <motion.div
        className="relative z-10 w-full max-w-[400px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo and header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bp-blue/10 border border-bp-blue/25 transition-colors group-hover:border-bp-blue/40">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.8"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.6"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5"/>
              </svg>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">BlueprintAI</span>
          </Link>

          <span className="bp-mono text-[9px] text-bp-cyan/60 uppercase tracking-[0.2em] mb-2 font-medium">
            BLUEPRINTAI / AUTH
          </span>
          {title && (
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-slate-400 font-normal leading-relaxed max-w-[280px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* The Card container */}
        <div
          className="rounded-2xl p-7 border border-white/[0.08]"
          style={{
            background: '#11161D',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0, 0, 0, 0.45)',
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
