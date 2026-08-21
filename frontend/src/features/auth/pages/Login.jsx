import { Link } from 'react-router-dom';
import AuthLayout from '../../../layouts/AuthLayout';
import LoginForm from '../components/LoginForm';
import useAuth from '../hooks/useAuth';
import { useAuthContext } from '../auth.context';

// UI layer — renders the page shell, passes hook interface to form
const Login = () => {
  const { handleLogin } = useAuth();
  const { loading, error } = useAuthContext();

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
