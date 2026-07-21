import { createContext, useContext, useState } from 'react';

// ── State layer: passive storage only ──
// No API calls, no async logic, no try/catch — just data + setters.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);  // true until initAuth runs
  const [error, setError]     = useState(null);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    setLoading,
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
};
