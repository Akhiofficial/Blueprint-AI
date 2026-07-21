import { createContext, useContext, useState } from 'react';

// ── State layer: passive storage only ──
// No API calls, no async logic, no try/catch.

const ProjectsContext = createContext(null);

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects]               = useState([]);
  const [currentProject, setCurrentProject]   = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);

  const value = {
    projects,
    setProjects,
    currentProject,
    setCurrentProject,
    loading,
    setLoading,
    error,
    setError,
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectsContext = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjectsContext must be used inside <ProjectsProvider>');
  return ctx;
};
