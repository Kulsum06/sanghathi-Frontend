import { useState, useEffect, useContext } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import useStudentSemester from "../../hooks/useStudentSemester";
import useApiCache from "../../hooks/useApiCache";

const Iat = () => {
  const { user } = useContext(AuthContext);
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        IAT Marks Report
      </Typography>

      {error && <Typography color="error" align="center">Failed to fetch IAT data</Typography>}

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <label>
          Select Semester:
          <Select
            value={selectedSemester || ''}
            onChange={handleSemesterChange}
            sx={{ ml: 1, minWidth: 120 }}
          >
            {iatData.map((sem) => (
              <MenuItem key={sem.semester} value={sem.semester}>
                Semester {sem.semester}
              </MenuItem>
            ))}
          </Select>
        </label>
      </Box>

      <TableContainer sx={{ border: "1px solid gray" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid gray" }}>Subject Code</TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>Subject Name</TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>IAT 1 (Out of 50)</TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>IAT 2 (Out of 50)</TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>IAT Avg (Out of 50)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : getSubjectsForSemester().length > 0 ? (
              getSubjectsForSemester().map((subject) => (
                <TableRow key={subject.subjectCode}>
                  <TableCell sx={{ border: "1px solid gray" }}>{subject.subjectCode}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{subject.subjectName}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{getIatMarks(subject.subjectCode, 1)}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{getIatMarks(subject.subjectCode, 2)}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{getIatMarks(subject.subjectCode, 3)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No IAT marks data available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Iat;