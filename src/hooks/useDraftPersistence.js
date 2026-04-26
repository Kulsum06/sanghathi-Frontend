import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../utils/axios";
import logger from "../utils/logger.js";

const DEFAULT_SCOPE_ID = "default";
const DEFAULT_DEBOUNCE_MS = 2500;
const LOCAL_PREFIX = "sanghathi:draft";
const SENSITIVE_FIELD_PATTERN = /(password|passcode|secret|token|otp|pin)/i;

const buildLocalKey = ({ formType, scopeId }) =>
  `${LOCAL_PREFIX}:${formType}:${scopeId || DEFAULT_SCOPE_ID}`;

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const isBrowserFile = (value) =>
  typeof File !== "undefined" && value instanceof File;

const isBrowserBlob = (value) =>
  typeof Blob !== "undefined" && value instanceof Blob;

const sanitizeDraftData = (value) => {
  if (value === null || value === undefined) return value;

  if (isBrowserFile(value) || isBrowserBlob(value)) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeDraftData);
  }

  if (typeof value === "object") {
    const sanitized = {};

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (SENSITIVE_FIELD_PATTERN.test(key)) {
        return;
      }
      sanitized[key] = sanitizeDraftData(nestedValue);
    });

    return sanitized;
  }

  return value;
};

const simpleChecksum = (raw) => {
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
};

export default function useDraftPersistence({
  formType,
  scopeId = DEFAULT_SCOPE_ID,
  values,
  reset,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  enableServerSync = true,
  enablePersistence = true,
}) {
  const [syncState, setSyncState] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const timerRef = useRef(null);
  const latestPayloadRef = useRef(null);

  const localKey = useMemo(
    () => buildLocalKey({ formType, scopeId }),
    [formType, scopeId]
  );

  const saveLocal = useCallback(
    (payload) => {
      localStorage.setItem(localKey, JSON.stringify(payload));
      setHasLocalDraft(true);
      setLastSavedAt(payload.updatedAt);
    },
    [localKey]
  );

  const syncToServer = useCallback(
    async (payload) => {
      if (!enableServerSync) return;

      try {
        setSyncState("syncing");
        await api.put(`/forms/drafts/${formType}`, {
          scopeId,
          draftData: payload.draftData,
          version: payload.version,
          checksum: payload.checksum,
          isDirty: true,
        });
        setSyncState("synced");
      } catch (error) {
        setSyncState("error");
        logger.error("Draft server sync failed", error);
      }
    },
    [enableServerSync, formType, scopeId]
  );

  const clearDraft = useCallback(() => {
    localStorage.removeItem(localKey);
    setHasLocalDraft(false);
    setLastSavedAt(null);
    setSyncState("idle");
  }, [localKey]);

  const forceSync = useCallback(async () => {
    if (!latestPayloadRef.current) return;
    await syncToServer(latestPayloadRef.current);
  }, [syncToServer]);

  useEffect(() => {
    const localRaw = localStorage.getItem(localKey);
    const parsedLocalDraft = safeParse(localRaw);
    const localDraft = parsedLocalDraft?.draftData
      ? {
          ...parsedLocalDraft,
          draftData: sanitizeDraftData(parsedLocalDraft.draftData),
        }
      : parsedLocalDraft;

    if (localDraft?.draftData && typeof reset === "function") {
      reset(localDraft.draftData);
      setHasLocalDraft(true);
      setLastSavedAt(localDraft.updatedAt || null);
      latestPayloadRef.current = localDraft;
    }

    const hydrateFromServer = async () => {
      if (!enableServerSync || typeof reset !== "function") {
        setIsHydrated(true);
        return;
      }

      try {
        const response = await api.get(`/forms/drafts/${formType}`, {
          params: { scopeId },
        });
        const serverDraft = response.data?.data?.draft;

        if (!serverDraft?.draftData) {
          setIsHydrated(true);
          return;
        }

        const serverTime = new Date(serverDraft.updatedAt || 0).getTime();
        const localTime = new Date(localDraft?.updatedAt || 0).getTime();

        if (!localDraft || serverTime > localTime) {
          const sanitizedServerDraftData = sanitizeDraftData(serverDraft.draftData);
          reset(sanitizedServerDraftData);
          const syncedLocal = {
            draftData: sanitizedServerDraftData,
            version: serverDraft.version || 1,
            checksum: serverDraft.checksum || "",
            updatedAt: serverDraft.updatedAt || new Date().toISOString(),
          };
          saveLocal(syncedLocal);
          latestPayloadRef.current = syncedLocal;
        } else {
          latestPayloadRef.current = localDraft;
        }
      } catch (error) {
        logger.error("Draft server hydrate failed", error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateFromServer();
  }, [enableServerSync, formType, localKey, reset, saveLocal, scopeId]);

  useEffect(() => {
    if (!enablePersistence || !isHydrated || !formType || values === undefined) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        const sanitizedValues = sanitizeDraftData(values);
        const serialized = JSON.stringify(sanitizedValues);
        const checksum = simpleChecksum(serialized);

        if (latestPayloadRef.current?.checksum === checksum) {
          setSyncState("synced");
          return;
        }

        setSyncState("saving-local");
        const nextVersion = (latestPayloadRef.current?.version || 0) + 1;
        const payload = {
          draftData: sanitizedValues,
          version: nextVersion,
          checksum,
          updatedAt: new Date().toISOString(),
        };

        latestPayloadRef.current = payload;
        saveLocal(payload);
        await syncToServer(payload);
      } catch (error) {
        setSyncState("error");
        logger.error("Draft local save failed", error);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    debounceMs,
    enablePersistence,
    formType,
    isHydrated,
    saveLocal,
    syncToServer,
    values,
  ]);

  return {
    syncState,
    lastSavedAt,
    hasLocalDraft,
    clearDraft,
    forceSync,
  };
}
