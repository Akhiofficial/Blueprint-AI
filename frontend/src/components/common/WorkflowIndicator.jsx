import React from 'react';

const WORKFLOW_STEPS = [
  { num: '01', label: 'Project' },
  { num: '02', label: 'Requirements' },
  { num: '03', label: 'Analysis' },
  { num: '04', label: 'Blueprint' },
];

const WorkflowIndicator = ({ current = 0 }) => (
  <div 
    className="flex items-center overflow-x-auto pb-2 mb-8 animate-fade-in scrollbar-thin max-w-full" 
    aria-label="Workflow progress"
  >
    {WORKFLOW_STEPS.map((step, i) => {
      const isActive = i === current;
      const isPast   = i < current;
      const isLast   = i === WORKFLOW_STEPS.length - 1;
      return (
        <div key={step.num} className="flex items-center flex-shrink-0">
          <div className="flex flex-col items-center gap-1">
            <span
              className="bp-mono"
              style={{
                fontSize: '0.55rem',
                letterSpacing: '0.1em',
                color: isActive ? '#22D3EE' : isPast ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.15)',
              }}
            >
              {step.num}
            </span>
            <span
              className="text-xs"
              style={{
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)',
              }}
            >
              {step.label}
            </span>
            {/* Active underline */}
            <div
              style={{
                height: '1.5px',
                width: '100%',
                background: isActive
                  ? 'linear-gradient(90deg, #3B82F6, #22D3EE)'
                  : 'transparent',
                borderRadius: '1px',
                marginTop: '1px',
              }}
            />
          </div>

          {/* Connector */}
          {!isLast && (
            <div
              style={{
                width: '2rem',
                height: '1px',
                background: i < current
                  ? 'rgba(34,211,238,0.3)'
                  : 'rgba(255,255,255,0.07)',
                margin: '0 0.5rem',
                marginBottom: '0.75rem',
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

export default WorkflowIndicator;
