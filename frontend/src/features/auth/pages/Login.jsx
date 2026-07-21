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
      subtitle="Sign in to your BlueprintAI account"
    >
      <LoginForm onSubmit={handleLogin} isLoading={loading} error={error} />

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
          Create one free
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
