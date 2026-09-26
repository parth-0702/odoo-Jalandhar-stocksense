import axios from 'axios';
import { changeActivity } from './activity';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('stocksense-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!config.background) { config.trackedActivity = true; changeActivity(1); }
  return config;
});
const complete = config => { if (config?.trackedActivity) { config.trackedActivity = false; changeActivity(-1); } };
api.interceptors.response.use(response => {
  complete(response.config);
  if (['post', 'put', 'patch', 'delete'].includes(response.config.method) && !response.config.url.startsWith('/auth/')) window.dispatchEvent(new Event('stocksense:changed'));
  return response;
}, error => {
  complete(error.config);
  if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) window.dispatchEvent(new Event('stocksense:session-expired'));
  return Promise.reject(error);
});
export const errorMessage = error => error.response?.data?.message || error.message || 'Something went wrong.';
