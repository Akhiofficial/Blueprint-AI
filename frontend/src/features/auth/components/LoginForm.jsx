import { useState } from 'react';
import ErrorMessage from '../../../components/common/ErrorMessage';

// The API base URL is used to build the full Google OAuth initiation URL.
// We use window.location.href (not Axios) because OAuth requires a real browser navigation.
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [focusField, setFocusField] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
      <ErrorMessage message={error} />

      {/* ── Email Field ── */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="name@company.com"
          value={form.email}
          onChange={handleChange}
          onFocus={() => setFocusField('email')}
          onBlur={() => setFocusField('')}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-all duration-200 outline-none"
          style={{
            background: '#0D1117',
            border: focusField === 'email' ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: focusField === 'email' ? '0 0 12px rgba(59, 130, 246, 0.25)' : 'none',
          }}
        />
      </div>

      {/* ── Password Field ── */}
      <div className="flex flex-col gap-1.5 relative">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Password
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Password recovery is not configured. Please contact your administrator.");
            }}
            className="text-xs text-bp-cyan/80 hover:text-bp-cyan transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setFocusField('password')}
          onBlur={() => setFocusField('')}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-all duration-200 outline-none"
          style={{
            background: '#0D1117',
            border: focusField === 'password' ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: focusField === 'password' ? '0 0 12px rgba(59, 130, 246, 0.25)' : 'none',
          }}
        />
      </div>

      {/* ── Submit Action ── */}
      <button
        id="login-submit"
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 relative group cursor-pointer"
        style={{
          background: '#3B82F6',
          color: '#fff',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2563EB';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#3B82F6';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
        }}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </>
        )}
      </button>

      {/* ── OR Separator ── */}
      <div className="flex items-center gap-4 my-2" aria-hidden>
        <div className="h-px flex-1 bg-white/[0.07]" />
        <span className="bp-mono text-[9px] text-white/20 tracking-wider">OR</span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      {/* ── Social Login ── */}
      <button
        id="login-google"
        type="button"
        onClick={() => { window.location.href = `${API_BASE}/api/auth/google`; }}
        className="w-full rounded-xl py-3 text-sm text-slate-300 hover:text-white border transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.91-4.53-5.01-4.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        <span>Continue with Google</span>
      </button>
    </form>
  );
};

export default LoginForm;
