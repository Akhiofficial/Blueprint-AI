/**
 * UserStoryView.jsx
 *
 * Renders User Stories as structured story cards with view and edit modes.
 * In edit mode, allows direct editing of:
 *   - Story ID, Title, Priority
 *   - Role ("As a"), Want ("I want"), Benefit ("So that")
 *   - Actor
 *   - Acceptance Criteria (one item per line)
 */

import { useState, useEffect, useCallback, memo } from 'react';

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

const StoryCard = memo(({
  story,
  isEditing,
  onStoryChange,
  onRegen,
  isRegenerating
}) => {
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  const handleFieldChange = (field, value) => {
    onStoryChange?.({ ...story, [field]: value });
  };

  const handleCriteriaChange = (e) => {
    const list = e.target.value.split('\n').filter(line => line.trim().length > 0);
    handleFieldChange('acceptanceCriteria', list);
  };

  if (isEditing) {
    return (
      <div className="ws-story-card p-5 space-y-4" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
        {/* Card Header Edit */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1">
            <span
              className="bp-mono px-2 py-1 rounded text-xs font-semibold"
              style={{
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.15)',
                color: '#22D3EE',
                fontSize: '0.65rem',
              }}
            >
              {story.id}
            </span>
            <input
              type="text"
              className="flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
              value={story.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Story Title"
            />
          </div>
          <select
            value={story.priority || 'Medium'}
            onChange={(e) => handleFieldChange('priority', e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium bg-[#11161D] border border-white/15 text-white outline-none cursor-pointer"
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Story Body Edit — As a / I want / So that */}
        <div
          className="rounded-lg px-4 py-3.5 space-y-3"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-medium text-xs" style={{ color: '#60A5FA', minWidth: 60 }}>As a</span>
            <input
              type="text"
              className="flex-1 rounded px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
              value={story.role || ''}
              onChange={(e) => {
                handleFieldChange('role', e.target.value);
                if (!story.actor || story.actor === story.role) {
                  handleFieldChange('actor', e.target.value);
                }
              }}
              placeholder="User role (e.g. Registered Student)"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-medium text-xs" style={{ color: '#60A5FA', minWidth: 60 }}>I want</span>
            <input
              type="text"
              className="flex-1 rounded px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
              value={story.want || ''}
              onChange={(e) => handleFieldChange('want', e.target.value)}
              placeholder="Goal (e.g. view my active bookings)"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-medium text-xs" style={{ color: '#60A5FA', minWidth: 60 }}>So that</span>
            <input
              type="text"
              className="flex-1 rounded px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
              value={story.benefit || ''}
              onChange={(e) => handleFieldChange('benefit', e.target.value)}
              placeholder="Benefit (e.g. I can keep track of my schedule)"
            />
          </div>
        </div>

        {/* Acceptance Criteria Edit */}
        <div>
          <label
            className="block bp-mono uppercase mb-1.5"
            style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}
          >
            Acceptance Criteria (One per line)
          </label>
          <textarea
            className="w-full rounded-lg px-3 py-2 text-xs bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none min-h-[80px]"
            value={(story.acceptanceCriteria || []).join('\n')}
            onChange={handleCriteriaChange}
            placeholder="✓ User can see list of items&#10;✓ Click item to view details"
          />
        </div>
      </div>
    );
  }

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
          Actor: <span style={{ color: 'rgba(255,255,255,0.65)' }}>{story.actor || story.role}</span>
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
          {(story.acceptanceCriteria || []).map((criterion, i) => (
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
});

StoryCard.displayName = 'StoryCard';

const UserStoryView = ({ document, isEditing, onStoriesChange, regenStoryId, onRegenStory }) => {
  const [draftStories, setDraftStories] = useState(() => document?.stories || []);

  // Sync draft when document changes or edit mode toggles
  useEffect(() => {
    if (document?.stories) {
      setDraftStories(document.stories);
    }
  }, [document?.stories, isEditing]);

  const handleStoryChange = useCallback((idx, updatedStory) => {
    setDraftStories(prev => {
      const next = [...prev];
      next[idx] = updatedStory;
      onStoriesChange?.(next);
      return next;
    });
  }, [onStoriesChange]);

  if (!document?.stories) return null;

  const displayList = isEditing ? draftStories : (document.stories || []);

  return (
    <div className="px-6 py-5 space-y-4">
      {/* Header count */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {displayList.length} stories
        </p>
        {isEditing && (
          <span className="text-xs text-blue-400 font-medium">
            Editing Story Cards
          </span>
        )}
      </div>

      {displayList.map((story, idx) => (
        <div key={story.id || idx} style={isEditing ? undefined : { animationDelay: `${idx * 60}ms` }}>
          <StoryCard
            story={story}
            isEditing={isEditing}
            onStoryChange={(updated) => handleStoryChange(idx, updated)}
            onRegen={onRegenStory}
            isRegenerating={regenStoryId === story.id}
          />
        </div>
      ))}
    </div>
  );
};

export default UserStoryView;

