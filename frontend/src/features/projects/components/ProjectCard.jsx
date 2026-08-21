import { Link } from 'react-router-dom';
import Badge from '../../../components/ui/Badge';
import BlueprintProgress from './BlueprintProgress';
import {
  formatRelativeTime,
  getProgressFromStatus,
  getStatusMeta,
} from '../utils/dashboardUtils';

const categoryColors = {
  'Web App': 'indigo',
  Mobile:   'green',
  API:      'yellow',
  DevOps:   'slate',
  'AI / ML': 'red',
};

/**
 * ProjectCard
 *
 * A rich project card for the Dashboard grid.
 * Communicates: what the project is, how far along it is, and what to do next.
 *
 * Props:
 *   project {Object} — Full project document from the API.
 *   onDelete {Function} — Called with project._id when user requests deletion.
 */
const ProjectCard = ({ project, onDelete }) => {
  const {
    _id,
    title,
    description,
    category,
    techStack,
    status,
    updatedAt,
    createdAt,
  } = project;

  const color        = categoryColors[category] || 'slate';
  const statusMeta   = getStatusMeta(status);
  const completedSteps = getProgressFromStatus(status);
  const relativeTime = formatRelativeTime(updatedAt || createdAt);

  return (
    <article
      className="dash-card group flex flex-col gap-0 transition-all duration-200 hover:border-bp-blue/30"
      style={{ '--hover-shadow': '0 0 0 1px rgba(59,130,246,0.2), 0 8px 32px rgba(0,0,0,0.4)' }}
      aria-label={`Project: ${title}`}
    >
      {/* ── Card Header ───────────────────────────────────────── */}
      <div className="p-5 pb-4">
        {/* Top row: title + category badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            to={`/projects/${_id}`}
            id={`project-card-link-${_id}`}
            className="min-w-0 flex-1"
          >
            <h2
              className="text-sm font-semibold leading-snug line-clamp-1 transition-colors duration-150 group-hover:text-white"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {title}
            </h2>
          </Link>
          {category && (
            <Badge color={color} className="shrink-0 text-[0.6rem]">
              {category}
            </Badge>
          )}
        </div>

        {/* Description */}
        {description && (
          <p
            className="text-xs leading-relaxed line-clamp-2 mb-3"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {description}
          </p>
        )}

        {/* Tech stack chips */}
        {techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {techStack.slice(0, 4).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-md px-2 py-0.5 text-[0.6rem] font-medium bp-mono"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {t}
              </span>
            ))}
            {techStack.length > 4 && (
              <span
                className="inline-flex items-center text-[0.6rem] bp-mono"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                +{techStack.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Blueprint Progress ───────────────────────────────── */}
      <div
        className="mx-5 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <BlueprintProgress completedSteps={completedSteps} />
      </div>

      {/* ── Card Footer ──────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-2 px-5 py-3 mt-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Left: status + updated time */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <Badge color={statusMeta.color} className="self-start text-[0.55rem] px-1.5 py-0.5">
            {statusMeta.label}
          </Badge>
          <span
            className="text-[0.6rem] bp-mono mt-0.5"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Updated {relativeTime}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Delete — always visible, accessible */}
          <button
            id={`delete-project-${_id}`}
            onClick={() => onDelete(_id)}
            className="text-[0.65rem] px-2 py-1 rounded transition-colors duration-150"
            style={{
              color: 'rgba(239,68,68,0.4)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(239,68,68,0.8)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(239,68,68,0.4)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
            }}
            aria-label={`Delete project: ${title}`}
          >
            Delete
          </button>

          {/* Open workspace — primary card action */}
          <Link
            to={`/projects/${_id}`}
            id={`open-project-${_id}`}
            className="dash-btn inline-flex items-center gap-1.5 text-[0.7rem] px-3 py-1.5 rounded-lg"
            aria-label={`Open workspace for ${title}`}
          >
            Open
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
