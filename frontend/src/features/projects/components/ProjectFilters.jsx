import { useState } from 'react';

// Status values that match the backend Project model enum exactly.
// active | archived | completed
const STATUS_OPTIONS = [
  { value: 'all',       label: 'All' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived',  label: 'Archived' },
];

const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'created', label: 'Recently created' },
  { value: 'name',    label: 'Name A → Z' },
];

/**
 * ProjectFilters
 *
 * Provides search, status filter pills, and sort control for the Projects page.
 * All filtering/sorting is client-side — no extra API calls.
 *
 * Props:
 *   search    {string}
 *   onSearch  {(value: string) => void}
 *   status    {string}   — one of STATUS_OPTIONS values
 *   onStatus  {(value: string) => void}
 *   sort      {string}   — one of SORT_OPTIONS values
 *   onSort    {(value: string) => void}
 *   total     {number}   — total unfiltered project count
 *   filtered  {number}   — currently visible count
 */
const ProjectFilters = ({
  search, onSearch,
  status, onStatus,
  sort, onSort,
  total, filtered,
}) => {
  const [sortOpen, setSortOpen] = useState(false);
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

  return (
    <div className="mb-6 space-y-3 animate-fade-in">
      {/* ── Row 1: search + sort ── */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor="projects-search" className="sr-only">Search projects</label>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            id="projects-search"
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-lg py-2 pl-8 pr-3 text-xs transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.75)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.45)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-controls="projects-grid"
            aria-label="Search your projects"
          />
          {/* Clear search */}
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
              aria-label="Clear search"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            id="sort-dropdown-trigger"
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all duration-150 whitespace-nowrap"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.55)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={(e) => { if (!sortOpen) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {activeSortLabel}
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              aria-hidden
              className="transition-transform"
              style={{ transform: sortOpen ? 'rotate(180deg)' : 'none' }}
            >
              <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {sortOpen && (
            <>
              {/* Backdrop to close */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSortOpen(false)}
                aria-hidden
              />
              <div
                className="absolute right-0 top-full mt-1.5 z-20 w-44 rounded-xl py-1.5 animate-slide-up"
                style={{
                  background: '#11161D',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
                role="listbox"
                aria-label="Sort options"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={sort === opt.value}
                    onClick={() => { onSort(opt.value); setSortOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs transition-colors duration-100"
                    style={{
                      color: sort === opt.value ? '#fff' : 'rgba(255,255,255,0.45)',
                      background: sort === opt.value ? 'rgba(59,130,246,0.12)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (sort !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (sort !== opt.value) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {sort === opt.value && (
                      <span style={{ color: '#22D3EE', marginRight: '0.4rem' }}>✓</span>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: status filter pills ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.value;
          return (
            <button
              key={opt.value}
              id={`filter-${opt.value}`}
              onClick={() => onStatus(opt.value)}
              className="rounded-full px-3 py-1 text-xs transition-all duration-150"
              style={{
                background: isActive ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: isActive ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.38)';
                }
              }}
              aria-pressed={isActive}
            >
              {opt.label}
            </button>
          );
        })}

        {/* Result count */}
        {(search || status !== 'all') && (
          <span
            className="ml-auto text-xs bp-mono"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            {filtered} of {total}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProjectFilters;
