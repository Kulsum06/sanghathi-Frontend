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
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

const External = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
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
        logger.info("[External] Data fetched successfully:", data);
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
      logger.error("[External] Error fetching external marks:", error);
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
    <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Typography variant={isSmDown ? "h5" : "h4"} component="h1" gutterBottom align="center">
        External Marks Report
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} sx={{ mb: 2, justifyContent: "center" }}>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="external-semester-select-label">Semester</InputLabel>
          <Select
            labelId="external-semester-select-label"
            value={selectedSemester || ""}
            onChange={handleSemesterChange}
            label="Semester"
            displayEmpty
          >
            {availableSemesters.map((sem) => (
              <MenuItem key={sem} value={sem}>
                Semester {sem}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          Loading external marks...
        </Typography>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to fetch external marks
        </Alert>
      )}

      {!loading && (
      <TableContainer sx={{ border: "1px solid gray", overflowX: "auto" }}>
        <Table sx={{ minWidth: { xs: 920, md: "100%" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Subject Code
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Subject Name
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Internal Marks
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                External Marks
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Total
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold", display: { xs: "none", sm: "table-cell" } }}>
                Attempt
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold", display: { xs: "none", md: "table-cell" } }}>
                Result
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold", display: { xs: "none", md: "table-cell" } }}>
                Completion Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSubjectsForSemester().length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  No external marks data available for this semester.
                </TableCell>
              </TableRow>
            ) : (
            getSubjectsForSemester().map((subject) => (
              <TableRow key={subject.subjectCode}>
                <TableCell sx={{ border: "1px solid gray" }}>
                  {subject.subjectCode}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>
                  {subject.subjectName}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>
                  {subject.internalMarks ?? "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>
                  {subject.externalMarks ?? "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray" }}>
                  {subject.total ?? "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray", display: { xs: "none", sm: "table-cell" } }}>
                  {subject.attempt || "1"}
                </TableCell>
                <TableCell sx={{ 
                  border: "1px solid gray",
                  color: subject.result === "PASS" ? "success.main" : "error.main",
                  fontWeight: "bold",
                  display: { xs: "none", md: "table-cell" }
                }}>
                  {subject.result || "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid gray", display: { xs: "none", md: "table-cell" } }}>
                  {externalData.find(s => s.semester === selectedSemester)?.passingDate || "-"}
                </TableCell>
              </TableRow>
            ))
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
      )}
    </Container>
  );
};

export default External;