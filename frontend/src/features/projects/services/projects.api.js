import axiosInstance from '../../../lib/axiosInstance';

// API Layer — the ONLY file in the projects feature that imports axios

export const createProject = async (data) => {
  const res = await axiosInstance.post('/api/projects', data);
  return res.data.data;
};

export const fetchProjects = async () => {
  const res = await axiosInstance.get('/api/projects');
  return res.data.data;
};

export const fetchProjectById = async (id) => {
  const res = await axiosInstance.get(`/api/projects/${id}`);
  return res.data.data;
};

export const updateProject = async (id, data) => {
  const res = await axiosInstance.put(`/api/projects/${id}`, data);
  return res.data.data;
};

export const deleteProject = async (id) => {
  await axiosInstance.delete(`/api/projects/${id}`);
};
