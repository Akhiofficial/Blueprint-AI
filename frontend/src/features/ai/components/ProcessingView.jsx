/**
 * ProcessingView.jsx
 *
 * Displays step-by-step progress animation while requirement analysis is in progress.
 */

import { ANALYSIS_STAGES } from '../services/analysisService';

const CARD_STYLE = {
  background: '#11161D',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.4)',
};

const ProcessingView = ({ stageIndex }) => {
  return (
    <div style={CARD_STYLE} className="w-full max-w-2xl mx-auto p-6 sm:p-10 animate-fade-in mt-8 sm:mt-12 overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <span className="w-5 h-5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 truncate">Analyzing requirements...</h2>
          <p className="text-xs sm:text-sm text-slate-400">Blueprint Engine is structuring your project requirements.</p>
        </div>
      </div>

      <div className="space-y-4">
        {ANALYSIS_STAGES.map((stage, idx) => {
          const isCompleted = idx < stageIndex;
          const isActive = idx === stageIndex;

          let icon;
          let colorStyle;

          if (isCompleted) {
            icon = (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            );
            colorStyle = { color: 'rgba(255,255,255,0.6)' };
          } else if (isActive) {
            icon = <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />;
            colorStyle = { color: 'rgba(255,255,255,0.95)', fontWeight: 500 };
          } else {
            icon = <div className="w-2 h-2 rounded-full bg-slate-700" />;
            colorStyle = { color: 'rgba(255,255,255,0.2)' };
          }

          return (
            <div key={stage.id} className="flex items-center gap-4 transition-all duration-300">
              <div className="w-6 shrink-0 flex justify-center">{icon}</div>
              <span className="text-xs sm:text-sm leading-tight" style={colorStyle}>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingView;
