import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Blueprint graph nodes matching the reference image
// Rectangular cards with small dot indicators, connected by SVG lines
const NODES = [
  { id: 'idea',         label: 'IDEA',         x: 50,  y: 5,  col: 1 },
  { id: 'requirements', label: 'REQUIREMENTS',  x: 50,  y: 30, col: 1 },
  { id: 'brd',          label: 'BRD',           x: 18,  y: 58, col: 0 },
  { id: 'srs',          label: 'SRS',           x: 50,  y: 58, col: 1 },
  { id: 'stories',      label: 'USER STORIES',  x: 82,  y: 58, col: 2 },
  { id: 'database',     label: 'DATABASE',      x: 35,  y: 85, col: 0 },
  { id: 'api',          label: 'API',           x: 65,  y: 85, col: 2 },
];

// Edges between nodes
const EDGES = [
  { from: 'idea',         to: 'requirements' },
  { from: 'requirements', to: 'brd' },
  { from: 'requirements', to: 'srs' },
  { from: 'requirements', to: 'stories' },
  { from: 'srs',          to: 'database' },
  { from: 'srs',          to: 'api' },
];

// Dot colors matching brand palette
const DOT_COLORS = {
  0: '#3B82F6',  // blue
  1: '#22D3EE',  // cyan
  2: '#3B82F6',  // blue
};

const BlueprintGraph = () => {
  const svgRef   = useRef(null);
  const nodesRef = useRef([]);
  const linesRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── 1. Animate nodes appearing staggered ──
      gsap.from(nodesRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 12,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.8,
        transformOrigin: 'center center',
      });

      // ── 2. Animate lines drawing in (strokeDashoffset) ──
      const lines = linesRef.current.filter(Boolean);
      lines.forEach((line) => {
        if (!line) return;
        const length = line.getTotalLength?.() ?? 200;
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(line, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          delay: 1.2,
        });
      });

      // ── 3. Continuous very slow float on the whole graph ──
      gsap.to(svgRef.current, {
        y: '-=6',
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // ── 4. Pulse dots on each node ──
      const dots = svgRef.current?.querySelectorAll('.node-dot');
      if (dots) {
        gsap.to(dots, {
          scale: 1.4,
          opacity: 0.6,
          duration: 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 0.3,
          transformOrigin: 'center center',
        });
      }

      // ── 5. Animate data pulse travelling along edges ──
      const pulses = svgRef.current?.querySelectorAll('.edge-pulse');
      if (pulses) {
        pulses.forEach((pulse, i) => {
          const path = linesRef.current[i];
          if (!path) return;
          const length = path.getTotalLength?.() ?? 100;
          gsap.to(pulse, {
            motionPath: { path, align: path, autoRotate: false },
            duration: 2.5,
            ease: 'none',
            repeat: -1,
            delay: 1.8 + i * 0.4,
          });
        });
      }
    }, svgRef);

    return () => ctx.revert();
  }, []);

  // We render a viewBox SVG and overlay node HTML cards using absolute positioning
  // For simplicity we'll use a single SVG with foreignObject for node cards
  return (
    <div
      id="blueprint-graph"
      className="relative w-full"
      style={{ height: '340px' }}
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        viewBox="0 0 700 340"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* ── Grid dots in background ── */}
        <defs>
          <pattern id="bp-graph-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.8" fill="rgba(255,255,255,0.08)" />
          </pattern>
          <filter id="glow-blue">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-cyan">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="700" height="340" fill="url(#bp-graph-grid)" rx="8" />

        {/* ── Edges (lines) ── */}
        {EDGES.map((edge, i) => {
          const from = NODES.find((n) => n.id === edge.from);
          const to   = NODES.find((n) => n.id === edge.to);
          if (!from || !to) return null;
          const x1 = (from.x / 100) * 700;
          const y1 = (from.y / 100) * 340 + 22;
          const x2 = (to.x / 100) * 700;
          const y2 = (to.y / 100) * 340;

          // Mid control point for slight curve
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;

          return (
            <g key={edge.from + edge.to}>
              <path
                ref={(el) => { linesRef.current[i] = el; }}
                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
              />
              {/* Glow overlay */}
              <path
                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                stroke="rgba(34, 211, 238, 0.12)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {NODES.map((node, i) => {
          const cx = (node.x / 100) * 700;
          const cy = (node.y / 100) * 340;
          const w  = node.label === 'USER STORIES' ? 108 : node.label === 'REQUIREMENTS' ? 108 : 88;
          const h  = 34;
          const dotColor = DOT_COLORS[node.col];

          return (
            <g
              key={node.id}
              ref={(el) => { nodesRef.current[i] = el; }}
              transform={`translate(${cx - w / 2}, ${cy - h / 2})`}
            >
              {/* Card background */}
              <rect
                width={w}
                height={h}
                rx="6"
                fill="rgba(13, 17, 23, 0.95)"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              {/* Card inner highlight */}
              <rect
                width={w}
                height={h}
                rx="6"
                fill="url(#card-shine)"
                opacity="0.4"
              />
              {/* Dot indicator */}
              <circle
                className="node-dot"
                cx="12"
                cy={h / 2}
                r="3.5"
                fill={dotColor}
                filter={dotColor === '#22D3EE' ? 'url(#glow-cyan)' : 'url(#glow-blue)'}
              />
              {/* Label text */}
              <text
                x="22"
                y={h / 2 + 4.5}
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="500"
                fill="rgba(255,255,255,0.85)"
                letterSpacing="0.08em"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BlueprintGraph;
