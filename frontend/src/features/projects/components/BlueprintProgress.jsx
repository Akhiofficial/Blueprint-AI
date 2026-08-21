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
      <div className="flex items-center justify-between mb-2.5">
        <span
          className="bp-mono uppercase tracking-wider"
          style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}
        >
          Blueprint Progress
        </span>
        <span
          className="bp-mono tabular-nums"
          style={{ fontSize: '0.65rem', color: '#22D3EE' }}
        >
          {completed} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-0.5 rounded-full mb-3 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.07)' }}
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
                <span
                  style={{ color: '#22D3EE', fontSize: '0.7rem', lineHeight: 1 }}
                  aria-hidden
                >
                  ✓
                </span>
              ) : (
                <span
                  style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', lineHeight: 1 }}
                  aria-hidden
                >
                  ○
                </span>
              )}
              <span
                className="text-xs"
                style={{ color: done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}
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
