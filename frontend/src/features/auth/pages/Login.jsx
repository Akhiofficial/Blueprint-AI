import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../../layouts/AuthLayout';
import LoginForm from '../components/LoginForm';
import useAuth from '../hooks/useAuth';
import { useAuthContext } from '../auth.context';

// UI layer — renders the page shell, passes hook interface to form
const Login = () => {
  const { handleLogin } = useAuth();
  const { loading, error, setError } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Show error when Google OAuth redirects back with ?error= ──
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'google_auth_failed') {
      setError('Google sign-in failed. Please try again or use email/password.');
      // Clean the query param from the URL so refreshing doesn't re-trigger
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, setError]);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue building your software blueprint."
    >
      <LoginForm onSubmit={handleLogin} isLoading={loading} error={error} />

      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-bp-cyan hover:text-bp-cyan/80 transition-colors">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
