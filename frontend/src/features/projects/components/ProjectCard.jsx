import { Link } from 'react-router-dom';
import Badge from '../../../components/Badge';

const categoryColors = {
  'Web App':   'indigo',
  'Mobile':    'green',
  'API':       'yellow',
  'DevOps':    'slate',
  'AI / ML':   'red',
};

const ProjectCard = ({ project, onDelete }) => {
  const { _id, title, description, category, techStack, createdAt } = project;
  const color = categoryColors[category] || 'slate';
  const date  = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <article className="glass p-6 flex flex-col gap-4 hover:border-brand-500/40 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/projects/${_id}`}
            id={`project-card-${_id}`}
            className="text-lg font-semibold text-slate-100 hover:text-brand-300 transition-colors line-clamp-1"
          >
            {title}
          </Link>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{description}</p>
        </div>
        {category && <Badge color={color} className="shrink-0">{category}</Badge>}
      </div>

      {/* Tech stack chips */}
      {techStack?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {techStack.slice(0, 5).map((t) => (
            <span
              key={t}
              className="rounded-lg bg-surface px-2 py-0.5 text-xs text-slate-400 border border-surface-border"
            >
              {t}
            </span>
          ))}
          {techStack.length > 5 && (
            <span className="text-xs text-slate-500">+{techStack.length - 5} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-border mt-auto">
        <span className="text-xs text-slate-600">{date}</span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/projects/${_id}`}
            id={`edit-project-${_id}`}
            className="text-xs text-slate-400 hover:text-brand-300 transition-colors"
          >
            Edit ✎
          </Link>
          <button
            id={`delete-project-${_id}`}
            onClick={() => onDelete(_id)}
            className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
          >
            Delete ✕
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
