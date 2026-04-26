import api from "./axios";

import logger from "./logger.js";

const sanitizeErrors = (errors = []) =>
  Array.isArray(errors) ? errors.filter(Boolean).map(String).slice(0, 200) : [];

const sanitizeIds = (ids = []) => {
  if (!Array.isArray(ids)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  for (const id of ids) {
    if (!id) continue;
    const value = String(id).trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    normalized.push(value);
  }

  return normalized;
};

export const recordAdminUploadSession = async ({
  tabType,
  fileName = "",
  totalRows = 0,
  successCount = 0,
  errorCount = 0,
  errors = [],
  affectedUserIds = [],
  createdUserIds = [],
  metadata = {},
} = {}) => {
  if (!tabType) {
    return;
  }

  try {
    await api.post("/admin/upload-history", {
      source: "dashboard-ui",
      tabType,
      fileName,
      totalRows,
      successCount,
      errorCount,
      errors: sanitizeErrors(errors),
      affectedUserIds: sanitizeIds(affectedUserIds),
      createdUserIds: sanitizeIds(createdUserIds),
      metadata: metadata && typeof metadata === "object" ? metadata : {},
    });
  } catch (error) {
    logger.error("Failed to record upload session", error?.response?.data || error?.message || error);
  }
};

export const listAdminUploadSessions = async (params = {}) => {
  const response = await api.get("/admin/upload-history", { params });
  return {
    sessions: response.data?.data?.sessions || [],
    pagination: response.data?.pagination || null,
  };
};

export const previewAdminUploadRestore = async (sessionId) => {
  const response = await api.post(`/admin/upload-history/${sessionId}/restore-preview`);
  return response.data?.data?.preview;
};

export const restoreAdminUploadSession = async (sessionId) => {
  const response = await api.post(`/admin/upload-history/${sessionId}/restore`);
  return response.data?.data;
};
