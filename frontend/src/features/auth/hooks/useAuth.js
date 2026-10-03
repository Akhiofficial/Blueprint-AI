import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth.context';
import * as authApi from '../services/auth.api';

// ── Hooks layer: orchestration only ──
// Calls API layer → writes to State layer → manages loading/error transitions.
// Never renders JSX. Never holds data beyond transient state.

const useAuth = () => {
  const { setUser, setLoading, setError } = useAuthContext();
  const navigate = useNavigate();

  // ── Session persistence: verify cookie on first app load
  const initAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await authApi.fetchCurrentUser();
      setUser(user);
    } catch {
      setUser(null); // no valid session — keep user as null
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  // ── Listen for 401 events from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [setUser, navigate]);

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authApi.registerUser(formData);
      setUser(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.message || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authApi.loginUser(formData);
      setUser(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.message || err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logoutUser();
    } finally {
      setUser(null);
      setLoading(false);
      navigate('/login', { replace: true });
    }
  };

  return { initAuth, handleLogin, handleRegister, handleLogout };
};

export default useAuth;
