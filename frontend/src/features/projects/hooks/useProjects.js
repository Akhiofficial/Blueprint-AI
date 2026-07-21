import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsContext } from '../projects.context';
import * as projectsApi from '../services/projects.api';

// ── Hooks layer: orchestration only ──
// Never renders JSX. Never holds data beyond transient values.

const useProjects = () => {
  const { setProjects, setCurrentProject, setLoading, setError } = useProjectsContext();
  const navigate = useNavigate();

  const handleFetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.fetchProjects();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [setProjects, setLoading, setError]);

  const handleFetchProjectById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setCurrentProject(null);
    try {
      const data = await projectsApi.fetchProjectById(id);
      setCurrentProject(data);
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 404
          ? 'Project not found or you do not have access to it.'
          : err.response?.data?.message || 'Failed to load project.'
      );
    } finally {
      setLoading(false);
    }
  }, [setCurrentProject, setLoading, setError]);

  const handleCreateProject = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await projectsApi.createProject(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await projectsApi.updateProject(id, formData);
      setCurrentProject(updated);
      // Also refresh list so Dashboard stays consistent
      setProjects((prev) =>
        prev.map((p) => (p._id === id ? updated : p))
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await projectsApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleFetchProjects,
    handleFetchProjectById,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
  };
};

export default useProjects;
