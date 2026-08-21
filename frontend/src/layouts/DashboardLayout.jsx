import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../features/auth/auth.context';
import useAuth from '../features/auth/hooks/useAuth';

// ── BlueprintAI grid icon — matches AuthLayout exactly ─────────────────────
const BpIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.8" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.6" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5" />
  </svg>
);

// Dashboard shell — sidebar + top bar + main content area
const DashboardLayout = ({ children }) => {
  const { user } = useAuthContext();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
          <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ),
    },
    {
      label: 'New Project',
      to: '/projects/new',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
          <path d="M7.5 1.5v12M1.5 7.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#080B0F' }}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-60 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}
        style={{
          background: '#0D1117',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.22)',
            }}
          >
            <BpIcon size={16} />
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            BlueprintAI
          </span>
        </div>

        {/* ── Navigation ── */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150"
                style={{
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.38)',
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: isActive
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.38)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ color: isActive ? '#3B82F6' : 'currentColor', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── User info + logout ── */}
        <div
          className="p-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            {/* Avatar */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #22D3EE)' }}
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-xs font-medium"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {user?.name}
              </p>
              <p
                className="truncate"
                style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}
              >
                {user?.email}
              </p>
            </div>
          </div>

          <button
            id="logout-btn"
            onClick={handleLogout}
            className="w-full text-left rounded-lg px-3 py-1.5 text-xs transition-all duration-150"
            style={{
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(239,68,68,0.7)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
              e.currentTarget.style.background = 'rgba(239,68,68,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 py-3 lg:px-7"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(13,17,23,0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Mobile: hamburger */}
          <button
            id="sidebar-toggle"
            className="lg:hidden rounded-lg p-2 transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>

          {/* Desktop: spacer so right side aligns */}
          <div className="hidden lg:block" />

          {/* Right side — breadcrumb / route label */}
          <div className="flex items-center gap-3">
            <span
              className="hidden sm:block bp-mono"
              style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}
            >
              {location.pathname === '/dashboard' ? 'DASHBOARD' : location.pathname.replace('/projects/', 'PROJECT / ').toUpperCase()}
            </span>
            {/* Quick new project button — visible on mobile top bar */}
            <button
              id="topbar-new-project"
              className="lg:hidden text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{
                background: '#3B82F6',
                color: '#fff',
                border: 'none',
              }}
              onClick={() => navigate('/projects/new')}
              aria-label="Create new project"
            >
              + New
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          className="flex-1 overflow-y-auto p-5 lg:p-8"
          style={{
            // Radial blue-teal glow at bottom — matches landing page hero atmosphere
            backgroundImage: [
              'radial-gradient(ellipse 80% 55% at 50% 100%, rgba(34,211,238,0.05) 0%, rgba(59,130,246,0.09) 40%, transparent 70%)',
              'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '100% 100%, 48px 48px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
