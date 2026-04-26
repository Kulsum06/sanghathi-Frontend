import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Alert,
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import useStudentSemester from "../../hooks/useStudentSemester";
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

const Iat = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get('menteeId');
  const userId = menteeId || user?._id;
  const { semester: studentSemester, loading: semesterLoading } = useStudentSemester();
  
  const [iatData, setIatData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);

  const { data: cachedData, loading, error, invalidate } = useApiCache(
    userId && !semesterLoading ? `/students/iat/${userId}` : null
  );

  useEffect(() => {
    if (cachedData !== undefined) {
      const data = cachedData?.data?.iat;
      if (data && data.semesters) {
        setIatData(data.semesters);
        if (data.semesters.length > 0) {
          const defaultSem = studentSemester && data.semesters.find(s => s.semester === studentSemester)
            ? studentSemester
            : data.semesters[0].semester;
          
          logger.info('[Iat] Setting semester to:', defaultSem, '(studentSemester:', studentSemester, ', first available:', data.semesters[0].semester, ')');
          setSelectedSemester(defaultSem);
        }
      } else {
        setIatData([]);
      }
    }
  }, [cachedData, studentSemester]);

  const handleSemesterChange = (event) => {
    setSelectedSemester(parseInt(event.target.value, 10));
  };

  const getSubjectsForSemester = () => {
    if (!selectedSemester) return [];
    const semesterData = iatData.find((s) => s.semester === selectedSemester);
    if (!semesterData) return [];

    const subjectsMap = new Map();
    semesterData.subjects.forEach((subject) => {
      subjectsMap.set(subject.subjectCode, subject);
    });
    return Array.from(subjectsMap.values());
  };

  const getIatMarks = (subjectCode, iatNumber) => {
    if (!selectedSemester) return "";
    const semesterData = iatData.find(s => s.semester === selectedSemester);
    if (!semesterData) return "";

    const subject = semesterData.subjects.find(s => s.subjectCode === subjectCode);
    if (!subject) return "";

    switch (iatNumber) {
        case 1: return subject.iat1 || "";
        case 2: return subject.iat2 || "";
        case 3: return subject.avg || "";
        default: return "";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Typography variant={isSmDown ? "h5" : "h4"} component="h1" gutterBottom align="center">
        IAT Marks Report
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} sx={{ mb: 2, justifyContent: "center" }}>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="iat-semester-select-label">Semester</InputLabel>
          <Select
            labelId="iat-semester-select-label"
            value={selectedSemester ?? ""}
            onChange={handleSemesterChange}
            label="Semester"
          >
            {iatData.map((sem) => (
              <MenuItem key={sem.semester} value={sem.semester}>
                Semester {sem.semester}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          Loading IAT marks...
        </Typography>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to fetch IAT data
        </Alert>
      )}

      {!loading && !error && (
      <TableContainer sx={{ border: "1px solid gray", overflowX: "auto" }}>
        <Table sx={{ minWidth: { xs: 640, md: "100%" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid gray", display: { xs: "none", sm: "table-cell" } }}>
                Subject Code
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Subject Name
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>IAT 1(Out of 50)</TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>IAT 2(Out of 50)</TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>IAT Avg(Out of 50)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSubjectsForSemester().length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ border: "1px solid gray", py: 3 }}>
                  No IAT data available for the selected semester.
                </TableCell>
              </TableRow>
            ) : (
            getSubjectsForSemester().map((subject) => (
              <TableRow key={subject.subjectCode}>
                <TableCell sx={{ border: "1px solid gray", display: { xs: "none", sm: "table-cell" } }}>
                  {subject.subjectCode}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>
                  {subject.subjectName}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>
                    {getIatMarks(subject.subjectCode, 1)}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>
                    {getIatMarks(subject.subjectCode, 2)}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>
                    {getIatMarks(subject.subjectCode, 3)}
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}
    </Container>
  );
};

export default Iat;