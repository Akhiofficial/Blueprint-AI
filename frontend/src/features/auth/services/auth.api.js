import axiosInstance from '../../../lib/axiosInstance';

// API Layer — the ONLY file in the auth feature that imports axios
// Returns normalized data; never touches React state or hooks

export const registerUser = async (data) => {
  const res = await axiosInstance.post('/api/auth/register', data);
  return res.data.data; // { _id, name, email, role }
};

export const loginUser = async (data) => {
  const res = await axiosInstance.post('/api/auth/login', data);
  return res.data.data;
};

export const logoutUser = async () => {
  await axiosInstance.post('/api/auth/logout');
};

export const fetchCurrentUser = async () => {
  const res = await axiosInstance.get('/api/auth/me');
  return res.data.data;
};
