/**
 * UserStoryView.jsx
 *
 * Renders User Stories as structured story cards.
 * NOT a plain text document — each story has its own card with:
 *   - Story ID badge
 *   - As a / I want / So that format
 *   - Actor + Priority badges
 *   - Acceptance Criteria list
 *   - Individual Regenerate action
 */

import { useState } from 'react';

const PriorityBadge = ({ priority }) => {
  const cls = {
    High:   'ws-priority-high',
    Medium: 'ws-priority-medium',
    Low:    'ws-priority-low',
  }[priority] || 'ws-priority-low';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}
    >
      {priority}
    </span>
  );
};

const StoryCard = ({ story, onRegen, isRegenerating }) => {
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  return (
    <div className="ws-story-card p-5 ws-enter-up">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Story ID */}
          <span
            className="bp-mono px-2 py-0.5 rounded text-xs font-semibold"
            style={{
              background: 'rgba(34,211,238,0.08)',
              border: '1px solid rgba(34,211,238,0.15)',
              color: '#22D3EE',
              fontSize: '0.62rem',
              letterSpacing: '0.06em',
            }}
          >
            {story.id}
          </span>
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {story.title}
          </h3>
        </div>
        <PriorityBadge priority={story.priority} />
      </div>

      {/* Story body — As a / I want / So that */}
      <div
        className="rounded-lg px-4 py-3.5 mb-4 space-y-2"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex gap-2 text-sm">
          <span className="shrink-0 font-medium" style={{ color: '#60A5FA', minWidth: 56, fontSize: '0.75rem' }}>As a</span>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{story.role},</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="shrink-0 font-medium" style={{ color: '#60A5FA', minWidth: 56, fontSize: '0.75rem' }}>I want</span>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{story.want},</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="shrink-0 font-medium" style={{ color: '#60A5FA', minWidth: 56, fontSize: '0.75rem' }}>So that</span>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{story.benefit}.</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <span>
          Actor: <span style={{ color: 'rgba(255,255,255,0.65)' }}>{story.actor}</span>
        </span>
      </div>

      {/* Acceptance criteria */}
      <div>
        <p
          className="bp-mono uppercase mb-2"
          style={{ fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)' }}
        >
          Acceptance Criteria
        </p>
        <ul className="space-y-1.5">
          {story.acceptanceCriteria.map((criterion, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-xs"
              style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 mt-0.5" aria-hidden>
                <path d="M2 6l2.5 2.5L10 3.5" stroke="#34D399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {criterion}
            </li>
          ))}
        </ul>
      </div>

      {/* Regenerate section */}
      <div className="mt-4 pt-3 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {isRegenerating ? (
          <span className="flex items-center gap-1.5 text-xs animate-pulse" style={{ color: '#60A5FA' }}>
            <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
            Regenerating…
          </span>
        ) : showRegenConfirm ? (
          <span className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Regenerate this story?
            <button
              onClick={() => { setShowRegenConfirm(false); onRegen?.(story.id); }}
              className="font-semibold"
              style={{ color: '#60A5FA' }}
            >Confirm</button>
            <button
              onClick={() => setShowRegenConfirm(false)}
              className="hover:text-white transition-colors"
            >Cancel</button>
          </span>
        ) : (
          <button
            id={`ws-regen-story-${story.id}`}
            onClick={() => setShowRegenConfirm(true)}
            className="flex items-center gap-1.5 text-xs transition-all"
            style={{ color: 'rgba(255,255,255,0.28)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#60A5FA'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M9 5A4 4 0 1 1 6.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M6.5 0v2.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Regenerate story
          </button>
        )}
      </div>
    </div>
  );
};

const UserStoryView = ({ document, regenStoryId, onRegenStory }) => {
  if (!document?.stories) return null;

  return (
    <div className="px-6 py-5 space-y-4">
      {/* Header count */}
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {document.stories.length} stories
      </p>

      {document.stories.map((story, idx) => (
        <div key={story.id} style={{ animationDelay: `${idx * 60}ms` }}>
          <StoryCard
            story={story}
            onRegen={onRegenStory}
            isRegenerating={regenStoryId === story.id}
          />
        </div>
      ))}
    </div>
  );
};

export default UserStoryView;
