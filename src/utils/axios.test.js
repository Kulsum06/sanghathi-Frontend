import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("axios utility interceptors", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "http://localhost:3000/api");
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("adds bearer token from localStorage to request headers", async () => {
    localStorage.setItem("token", "token-123");
    const { default: api } = await import("./axios.js");

    const requestInterceptor = api.interceptors.request.handlers.find(
      (handler) => typeof handler?.fulfilled === "function"
    ).fulfilled;

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBe("Bearer token-123");
  });

  it("does not attach Authorization header when token is missing", async () => {
    const { default: api } = await import("./axios.js");

    const requestInterceptor = api.interceptors.request.handlers.find(
      (handler) => typeof handler?.fulfilled === "function"
    ).fulfilled;

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it("normalizes API error message from server payload", async () => {
    const { default: api } = await import("./axios.js");

    const responseErrorInterceptor = api.interceptors.response.handlers.find(
      (handler) => typeof handler?.rejected === "function"
    ).rejected;

    const error = {
      response: {
        status: 401,
        headers: {},
        data: {
          message: "Invalid token",
        },
      },
    };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    expect(error.message).toBe("Invalid token");
  });

  it("uses fallback message when response payload has no message", async () => {
    const { default: api } = await import("./axios.js");

    const responseErrorInterceptor = api.interceptors.response.handlers.find(
      (handler) => typeof handler?.rejected === "function"
    ).rejected;

    const error = {};

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    expect(error.message).toBe("An error occurred. Please try again.");
  });
});
