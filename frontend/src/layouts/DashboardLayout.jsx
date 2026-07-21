import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../features/auth/auth.context';
import useAuth from '../features/auth/hooks/useAuth';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

// Dashboard shell — sidebar + top bar + main content area
const DashboardLayout = ({ children }) => {
  const { user } = useAuthContext();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard',      icon: '⚡', to: '/dashboard' },
    { label: 'New Project',    icon: '✦',  to: '/projects/new' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex-col bg-surface-card border-r border-surface-border
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-surface-border">
          <span className="text-2xl">🧠</span>
          <span className="text-lg font-bold gradient-text">BlueprintAI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                         text-slate-400 transition-all hover:bg-surface-hover hover:text-slate-100"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-surface-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button
            id="logout-btn"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400"
            onClick={handleLogout}
          >
            ↪ Sign out
          </Button>
        </div>
      </aside>

      {/* ── Overlay for mobile ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-surface-border bg-surface-card px-4 py-4 lg:px-8">
          {/* Hamburger */}
          <button
            id="sidebar-toggle"
            className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-surface-hover hover:text-slate-100 transition"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="hidden lg:block" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Button
              id="new-project-btn"
              size="sm"
              onClick={() => navigate('/projects/new')}
            >
              + New Project
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
