import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { subscribeGlobalLoading } from "../utils/globalLoadingBus";

const INITIAL_STATE = {
  pendingRequests: 0,
  isLoading: false,
};

const LoadingContext = createContext(INITIAL_STATE);

export const LoadingProvider = ({ children }) => {
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeGlobalLoading((count) => {
      setPendingRequests(count);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      pendingRequests,
      isLoading: pendingRequests > 0,
    }),
    [pendingRequests]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => useContext(LoadingContext);

export default LoadingContext;
