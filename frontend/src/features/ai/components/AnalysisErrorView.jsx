/**
 * AnalysisErrorView.jsx
 *
 * Renders error alert card with Retry and Edit Requirements navigation options.
 */

import { Link } from 'react-router-dom';

const CARD_STYLE = {
  background: '#11161D',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.4)',
};

const AnalysisErrorView = ({ errorMessage, projectId, onRetry }) => {
  return (
    <div style={CARD_STYLE} className="p-6 sm:p-8 text-center animate-fade-in w-full max-w-2xl mx-auto">
      <div className="text-red-400 text-3xl mb-4">⚠️</div>
      <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-2">Analysis Failed</h2>
      <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-md mx-auto leading-relaxed">{errorMessage}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to={`/projects/${projectId}/requirements`}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs sm:text-sm transition-colors text-slate-200 font-medium"
        >
          Edit Requirements
        </Link>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs sm:text-sm transition-colors text-white font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default AnalysisErrorView;
