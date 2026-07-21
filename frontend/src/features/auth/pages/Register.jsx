import { Link } from 'react-router-dom';
import AuthLayout from '../../../layouts/AuthLayout';
import RegisterForm from '../components/RegisterForm';
import useAuth from '../hooks/useAuth';
import { useAuthContext } from '../auth.context';

// UI layer — renders the page shell, passes hook interface to form
const Register = () => {
  const { handleRegister } = useAuth();
  const { loading, error } = useAuthContext();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start planning your software projects with AI"
    >
      <RegisterForm onSubmit={handleRegister} isLoading={loading} error={error} />

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
