import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const deviceId = localStorage.getItem('deviceId');
    if (deviceId) {
      config.headers = config.headers ?? {};
      (config.headers as any)['x-device-id'] = deviceId;
    }
  }
  return config;
});

export default api;

