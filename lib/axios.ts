import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api",  // ✅ Changed: Use relative path (works in dev & production)
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Auto add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      
      // Show toast notification
      toast.error("Session expired. Please login again.", { 
        icon: "🔒",
        duration: 3000 
      });
      
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;