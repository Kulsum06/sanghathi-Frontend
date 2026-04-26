import { useState, useEffect, useContext } from "react";
import { useSearchParams } from 'react-router-dom';
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
  CircularProgress
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import useStudentSemester from "../../hooks/useStudentSemester";
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams] = useSearchParams();
  const { semester: studentSemester, loading: semesterLoading } = useStudentSemester();
  const menteeId = searchParams.get('menteeId') || user?._id;
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState({ usn: '', name: '' });
  const [selectedSemester, setSelectedSemester] = useState(null); 
  const [selectedMonth, setSelectedMonth] = useState(0); 

  const { data: userData, loading: userLoading, error: userError } = useApiCache(
    menteeId ? `/users/${menteeId}` : null
  );

  const { data: attendanceCache, loading: attendLoading, error: attendError } = useApiCache(
    menteeId && !semesterLoading ? `/students/attendance/${menteeId}` : null
  );

  useEffect(() => {
    if (userData !== undefined) {
      if (userData?.data?.user) {
        setStudentInfo({
          usn: userData.data.user.usn || '',
          name: userData.data.user.name || ''
        });
      } else if (user) {
        setStudentInfo({
          usn: user.usn || '',
          name: user.name || ''
        });
      }
    }
  }, [userData, user]);

  useEffect(() => {
    if (attendanceCache !== undefined) {
      if (attendanceCache?.data?.attendance) {
        const data = attendanceCache.data.attendance;
        if (data && data.semesters) {
          setAttendanceData(data.semesters);
          if (data.semesters.length > 0) {
            const defaultSem = studentSemester && data.semesters.find(s => s.semester === studentSemester)
              ? studentSemester
              : data.semesters[0].semester;
            setSelectedSemester(defaultSem);
          }
        } else {
          setAttendanceData([]);
        }
      } else {
        setAttendanceData([]);
      }
    }
  }, [attendanceCache, studentSemester]);

  const getCumulativeAttendance = (subjectName, semester) => {
    const semesterData = attendanceData.find(s => s.semester === semester);
    if (!semesterData) return "No Data";
    let totalAttended = 0;
    let totalTaken = 0;

    semesterData.months.forEach(monthData => {
        const sub = monthData.subjects.find(s => s.subjectName === subjectName);
        if (sub) {
            totalAttended += sub.attendedClasses;
            totalTaken += sub.totalClasses;
        }
    });

    if (totalTaken === 0) return "No Data";
    const percentage = ((totalAttended / totalTaken) * 100).toFixed(2);
    return `${totalAttended}/${totalTaken} (${percentage}%)`;
  };

  const getOverallAttendance = (semester) => {
    const semesterData = attendanceData.find(s => s.semester === semester);
    if (!semesterData) return "No Data";
    let totalAttended = 0;
    let totalTaken = 0;

    semesterData.months.forEach((monthData) => {
      monthData.subjects.forEach((subject) => {
        totalAttended += subject.attendedClasses;
        totalTaken += subject.totalClasses;
      });
    });
    if (totalTaken === 0) return "No Data";

    const percentage = ((totalAttended / totalTaken) * 100).toFixed(2);
    return `${totalAttended}/${totalTaken} (${percentage}%)`;
  };

  const getMonthAttendance = (subjectName, semester, month) => {
    if (month === 0) return getCumulativeAttendance(subjectName, semester);

    const semesterData = attendanceData.find((s) => s.semester === semester);
    if (!semesterData) return "No Data";

    const monthData = semesterData.months.find((m) => m.month === month);
    if (!monthData) return "No Data";

    const subject = monthData.subjects.find((s) => s.subjectName === subjectName);
    if (!subject) return "No Data";

    const { attendedClasses, totalClasses } = subject;
    if (totalClasses === 0) return "No Data";
    const percentage = ((attendedClasses / totalClasses) * 100).toFixed(2);
    return `${attendedClasses}/${totalClasses} (${percentage}%)`;
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(parseInt(event.target.value, 10)); 
    setSelectedMonth(0); 
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10)); 
  };

  const getAvailableMonths = () => {
    if (!selectedSemester) return []; 
    const semesterData = attendanceData.find((s) => s.semester === selectedSemester);
    if (!semesterData) return []; 
    const months = semesterData.months.map((m) => m.month);
    return [0, ...months]; 
  };

  const getSubjectsForSemester = () => {
    if (!selectedSemester) return [];
    const semesterData = attendanceData.find(s => s.semester === selectedSemester);
    if (!semesterData) return [];
    const allSubjects = semesterData.months.flatMap(monthData => monthData.subjects);
    const uniqueSubjects = new Map();
    allSubjects.forEach(subject => {
        const key = subject.subjectName || 'Unknown Subject';
        if (!uniqueSubjects.has(key)) {
            uniqueSubjects.set(key, {
                subjectCode: subject.subjectCode || 'N/A',
                subjectName: subject.subjectName || 'Unknown Subject'
            });
        }
    });
    return Array.from(uniqueSubjects.values()).sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  };

  const loading = userLoading || attendLoading;
  const error = userError || attendError;

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Typography
        variant={isSmDown ? "h5" : "h4"}
        component="h1"
        gutterBottom
        align="center"
      >
        Attendance Report
      </Typography>
      {studentInfo.usn && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.5, sm: 2 }}
          sx={{ mb: 2, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "center" }}
        >
          <Typography variant="body2"><strong>USN:</strong> {studentInfo.usn}</Typography>
          {studentInfo.name && (
            <Typography variant="body2"><strong>Name:</strong> {studentInfo.name}</Typography>
          )}
          {selectedSemester && (
            <Typography variant="body2"><strong>Semester:</strong> {selectedSemester}</Typography>
          )}
        </Stack>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 2, alignItems: { xs: "stretch", sm: "center" }, justifyContent: "center" }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="attendance-semester-select-label">Semester</InputLabel>
          <Select
            labelId="attendance-semester-select-label"
            value={selectedSemester ?? ""}
            onChange={handleSemesterChange}
            label="Semester"
            displayEmpty
          >
            {attendanceData.map((sem) => (
              <MenuItem key={sem.semester} value={sem.semester}>Semester {sem.semester}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="attendance-month-select-label">Month</InputLabel>
            <Select
              labelId="attendance-month-select-label"
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Month"
            >
              {getAvailableMonths().map((month) => (
                <MenuItem key={month} value={month}>
                  {month === 0 ? "All" : `Month ${month}`}
                </MenuItem>
              ))}
            </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load attendance data.
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer sx={{ border: "1px solid gray", overflowX: "auto" }}>
          <Table sx={{ minWidth: { xs: 720, md: "100%" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid gray" }}>
                Subject Code
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Subject Name
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Attendance
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Cumulative Attendance
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSubjectsForSemester().length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ border: "1px solid gray", py: 3 }}>
                  No attendance data available for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              getSubjectsForSemester().map((subject, index) => (
                <TableRow key={`${subject.subjectName}-${index}`}>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.subjectCode}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.subjectName}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {getMonthAttendance(subject.subjectName, selectedSemester, selectedMonth)}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {getCumulativeAttendance(subject.subjectName, selectedSemester)}
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow sx={{ fontWeight: "bold" }}>
              <TableCell colSpan={2}>Overall Attendance</TableCell>
              <TableCell>
                {getOverallAttendance(selectedSemester)}
                <Box component="span" sx={{ ml: 1 }}>
                  (for selected semester)
                </Box>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Attendance;