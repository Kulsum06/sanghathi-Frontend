import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("askRag", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "http://localhost:3000/api");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("calls the configured /ask endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: "hello" }),
    });
    global.fetch = fetchMock;

    const { askRag } = await import("./apiCalls.js");
    const result = await askRag("Where is CSE?");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/ask",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(result).toBe("hello");
  });

  it("throws a readable error when API returns non-200", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "service unavailable" }),
    });
    global.fetch = fetchMock;

    const { askRag } = await import("./apiCalls.js");

    await expect(askRag("test")).rejects.toThrow(
      "RAG request failed: service unavailable"
    );
  });
});