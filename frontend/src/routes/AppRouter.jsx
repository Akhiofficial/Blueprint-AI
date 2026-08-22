import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProtectedRoute from './ProtectedRoute';
import useAuth from '../features/auth/hooks/useAuth';

// Landing page
import LandingPage from '../features/landing/LandingPage';

// Auth pages
import Login    from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';

// Project pages
import Dashboard     from '../features/projects/pages/Dashboard';
import ProjectsPage  from '../features/projects/pages/ProjectsPage';
import CreateProject from '../features/projects/pages/CreateProject';
import ProjectDetail from '../features/projects/pages/ProjectDetail';

// Requirement pages
import RequirementsPage from '../features/requirements/pages/RequirementsPage';

// AI pages
import AnalysisPage from '../features/ai/pages/AnalysisPage';

// Workspace page
import WorkspacePage from '../features/workspace/pages/WorkspacePage';

const AppRouter = () => {
  const { initAuth } = useAuth();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      {/* ── Public Marketing ── */}
      <Route path="/" element={<LandingPage />} />

      {/* ── Auth ── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Protected App ── */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/projects"
        element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>}
      />
      <Route
        path="/projects/new"
        element={<ProtectedRoute><CreateProject /></ProtectedRoute>}
      />
      <Route
        path="/projects/:id"
        element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>}
      />
      <Route
        path="/projects/:id/requirements"
        element={<ProtectedRoute><RequirementsPage /></ProtectedRoute>}
      />
      <Route
        path="/projects/:id/analysis"
        element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>}
      />
      <Route
        path="/projects/:id/workspace"
        element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>}
      />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
