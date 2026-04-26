import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';

import logger from "../utils/logger.js";

/**
 * Custom hook to fetch student's current semester from admission details
 * @returns {Object} { semester: number|null, loading: boolean }
 */
export const useStudentSemester = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get('menteeId');
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const userId = menteeId || user?._id;
        if (!userId) {
          logger.info('[useStudentSemester] No userId available');
          setLoading(false);
          return;
        }

        logger.info('[useStudentSemester] Fetching semester for userId:', userId);

        // Fetch admission details to get current semester
        const response = await api.get(`/v1/admissions/${userId}`);

        logger.info('[useStudentSemester] Admission response:', response.data);

        const admissionData = response.data.data?.admissionDetails;
        if (admissionData?.semester) {
          // Convert semester string (e.g., "5th") to number (e.g., 5)
          const semesterNumber = parseInt(admissionData.semester.replace(/\D/g, ''), 10);
          logger.info('[useStudentSemester] Setting semester:', semesterNumber, 'from', admissionData.semester);
          setSemester(semesterNumber);
        } else {
          logger.info('[useStudentSemester] No semester found in admission data');
        }
      } catch (error) {
        logger.error('[useStudentSemester] Error fetching student semester:', error);
        // Don't show error to user, just use default semester
      } finally {
        setLoading(false);
      }
    };

    fetchSemester();
  }, [user?._id, menteeId]);

  return { semester, loading };
};

export default useStudentSemester;
