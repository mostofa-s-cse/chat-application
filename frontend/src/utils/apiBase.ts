import api from './api';

export const get = async <T>(url: string, config?: any) => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const post = async <T>(url: string, data?: any, config?: any) => {
  const response = await api.post<T>(url, data, config);
  return response.data;
}; 