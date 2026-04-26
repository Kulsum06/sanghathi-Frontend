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
import useApiCache from "../../hooks/useApiCache";

const External = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get('menteeId');
  const userId = menteeId || user?._id;
  
  const [externalData, setExternalData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const availableSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const { data: cachedData, loading, error, invalidate } = useApiCache(
    userId ? `/students/external/${userId}` : null
  );

  useEffect(() => {
    if (cachedData !== undefined) {
      if (cachedData?.data?.external) {
        const data = cachedData.data.external;
        if (data.semesters && data.semesters.length > 0) {
          setExternalData(data.semesters);
          setSelectedSemester(data.semesters[0].semester);
        } else {
          setExternalData([data]);
          setSelectedSemester(1);
        }
      } else {
        setExternalData([]);
        setSelectedSemester(1);
      }
    } else if (error) {
      setExternalData([{passingDate: null, sgpa: null, subjects: []}]);
      setSelectedSemester(1);
    }
  }, [cachedData, error]);

  const handleSemesterChange = (event) => {
    setSelectedSemester(parseInt(event.target.value, 10));
  };

  const getSubjectsForSemester = () => {
    if (!selectedSemester) return [];
    const semesterData = externalData.find((s) => s.semester === selectedSemester);
    if (!semesterData || !semesterData.subjects) return [];

    const subjectsMap = new Map();
    semesterData.subjects.forEach((subject) => {
      subjectsMap.set(subject.subjectCode, subject);
    });
    return Array.from(subjectsMap.values());
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        External Marks Report
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <label>
          Select Semester:
          <Select
            value={selectedSemester || 1}
            onChange={handleSemesterChange}
            sx={{ ml: 1, minWidth: 120 }}
          >
            {availableSemesters.map((sem) => (
              <MenuItem key={sem} value={sem}>
                Semester {sem}
              </MenuItem>
            ))}
          </Select>
        </label>
      </Box>

      <TableContainer sx={{ border: "1px solid gray" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>Subject Code</TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>Subject Name</TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>Internal Marks</TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>External Marks</TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>Total</TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>Attempt</TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>Result</TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>Completion Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>Loading...</TableCell>
              </TableRow>
            ) : getSubjectsForSemester().length > 0 ? (
              getSubjectsForSemester().map((subject) => (
                <TableRow key={subject.subjectCode}>
                  <TableCell sx={{ border: "1px solid gray" }}>{subject.subjectCode}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{subject.subjectName}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{subject.internalMarks ?? "-"}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{subject.externalMarks ?? "-"}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{subject.total ?? "-"}</TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>{subject.attempt || "1"}</TableCell>
                  <TableCell sx={{ 
                    border: "1px solid gray",
                    color: subject.result === "PASS" ? "success.main" : "error.main",
                    fontWeight: "bold" 
                  }}>
                    {subject.result || "-"}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {externalData.find(s => s.semester === selectedSemester)?.passingDate || "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  No external marks data available for this semester.
                </TableCell>
              </TableRow>
            )}
            
            {getSubjectsForSemester().length > 0 && (
              <TableRow>
                <TableCell 
                  colSpan={8}
                  align="center"
                  sx={{ border: "1px solid gray", fontWeight: "bold", bgcolor: "action.hover" }}
                >
                  SGPA: {externalData.find(s => s.semester === selectedSemester)?.sgpa ?? "-"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default External;