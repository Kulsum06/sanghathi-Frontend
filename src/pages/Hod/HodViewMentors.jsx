import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  useTheme,
  Typography,
  TablePagination,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  alpha,
  Chip,
  Avatar,
} from "@mui/material";
import { useSnackbar } from "notistack";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Page from "../../components/Page";
import api from "../../utils/axios";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";
import useResponsive from "../../hooks/useResponsive";

import logger from "../../utils/logger.js";
function HodViewMentors() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const isMobile = useResponsive("down", "sm");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [mentors, setMentors] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPageOptions = [10, 20, 25];
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const tableHeaderColor = isLight ? theme.palette.primary.main : theme.palette.info.main;

  const getAssignedMentors = useCallback(async () => {
    try {
      setLoading(true);
      logger.info("=== Fetching Mentors for HOD ===");
      logger.info("HOD Department:", user?.department);

      const response = await api.get("/mentors/mentors-with-mentees", {
        params: {
          department: user?.department,
          page: 1,
          limit: 500,
        },
      });

      const mentorsList = response.data?.mentors || [];

      logger.info(`Fetched ${mentorsList.length} mentors for ${user?.department}`);
      setMentors(mentorsList);

      if (!mentorsList.length) {
        enqueueSnackbar("No mentors found with assigned students in your department", {
          variant: "info",
        });
      }
    } catch (error) {
      logger.error("Error fetching mentors:", error);
      enqueueSnackbar("Failed to fetch mentors", { variant: "error" });
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [user?.department, enqueueSnackbar]);

  useEffect(() => {
    if (user && user.department) {
      logger.info("useEffect triggered - fetching mentors");
      getAssignedMentors();
    } else {
      logger.info("User or department not available:", { user: user?.name, dept: user?.department });
    }
  }, [getAssignedMentors, user]);

  const handleViewMentorDashboard = (mentor) => {
    // Navigate to faculty dashboard as HOD viewing this mentor
    navigate(`/hod/mentor-dashboard/${mentor._id}`);
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const paginatedMentors = filteredMentors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Page title="View Mentors">
      <Card>
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1, sm: 0 },
            px: { xs: 2, sm: 3 },
            py: 2
          }}
        >
          <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
            Assigned Mentors in {user.department} Department
          </Typography>
          <Chip 
            icon={<SchoolIcon />}
            label={`${filteredMentors.length} Assigned Mentors`}
            color={isLight ? "primary" : "info"}
            variant="outlined"
          />
        </Box>
        <CardContent sx={{ px: { xs: 1.5, sm: 3 } }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                placeholder="Search assigned mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <Button size="small" onClick={() => setSearchQuery("")}>
                        <ClearIcon />
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: { xs: 780, md: "100%" } }}>
                <TableHead sx={{ backgroundColor: alpha(tableHeaderColor, 0.1) }}>
                  <TableRow>
                    <TableCell>Avatar</TableCell>
                    <TableCell>Mentor Name</TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Email</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Phone</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Assigned Mentees</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          Loading assigned mentors...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedMentors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          No assigned mentors found in your department
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMentors.map((mentor) => {
                      const avatarSrc = getAvatarSrc(mentor);

                      return (
                      <TableRow 
                        key={mentor._id}
                        hover
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: isLight 
                              ? alpha(theme.palette.primary.main, 0.05) 
                              : alpha(theme.palette.info.main, 0.05)
                          } 
                        }}
                      >
                        <TableCell>
                          <Avatar 
                            alt={mentor.name}
                            src={avatarSrc || undefined}
                            sx={{ 
                              backgroundColor: isLight 
                                ? theme.palette.primary.main 
                                : theme.palette.info.main 
                            }}
                          >
                            {!avatarSrc ? getAvatarFallbackText(mentor.name) : null}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {mentor.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{mentor.email}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{mentor.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={mentor.department} 
                            size="small"
                            sx={{
                              backgroundColor: isLight 
                                ? alpha(theme.palette.primary.main, 0.1) 
                                : alpha(theme.palette.info.main, 0.15)
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            icon={<PeopleIcon />}
                            label={mentor.menteeCount}
                            size="small"
                            color="success"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size={isMobile ? "small" : "medium"}
                            color={isLight ? "primary" : "info"}
                            onClick={() => handleViewMentorDashboard(mentor)}
                            startIcon={!isMobile ? <DashboardIcon /> : null}
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            View Dashboard
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={isMobile ? [10, 20] : rowsPerPageOptions}
              component="div"
              count={filteredMentors.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
}

export default React.memo(HodViewMentors);
