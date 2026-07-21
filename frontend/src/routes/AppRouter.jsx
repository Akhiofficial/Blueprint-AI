import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProtectedRoute from './ProtectedRoute';
import useAuth from '../features/auth/hooks/useAuth';

// Auth pages
import Login     from '../features/auth/pages/Login';
import Register  from '../features/auth/pages/Register';

// Project pages
import Dashboard     from '../features/projects/pages/Dashboard';
import CreateProject from '../features/projects/pages/CreateProject';
import ProjectDetail from '../features/projects/pages/ProjectDetail';

const AppRouter = () => {
  const { initAuth } = useAuth();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/projects/new"
        element={<ProtectedRoute><CreateProject /></ProtectedRoute>}
      />
      <Route
        path="/projects/:id"
        element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>}
      />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
