import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../features/auth/auth.context';
import { PageSpinner } from '../components/common/Spinner';

// Reads isAuthenticated from AuthContext (State layer) — never calls API itself.
// While auth is initialising (loading=true), shows a spinner.
// If not authenticated, redirects to /login.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
