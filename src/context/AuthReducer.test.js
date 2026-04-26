import { describe, it, expect } from "vitest";
import AuthReducer from "./AuthReducer";

describe("AuthReducer", () => {
  const initialState = {
    user: null,
    isFetching: false,
    error: false,
  };

  it("handles LOGIN_START", () => {
    const state = AuthReducer(initialState, { type: "LOGIN_START" });

    expect(state).toEqual({
      user: null,
      isFetching: true,
      error: false,
    });
  });

  it("handles LOGIN_SUCCESS", () => {
    const user = { _id: "u1", roleName: "student" };
    const state = AuthReducer(initialState, {
      type: "LOGIN_SUCCESS",
      payload: user,
    });

    expect(state).toEqual({
      user,
      isFetching: false,
      error: false,
    });
  });

  it("handles LOGOUT", () => {
    const loggedInState = {
      user: { _id: "u1" },
      isFetching: false,
      error: false,
    };

    const state = AuthReducer(loggedInState, { type: "LOGOUT" });

    expect(state).toEqual({
      user: null,
      isFetching: false,
      error: false,
    });
  });
});