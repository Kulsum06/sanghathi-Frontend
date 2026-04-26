import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";
import { clearAllCache } from "../hooks/useApiCache";
import api from "../utils/axios";
import logger from "../utils/logger.js";

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isFetching: false,
  error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
    if (!state.user) {
      // User logged out — clear all cached API responses
      clearAllCache();
    }
  }, [state.user]);

  useEffect(() => {
    let isMounted = true;

    const syncCurrentUser = async () => {
      const token = localStorage.getItem("token");
      const userId = state.user?._id;

      if (!token || !userId) {
        return;
      }

      try {
        const response = await api.get(`/users/${userId}`, {
          params: {
            includeProfiles: true,
            fields:
              "_id,name,email,phone,avatar,photo,role,roleName,department,sem,usn,cabin",
          },
        });

        const fetchedUser = response.data?.data?.user;
        if (!isMounted || !fetchedUser) {
          return;
        }

        const shouldUpdate =
          fetchedUser.avatar !== state.user?.avatar ||
          fetchedUser.photo !== state.user?.photo ||
          fetchedUser.department !== state.user?.department ||
          fetchedUser.sem !== state.user?.sem ||
          fetchedUser.usn !== state.user?.usn ||
          fetchedUser.cabin !== state.user?.cabin;

        if (shouldUpdate) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              ...state.user,
              ...fetchedUser,
            },
          });
        }
      } catch (error) {
        logger.warn("Unable to sync current user profile fields", error);
      }
    };

    syncCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [state.user?._id]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
