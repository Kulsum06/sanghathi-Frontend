import { useCallback, useEffect, useState } from "react";
import api from "../utils/axios";
import logger from "../utils/logger.js";

const buildErrorMessage = (error) => {
  const status = error?.response?.status;

  if (status === 401) {
    return "Session expired. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to view these mentees.";
  }

  if (status === 404) {
    return "Mentor details not found.";
  }

  return error?.response?.data?.message || "Unable to load mentees right now.";
};

const normalizeMentee = (mentee) => {
  const profile = mentee?.profile || null;

  return {
    ...mentee,
    profile,
    avatar: profile?.photo || mentee?.avatar || null,
  };
};

const useMenteesData = (mentorId, options = {}) => {
  const { enabled = true } = options;

  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled && mentorId));
  const [error, setError] = useState(null);

  const fetchMentees = useCallback(async () => {
    if (!enabled || !mentorId) {
      setMentees([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/mentorship/${mentorId}/mentees-with-profiles`, {
        params: {
          page: 1,
          limit: 500,
        },
      });
      const menteesData = Array.isArray(response.data?.mentees)
        ? response.data.mentees.map(normalizeMentee)
        : [];

      setMentees(menteesData);
    } catch (fetchError) {
      logger.error("Error fetching mentees with profiles:", fetchError);
      setMentees([]);
      setError(buildErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  }, [enabled, mentorId]);

  useEffect(() => {
    fetchMentees();
  }, [fetchMentees]);

  return {
    mentees,
    loading,
    error,
    refetch: fetchMentees,
  };
};

export default useMenteesData;
