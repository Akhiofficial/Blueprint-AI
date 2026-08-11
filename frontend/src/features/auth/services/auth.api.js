import api from '../../../services/api';

// API Layer — the ONLY file in the auth feature that imports the API client
// Returns normalized data; never touches React state or hooks

export const registerUser = async (data) => {
  const res = await api.post('/api/auth/register', data);
  return res.data.data; // { _id, name, email, role }
};

export const loginUser = async (data) => {
  const res = await api.post('/api/auth/login', data);
  return res.data.data;
};

export const logoutUser = async () => {
  await api.post('/api/auth/logout');
};

export const fetchCurrentUser = async () => {
  const res = await api.get('/api/auth/me');
  return res.data.data;
};
