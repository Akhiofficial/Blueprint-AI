import { BLUEPRINT_STEPS } from '../utils/dashboardUtils';

/**
 * BlueprintProgress
 *
 * Displays the five core blueprint artifact steps for a project.
 * Shows which steps are complete and which are pending.
 *
 * Props:
 *   completedSteps {string[]} — Array of step keys that are done.
 *                               Empty array = nothing generated yet.
 *                               Comes from getProgressFromStatus() for now;
 *                               will be replaced with real document data in Phase 2.
 */
const BlueprintProgress = ({ completedSteps = [] }) => {
  const completed = completedSteps.length;
  const total     = BLUEPRINT_STEPS.length;

  return (
    <div className="dash-progress">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono uppercase tracking-wider text-[0.6rem] font-medium text-slate-400">
          Blueprint Progress
        </span>
        <span className="font-mono tabular-nums text-[0.65rem] font-semibold text-bp-cyan">
          {completed} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 rounded-full mb-3 overflow-hidden bg-white/[0.07]"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Blueprint progress: ${completed} of ${total} artifacts complete`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(completed / total) * 100}%`,
            background: completed === total
              ? 'linear-gradient(90deg, #3B82F6, #22D3EE)'
              : '#3B82F6',
          }}
        />
      </div>

      {/* Step list */}
      <ul className="space-y-1.5">
        {BLUEPRINT_STEPS.map((step) => {
          const done = completedSteps.includes(step.key);
          return (
            <li
              key={step.key}
              className="flex items-center gap-2"
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#22D3EE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                  <polyline points="3.5 8.5 6.5 11.5 12.5 5.5"></polyline>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" aria-hidden className="shrink-0">
                  <circle cx="8" cy="8" r="5"></circle>
                </svg>
              )}
              <span
                className={`text-xs ${done ? 'text-white/80 font-medium' : 'text-white/35 font-normal'}`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BlueprintProgress;
