/**
 * useApiCache — Centralized in-memory GET cache for Sanghathi frontend.
 *
 * Usage:
 *   const { data, loading, error, invalidate } = useApiCache(userId ? `/endpoint/${userId}` : null);
 *
 * - Results live in a module-level Map — survives re-renders, cleared on refresh/logout.
 * - 404 responses are treated as "no data found" (data = null, no error) — valid for new users.
 * - Call invalidate() after a successful save/mutation to refetch fresh data next visit.
 * - Pass null / falsy URL to skip fetching (use until dependencies like userId are ready).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/axios";

// ─── Module-level cache ───────────────────────────────────────────────────────
const cache = new Map(); // url → { data, timestamp }
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Remove specific keys from the cache (e.g. after a mutation). */
export function invalidateCache(...urls) {
  urls.forEach((url) => { if (url) cache.delete(url); });
}

/** Wipe the entire cache — call this on user logout. */
export function clearAllCache() {
  cache.clear();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * @param {string|null} url   API path to GET. Pass null/falsy to skip.
 * @param {object}      opts
 * @param {number}      [opts.ttl=300000]  Cache TTL in ms.
 * @returns {{ data, loading, error, invalidate }}
 */
export default function useApiCache(url, { ttl = DEFAULT_TTL_MS } = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(!!url); // start loading only if we have a URL
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);

  const doFetch = useCallback(
    async (force = false) => {
      if (!url) {
        setData(null);
        setLoading(false);
        return;
      }

      // Serve from cache unless forced
      if (!force) {
        const hit = cache.get(url);
        if (hit && Date.now() - hit.timestamp < ttl) {
          setData(hit.data);
          setLoading(false);
          setError(null);
          return;
        }
      }

      // Cancel any previous in-flight request for this hook
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(url, { signal: controller.signal });
        const result = response.data;
        cache.set(url, { data: result, timestamp: Date.now() });
        setData(result);
      } catch (err) {
        // Ignore aborted requests
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        // 404 → valid empty state (new user, no data yet)
        if (err.status === 404) {
          cache.set(url, { data: null, timestamp: Date.now() });
          setData(null);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, ttl]
  );

  useEffect(() => {
    doFetch();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [doFetch]);

  const invalidate = useCallback(() => {
    cache.delete(url);
    doFetch(true);
  }, [url, doFetch]);

  return { data, loading, error, invalidate };
}
