import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const deviceId = localStorage.getItem("deviceId");

    if (deviceId) {
      config.headers = config.headers ?? {};

      (config.headers as any)["x-device-id"] = deviceId;
    }

    // Add JWT token if available

    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers ?? {};

      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
