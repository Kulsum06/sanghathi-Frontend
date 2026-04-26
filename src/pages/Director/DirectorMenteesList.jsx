import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  useTheme,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  alpha,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import Page from "../../components/Page";
import api from "../../utils/axios";
import TableRowsSkeleton from "../../components/skeletons/TableRowsSkeleton";
import useMenteesData from "../../hooks/useMenteesData";
import { AuthContext } from "../../context/AuthContext";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";
import useResponsive from "../../hooks/useResponsive";

import logger from "../../utils/logger.js";

const DirectorMenteesList = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const isMobile = useResponsive("down", "sm");
  const { mentorId } = useParams();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const routePrefix =
    user?.roleName === "hod" || location.pathname.startsWith("/hod")
      ? "/hod"
      : "/director";
  const { mentees, loading, error } = useMenteesData(mentorId, {
    enabled: Boolean(mentorId),
  });
  const [mentorInfo, setMentorInfo] = useState(null);
  const [mentorInfoError, setMentorInfoError] = useState(null);
  const navigate = useNavigate();
  const mentorAvatarSrc = getAvatarSrc(mentorInfo);

  useEffect(() => {
    const fetchMentorInfo = async () => {
      try {
        const response = await api.get(`/users/${mentorId}`);
        setMentorInfo(response.data.data.user);
      } catch (err) {
        logger.error("Error fetching mentor info:", err);
        setMentorInfoError("Unable to load mentor details.");
      }
    };

    if (mentorId) {
      fetchMentorInfo();
    }
  }, [mentorId]);

  if (error || mentorInfoError) {
    return (
      <Page title="View Mentees">
        <Typography color="error">{error || mentorInfoError}</Typography>
      </Page>
    );
  }

  return (
    <Page title={`${mentorInfo?.name}'s Mentees`}>
      <Card>
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            px: { xs: 2, sm: 3 },
            py: 2
          }}
        >
          <Stack spacing={2}>
            <Breadcrumbs>
              <MuiLink
                component={Link}
                to={`${routePrefix}/dashboard`}
                underline="hover"
                color="inherit"
              >
                Dashboard
              </MuiLink>
              <MuiLink
                component={Link}
                to={`${routePrefix}/mentors`}
                underline="hover"
                color="inherit"
              >
                Mentors
              </MuiLink>
              <Typography color="text.primary">Mentees</Typography>
            </Breadcrumbs>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 },
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Avatar
                    alt={mentorInfo?.name}
                    src={mentorAvatarSrc || undefined}
                    sx={{
                      width: { xs: 38, sm: 44 },
                      height: { xs: 38, sm: 44 },
                      backgroundColor: isLight
                        ? theme.palette.primary.main
                        : theme.palette.info.main,
                    }}
                  >
                    {!mentorAvatarSrc
                      ? getAvatarFallbackText(mentorInfo?.name || "Mentor")
                      : null}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
                      {mentorInfo?.name}'s Mentees
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mentorInfo?.department} Department
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`${routePrefix}/mentors`)}
                size={isMobile ? "small" : "medium"}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Back to Mentors
              </Button>
            </Box>
          </Stack>
        </Box>

        <CardContent sx={{ px: { xs: 1.5, sm: 3 } }}>
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: { xs: 760, md: "100%" } }}>
              <TableHead sx={{ backgroundColor: isLight ? theme.palette.grey[100] : "#2a2d32" }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>USN</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Email</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Phone</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRowsSkeleton columns={7} rows={8} />
                ) : mentees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ color: theme.palette.text.primary }}>
                      No mentees allotted to this mentor.
                    </TableCell>
                  </TableRow>
                ) : (
                  mentees.map((mentee) => {
                    const avatarSrc = getAvatarSrc(mentee);

                    return (
                    <TableRow 
                      key={mentee._id} 
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: isLight 
                            ? alpha(theme.palette.primary.main, 0.05) 
                            : alpha(theme.palette.info.main, 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <Avatar 
                            alt={mentee.name}
                            src={avatarSrc || undefined}
                            sx={{ 
                              width: 34,
                              height: 34,
                              backgroundColor: isLight 
                                ? theme.palette.primary.main 
                                : theme.palette.info.main 
                            }}
                          >
                            {!avatarSrc ? getAvatarFallbackText(mentee.name) : null}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {mentee.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {mentee.profile?.usn || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary, display: { xs: "none", sm: "table-cell" } }}>
                        {mentee.email}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary, display: { xs: "none", md: "table-cell" } }}>
                        {mentee.phone}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        <Chip 
                          label={mentee.profile?.department || "N/A"}
                          size="small"
                          icon={<SchoolIcon />}
                          sx={{
                            backgroundColor: isLight 
                              ? alpha(theme.palette.primary.main, 0.1) 
                              : alpha(theme.palette.info.main, 0.15)
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {mentee.profile?.sem || "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color={isLight ? "primary" : "info"}
                          size={isMobile ? "small" : "medium"}
                          onClick={() => navigate(`${routePrefix}/mentee-profile/${mentee._id}`)}
                          startIcon={<PersonIcon />}
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
        </CardContent>
      </Card>
    </Page>
  );
};

export default DirectorMenteesList;
