import {
  startGlobalLoading,
  stopGlobalLoading,
} from "./globalLoadingBus";

export const trackedFetch = async (input, init = {}, options = {}) => {
  const { skipGlobalLoader = false } = options;

  if (skipGlobalLoader) {
    return fetch(input, init);
  }

  startGlobalLoading();

  try {
    return await fetch(input, init);
  } finally {
    stopGlobalLoading();
  }
};

export default trackedFetch;
