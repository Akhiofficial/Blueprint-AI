import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    id: '01',
    title: 'Idea',
    description: 'Describe the product you intend to build.',
    detail: 'Start by describing your product in plain language. No technical knowledge needed — just your vision.',
  },
  {
    id: '02',
    title: 'Analyze',
    description: 'Scope, actors and constraints are extracted.',
    detail: 'BlueprintAI identifies functional requirements, user roles, constraints and project context automatically.',
  },
  {
    id: '03',
    title: 'Generate',
    description: 'BRD, SRS, schemas and APIs are drafted.',
    detail: 'Five core engineering documents are generated simultaneously — structured, consistent and ready to review.',
  },
  {
    id: '04',
    title: 'Refine',
    description: 'Edit with the copilot without losing structure.',
    detail: 'Use the AI copilot to improve, expand or regenerate any section. Your document structure stays intact.',
  },
  {
    id: '05',
    title: 'Export',
    description: 'PDF or Markdown, ready for development.',
    detail: 'Export your complete blueprint as PDF or Markdown and hand it off to your engineering team.',
  },
];

const WorkflowSteps = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const trackRef     = useRef(null);
  const fillRef      = useRef(null);

  // Sync fill line width whenever activeStep changes
  const syncLine = useCallback((step) => {
    if (!fillRef.current) return;
    const pct = step === 0 ? 0 : (step / (STEPS.length - 1)) * 100;
    gsap.to(fillRef.current, {
      width: `${pct}%`,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, []);

  useEffect(() => {
    syncLine(activeStep);
  }, [activeStep, syncLine]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Scroll-driven step activation ──
      // scrub: true ties progress directly to scroll position
      ScrollTrigger.create({
        trigger: containerRef.current,
        // Start when top of section hits 60% from top of viewport
        // End when bottom of section leaves 40% from top
        start: 'top 55%',
        end: 'bottom 45%',
        onUpdate: (self) => {
          // self.progress: 0 → 1 as section scrolls through viewport
          const step = Math.min(
            STEPS.length - 1,
            Math.floor(self.progress * STEPS.length)
          );
          setActiveStep(step);
        },
        onLeaveBack: () => setActiveStep(0),
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} id="workflow-steps" className="w-full">

      {/* ── Dot + Line row ── */}
      <div className="relative mb-6">

        {/* Background track — always visible */}
        <div
          ref={trackRef}
          className="hidden md:block absolute"
          style={{
            top: '50%',
            left: 'calc(10% + 12px)',
            right: 'calc(10% + 12px)',
            height: '2px',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '2px',
          }}
        />

        {/* Animated fill line */}
        <div
          className="hidden md:block absolute"
          style={{
            top: '50%',
            left: 'calc(10% + 12px)',
            right: 'calc(10% + 12px)',
            height: '2px',
            transform: 'translateY(-50%)',
          }}
        >
          <div
            ref={fillRef}
            style={{
              height: '100%',
              width: '0%',
              background: 'linear-gradient(90deg, #3B82F6 0%, #22D3EE 100%)',
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(34, 211, 238, 0.7), 0 0 20px rgba(59, 130, 246, 0.4)',
              transition: 'none',
            }}
          />
        </div>

        {/* Dot row */}
        <div className="flex justify-between relative" style={{ padding: '0 10%' }}>
          {STEPS.map((step, i) => {
            const isActive  = i <= activeStep;
            const isCurrent = i === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(i)}
                className="relative flex flex-col items-center gap-0"
                aria-label={`Step ${step.id}: ${step.title}`}
              >
                {/* Dot container */}
                <div className="relative flex items-center justify-center" style={{ width: 24, height: 24 }}>
                  {/* Pulse ring on current */}
                  {isCurrent && (
                    <motion.div
                      className="absolute rounded-full"
                      style={{ border: '1px solid rgba(34,211,238,0.35)' }}
                      animate={{
                        width: [16, 28, 16],
                        height: [16, 28, 16],
                        opacity: [0.7, 0, 0.7],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                  {/* Core dot */}
                  <motion.div
                    className="rounded-full"
                    animate={{
                      width:      isCurrent ? 12 : isActive ? 9 : 8,
                      height:     isCurrent ? 12 : isActive ? 9 : 8,
                      background: isActive
                        ? isCurrent
                          ? 'linear-gradient(135deg, #3B82F6, #22D3EE)'
                          : '#22D3EE'
                        : 'rgba(255,255,255,0.18)',
                      boxShadow: isCurrent
                        ? '0 0 18px rgba(34,211,238,0.9), 0 0 6px rgba(59,130,246,0.7)'
                        : isActive
                          ? '0 0 8px rgba(34,211,238,0.5)'
                          : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step labels row ── */}
      <div className="grid grid-cols-5 gap-2">
        {STEPS.map((step, i) => {
          const isActive  = i <= activeStep;
          const isCurrent = i === activeStep;
          return (
            <motion.button
              key={step.id}
              id={`workflow-step-${step.id}`}
              onClick={() => setActiveStep(i)}
              className="flex flex-col items-center text-center gap-1 px-0"
            >
              <motion.p
                className="bp-mono text-[9px] mb-0.5"
                animate={{ color: isActive ? 'rgba(34,211,238,0.75)' : 'rgba(255,255,255,0.2)' }}
                transition={{ duration: 0.3 }}
              >
                {step.id}
              </motion.p>
              <motion.h3
                className="text-sm font-semibold leading-tight"
                animate={{
                  color: isCurrent ? '#ffffff' : isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)',
                }}
                transition={{ duration: 0.3 }}
              >
                {step.title}
              </motion.h3>
              <motion.p
                className="text-xs leading-relaxed max-w-[150px]"
                animate={{ color: isActive ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.16)' }}
                transition={{ duration: 0.3 }}
              >
                {step.description}
              </motion.p>
            </motion.button>
          );
        })}
      </div>

      {/* ── Expanded detail panel ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mt-8 px-5 py-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(34,211,238,0.03))',
            border: '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="bp-req-badge">{STEPS[activeStep].id}</span>
            <span className="text-sm font-semibold text-white">{STEPS[activeStep].title}</span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed">{STEPS[activeStep].detail}</p>
        </motion.div>
      </AnimatePresence>

      {/* ── Scroll hint (shows when at step 0) ── */}
      <AnimatePresence>
        {activeStep === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bp-mono text-[9px] text-white/20 text-center mt-4"
          >
            ↓ scroll to advance steps
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowSteps;
