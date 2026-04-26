let pendingRequestCount = 0;

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    listener(pendingRequestCount);
  });
};

export const subscribeGlobalLoading = (listener) => {
  if (typeof listener !== "function") {
    return () => {};
  }

  listeners.add(listener);
  listener(pendingRequestCount);

  return () => {
    listeners.delete(listener);
  };
};

export const startGlobalLoading = () => {
  pendingRequestCount += 1;
  notifyListeners();
};

export const stopGlobalLoading = () => {
  pendingRequestCount = Math.max(0, pendingRequestCount - 1);
  notifyListeners();
};

export const resetGlobalLoading = () => {
  pendingRequestCount = 0;
  notifyListeners();
};

export const getGlobalLoadingCount = () => pendingRequestCount;
