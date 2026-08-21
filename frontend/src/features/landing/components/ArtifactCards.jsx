import { motion } from 'framer-motion';

// Five premium artifact cards matching spec — BRD, SRS, User Stories, Database, API
// Each has a mini visualization relevant to the document type

const ARTIFACTS = [
  {
    id:    'brd',
    label: '01',
    title: 'BRD',
    full:  'Business Requirement Document',
    desc:  'Business goals, scope, stakeholders and expected outcomes.',
    color: '#3B82F6',
    visual: 'brd',
  },
  {
    id:    'srs',
    label: '02',
    title: 'SRS',
    full:  'Software Requirements Specification',
    desc:  'Functional and non-functional requirements structured for implementation.',
    color: '#22D3EE',
    visual: 'srs',
  },
  {
    id:    'stories',
    label: '03',
    title: 'User Stories',
    full:  'Actor-Driven Requirements',
    desc:  'Actor-driven requirements that translate product goals into actionable development needs.',
    color: '#3B82F6',
    visual: 'stories',
  },
  {
    id:    'database',
    label: '04',
    title: 'Database',
    full:  'Schema Design',
    desc:  'Database schema generated from project requirements. Collections, fields and relationships.',
    color: '#22D3EE',
    visual: 'database',
  },
  {
    id:    'api',
    label: '05',
    title: 'API',
    full:  'REST API Design',
    desc:  'REST API design derived from system requirements. Endpoints, methods, requests and responses.',
    color: '#3B82F6',
    visual: 'api',
  },
];

// Mini visual previews for each card
const CardVisual = ({ type, color }) => {
  const cyan = '#22D3EE';

  if (type === 'brd') {
    return (
      <svg viewBox="0 0 120 72" className="w-full h-full">
        <rect width="120" height="72" fill="rgba(0,0,0,0)" />
        {/* Document lines */}
        {[8, 18, 28, 38, 48].map((y, i) => (
          <rect key={i} x="8" y={y} width={i === 0 ? 60 : i === 2 ? 80 : 70} height="4" rx="2"
            fill={i === 0 ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.12)'} />
        ))}
        <rect x="8" y="58" width="40" height="8" rx="2" fill="rgba(59,130,246,0.3)" />
        <rect x="52" y="58" width="30" height="8" rx="2" fill="rgba(255,255,255,0.08)" />
      </svg>
    );
  }

  if (type === 'srs') {
    return (
      <svg viewBox="0 0 120 72" className="w-full h-full">
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(8, ${8 + i * 16})`}>
            <circle cx="4" cy="4" r="2.5" fill={i === 0 ? cyan : 'rgba(255,255,255,0.2)'} />
            <rect x="12" y="1" width={i === 1 ? 55 : i === 3 ? 45 : 65} height="3" rx="1.5"
              fill={i === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'} />
            {i < 3 && (
              <rect x="12" y="7" width={i === 0 ? 80 : 70} height="2" rx="1"
                fill="rgba(255,255,255,0.07)" />
            )}
          </g>
        ))}
        <rect x="8" y="66" width="104" height="1" rx="0.5" fill="rgba(34,211,238,0.2)" />
      </svg>
    );
  }

  if (type === 'stories') {
    return (
      <svg viewBox="0 0 120 72" className="w-full h-full">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${8 + i * 38}, 8)`}>
            <rect width="34" height="52" rx="5"
              fill={i === 1 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)'}
              stroke={i === 1 ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}
              strokeWidth="1" />
            <rect x="4" y="6" width="26" height="2.5" rx="1.25"
              fill={i === 1 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'} />
            <rect x="4" y="12" width="20" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
            <rect x="4" y="16" width="22" height="2" rx="1" fill="rgba(255,255,255,0.06)" />
            <circle cx="4" cy="36" r="2" fill={i === 1 ? '#22D3EE' : 'rgba(255,255,255,0.1)'} />
          </g>
        ))}
      </svg>
    );
  }

  if (type === 'database') {
    return (
      <svg viewBox="0 0 120 72" className="w-full h-full">
        {/* Table header */}
        <rect x="8" y="8" width="104" height="14" rx="3" fill="rgba(34,211,238,0.12)"
          stroke="rgba(34,211,238,0.25)" strokeWidth="1" />
        <rect x="14" y="13" width="20" height="3" rx="1.5" fill="rgba(34,211,238,0.6)" />
        <rect x="44" y="13" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
        <rect x="72" y="13" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
        {/* Rows */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="8" y={26 + i * 13} width="104" height="12" rx="2"
              fill={i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <rect x="14" y={29 + i * 13} width={12 + i * 4} height="2.5" rx="1.25" fill="rgba(255,255,255,0.2)" />
            <rect x="44" y={29 + i * 13} width="14" height="2.5" rx="1.25" fill="rgba(255,255,255,0.1)" />
            <rect x="72" y={29 + i * 13} width="12" height="2.5" rx="1.25" fill="rgba(59,130,246,0.3)" />
          </g>
        ))}
      </svg>
    );
  }

  if (type === 'api') {
    const endpoints = [
      { method: 'GET',    path: '/users', color: '#22D3EE' },
      { method: 'POST',   path: '/users', color: '#3B82F6' },
      { method: 'DELETE', path: '/users/:id', color: '#EF4444' },
    ];
    return (
      <svg viewBox="0 0 120 72" className="w-full h-full">
        {endpoints.map((ep, i) => (
          <g key={i} transform={`translate(8, ${6 + i * 22})`}>
            <rect width="104" height="18" rx="3"
              fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <rect x="4" y="5" width={ep.method === 'DELETE' ? 38 : 24} height="8" rx="2"
              fill={`${ep.color}22`} />
            <text x="8" y="12"
              fontSize="7" fontFamily="JetBrains Mono, monospace" fill={ep.color} fontWeight="600">
              {ep.method}
            </text>
            <text x={ep.method === 'DELETE' ? 50 : 34} y="12"
              fontSize="7" fontFamily="JetBrains Mono, monospace" fill="rgba(255,255,255,0.4)">
              {ep.path}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  return null;
};

const ArtifactCards = () => {
  return (
    <div
      id="artifact-cards"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {ARTIFACTS.map((artifact, i) => (
        <motion.div
          key={artifact.id}
          id={`artifact-card-${artifact.id}`}
          className="bp-card p-4 flex flex-col cursor-default"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
          whileHover={{
            y: -4,
            boxShadow: `0 0 0 1px ${artifact.color}40, 0 12px 40px rgba(0,0,0,0.5), 0 0 24px ${artifact.color}20`,
            transition: { duration: 0.2 },
          }}
        >
          {/* Mini visualization */}
          <div
            className="w-full mb-3 rounded overflow-hidden"
            style={{
              height: '72px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <CardVisual type={artifact.visual} color={artifact.color} />
          </div>

          {/* Label + title */}
          <p className="bp-mono text-[9px] mb-1" style={{ color: artifact.color, opacity: 0.7 }}>
            {artifact.label}
          </p>
          <h3 className="text-sm font-semibold text-white mb-1">{artifact.title}</h3>
          <p className="bp-mono text-[9px] text-white/30 mb-2">{artifact.full}</p>
          <p className="text-xs text-white/35 leading-relaxed flex-1">{artifact.desc}</p>

          {/* Bottom accent line */}
          <div
            className="mt-3 h-px w-full rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: `linear-gradient(90deg, ${artifact.color}60, transparent)` }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ArtifactCards;
