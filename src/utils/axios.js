import axios from "axios";
import {
  startGlobalLoading,
  stopGlobalLoading,
} from "./globalLoadingBus";

import logger from "./logger.js";

const GLOBAL_LOADER_FLAG = "__globalLoaderTracked";
const shouldTrackGlobalLoader = (config) => !config?.skipGlobalLoader;

const stopLoadingIfTracked = (config) => {
  if (config?.[GLOBAL_LOADER_FLAG]) {
    stopGlobalLoading();
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    if (shouldTrackGlobalLoader(config)) {
      config[GLOBAL_LOADER_FLAG] = true;
      startGlobalLoading();
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    stopLoadingIfTracked(error?.config);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    stopLoadingIfTracked(response?.config);
    return response;
  },
  (error) => {
    stopLoadingIfTracked(error?.config);

    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      const isAuthPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/forgot-password") ||
        window.location.pathname.startsWith("/reset-password");

      if (!isAuthPage) {
        sessionStorage.setItem("postLoginRedirectPath", currentPath);
        window.location.assign(
          `/login?redirect=${encodeURIComponent(currentPath)}`
        );
      }
    }

    if (import.meta.env.DEV) {
      logger.error("Axios Error Details:", {
        status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }

    const message =
      error.response?.data?.message || "An error occurred. Please try again.";

    // Preserve status so callers can check e.g. error.status === 404
    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    enhancedError.message = message;
    return Promise.reject(enhancedError);
  }
);

export default api;
