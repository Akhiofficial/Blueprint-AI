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
      className="dash-card group flex flex-col gap-0 transition-all duration-200"
      aria-label={`Project: ${title}`}
    >
      {/* ── Card Header ───────────────────────────────────────── */}
      <div className="p-5 pb-3.5">
        {/* Top row: title + category badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            to={`/projects/${_id}`}
            id={`project-card-link-${_id}`}
            className="min-w-0 flex-1"
          >
            <h2 className="text-sm font-semibold leading-snug line-clamp-1 text-white/95 group-hover:text-blue-400 transition-colors">
              {title}
            </h2>
          </Link>
          {category && (
            <Badge color={color} className="shrink-0 text-[0.625rem] px-2 py-0.5">
              {category}
            </Badge>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs leading-relaxed text-slate-400 line-clamp-2 mb-3 font-normal">
            {description}
          </p>
        )}

        {/* Tech stack chips */}
        {techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {techStack.slice(0, 4).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-md px-2 py-0.5 text-[0.6rem] font-medium font-mono bg-white/[0.03] border border-white/[0.06] text-slate-400"
              >
                {t}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="inline-flex items-center text-[0.6rem] font-mono text-slate-500">
                +{techStack.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Blueprint Progress ───────────────────────────────── */}
      <div className="mx-5 py-3.5 border-t border-white/[0.06]">
        <BlueprintProgress completedSteps={completedSteps} />
      </div>

      {/* ── Card Footer ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-5 py-3 mt-auto border-t border-white/[0.06] bg-white/[0.01]">
        {/* Left: status + updated time */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <Badge color={statusMeta.color} className="self-start text-[0.6rem] font-medium px-2 py-0.5">
            {statusMeta.label}
          </Badge>
          <span className="text-[0.6rem] font-mono text-slate-500 mt-1">
            Updated {relativeTime}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Delete — always visible, accessible */}
          <button
            id={`delete-project-${_id}`}
            onClick={() => onDelete(_id)}
            className="text-[0.65rem] font-medium px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-150 inline-flex items-center gap-1"
            aria-label={`Delete project: ${title}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>

          {/* Open workspace — primary card action */}
          <Link
            to={`/projects/${_id}`}
            id={`open-project-${_id}`}
            className="dash-btn inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all duration-150"
            aria-label={`Open workspace for ${title}`}
          >
            Open
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
