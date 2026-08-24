import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';

const NotFound = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 relative">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="glass p-12 md:p-16 rounded-3xl border border-brand-500/20 shadow-2xl shadow-brand-500/10 max-w-lg w-full relative z-10 backdrop-blur-xl">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mb-8 shadow-inner shadow-brand-500/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h1 className="text-7xl font-extrabold mb-4 bg-gradient-to-br from-brand-500 via-brand-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">404</h1>
          <h2 className="text-2xl font-bold mb-4 text-white tracking-tight">Page not found</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>

          <Link
            to="/dashboard"
            className="dash-btn inline-flex items-center gap-2 px-6 py-3 font-semibold shadow-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
