import axios from "axios";

const api = axios.create({
  // Same-origin in every environment: Vite proxies /api to the API in dev, and
  // Express serves both the app and /api in prod. No VITE_API_URL needed.
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
