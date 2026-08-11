import api from '../../../services/api';

// API Layer — the ONLY file in the projects feature that imports the API client

export const createProject = async (data) => {
  const res = await api.post('/api/projects', data);
  return res.data.data;
};

export const fetchProjects = async () => {
  const res = await api.get('/api/projects');
  return res.data.data;
};

export const fetchProjectById = async (id) => {
  const res = await api.get(`/api/projects/${id}`);
  return res.data.data;
};

export const updateProject = async (id, data) => {
  const res = await api.put(`/api/projects/${id}`, data);
  return res.data.data;
};

export const deleteProject = async (id) => {
  await api.delete(`/api/projects/${id}`);
};
