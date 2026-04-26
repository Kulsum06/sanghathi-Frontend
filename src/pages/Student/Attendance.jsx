import { useState, useEffect, useContext } from "react";
import { useSearchParams } from 'react-router-dom';
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
  CircularProgress
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import useStudentSemester from "../../hooks/useStudentSemester";
import useApiCache from "../../hooks/useApiCache";

const Attendance = () => {
  const { user } = useContext(AuthContext);
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

  return (
    <Box sx={{ p: 2 }}>
      <h1 sx={{ textAlign: "center", mb: 2 }}>Attendance Report</h1>
      {studentInfo.usn && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <strong>USN:</strong> {studentInfo.usn}
          {studentInfo.name && (
            <><strong>Name:</strong> {studentInfo.name}</>
          )}
          {selectedSemester && (
            <><strong>Semester:</strong> {selectedSemester}</>
          )}
        </Box>
      )}
      {(attendError) && <Box color="error.main" mb={2} textAlign="center">Error loading attendance information.</Box>}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <label>
          Select Semester:
          <Select value={selectedSemester || ''} onChange={handleSemesterChange} sx={{ ml: 1, minWidth: 100 }}>
            {attendanceData.map((sem) => (
              <MenuItem key={sem.semester} value={sem.semester}>Semester {sem.semester}</MenuItem>
            ))}
          </Select>
        </label>
        <Box sx={{ ml: 2 }}>
          <label>
            Select Month:
            <Select value={selectedMonth} onChange={handleMonthChange} sx={{ ml: 1, minWidth: 100 }}>
              {getAvailableMonths().map((month) => (
                <MenuItem key={month} value={month}>
                  {month === 0 ? "All" : `Month ${month}`}
                </MenuItem>
              ))}
            </Select>
          </label>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer sx={{ border: "1px solid gray" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ border: "1px solid gray" }}>Subject Code</TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>Subject Name</TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>Attendance</TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>Cumulative Attendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getSubjectsForSemester().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No Data Available</TableCell>
                </TableRow>
              ) : (
                getSubjectsForSemester().map((subject, index) => (
                  <TableRow key={`${subject.subjectName}-${index}`}>
                    <TableCell sx={{ border: "1px solid gray" }}>{subject.subjectCode}</TableCell>
                    <TableCell sx={{ border: "1px solid gray" }}>{subject.subjectName}</TableCell>
                    <TableCell sx={{ border: "1px solid gray" }}>{getMonthAttendance(subject.subjectName, selectedSemester, selectedMonth)}</TableCell>
                    <TableCell sx={{ border: "1px solid gray" }}>{getCumulativeAttendance(subject.subjectName, selectedSemester)}</TableCell>
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
    </Box>
  );
};

export default Attendance;