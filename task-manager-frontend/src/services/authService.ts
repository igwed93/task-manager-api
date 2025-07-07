import api from './api';

interface AuthCredentials {
    email: string;
    password: string;
}

export const login = async (credentials: AuthCredentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
};

export const register = async (data: { name: string; email: string; password: string }) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const logout = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};