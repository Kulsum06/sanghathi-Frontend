import axios from "axios";
import {
  startGlobalLoading,
  stopGlobalLoading,
} from "./globalLoadingBus";

const TRACKING_FLAG = "__globalLoaderTracked";

let isRegistered = false;

const shouldTrackGlobalLoader = (config) => !config?.skipGlobalLoader;

const clearLoadingIfTracked = (config) => {
  if (config?.[TRACKING_FLAG]) {
    stopGlobalLoading();
  }
};

export const registerGlobalAxiosLoader = () => {
  if (isRegistered) {
    return;
  }

  isRegistered = true;

  axios.interceptors.request.use(
    (config) => {
      if (shouldTrackGlobalLoader(config)) {
        config[TRACKING_FLAG] = true;
        startGlobalLoading();
      }

      return config;
    },
    (error) => {
      clearLoadingIfTracked(error?.config);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      clearLoadingIfTracked(response?.config);
      return response;
    },
    (error) => {
      clearLoadingIfTracked(error?.config);
      return Promise.reject(error);
    }
  );
};
