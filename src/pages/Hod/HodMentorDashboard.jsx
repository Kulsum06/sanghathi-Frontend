import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  useTheme,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  alpha,
} from "@mui/material";
import {
  Person as PersonIcon,
  People as PeopleIcon,
  QuestionAnswer as QuestionAnswerIcon,
  HdrStrong as HdrStrongIcon,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Page from "../../components/Page";
import api from "../../utils/axios";
import TableRowsSkeleton from "../../components/skeletons/TableRowsSkeleton";
import useMenteesData from "../../hooks/useMenteesData";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";

import logger from "../../utils/logger.js";

const MentorTile = ({ title, icon, onClick, menteeId }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Card
      sx={{
        transition: "all 0.3s ease",
        borderRadius: 3,
        borderLeft: isLight
          ? `4px solid ${theme.palette.primary.main}`
          : `4px solid ${theme.palette.info.main}`,
        overflow: "hidden",
        backgroundColor: isLight
          ? alpha(theme.palette.primary.main, 0.08)
          : alpha(theme.palette.info.main, 0.1),
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: isLight
            ? theme.customShadows.primary
            : `0 10px 28px 0 ${alpha(theme.palette.info.dark, 0.3)}`,
        },
      }}
    >
      <CardActionArea onClick={() => onClick(menteeId)}>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            minHeight: "auto",
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "12px",
              mr: 3,
              backgroundColor: isLight
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.info.main, 0.15),
              color: isLight
                ? theme.palette.primary.main
                : theme.palette.info.light,
            }}
          >
            {React.cloneElement(icon, { fontSize: "large" })}
          </Box>

          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                opacity: 0.8,
              }}
            >
              Click to view
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const HodMentorDashboard = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { mentees, loading, error: menteesError } = useMenteesData(mentorId, {
    enabled: Boolean(mentorId),
  });
  const [mentorInfo, setMentorInfo] = useState(null);
  const [mentorInfoError, setMentorInfoError] = useState(null);

  useEffect(() => {
    const fetchMentorInfo = async () => {
      try {
        const response = await api.get(`/users/${mentorId}`);
        setMentorInfo(response.data.data.user);
      } catch (err) {
        logger.error("Error fetching mentor info:", err);
        setMentorInfoError("Error fetching mentor information");
      }
    };

    if (mentorId) {
      fetchMentorInfo();
    }
  }, [mentorId]);

  const handleViewMenteeDashboard = (menteeId) => {
    navigate(`/hod/mentee-profile/${menteeId}`);
  };
  const mentorAvatarSrc = getAvatarSrc(mentorInfo);

  if (mentorInfoError || menteesError) {
    return (
      <Page title="Mentor Dashboard">
        <Typography color="error">{mentorInfoError || menteesError}</Typography>
      </Page>
    );
  }

  return (
    <Page title={`${mentorInfo?.name}'s Dashboard`}>
      <Box
        sx={{
          pt: 3,
          pb: 5,
          backgroundColor: isLight
            ? alpha(theme.palette.primary.lighter, 0.4)
            : alpha(theme.palette.grey[900], 0.2),
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="xl" sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              mt: 1,
              borderRadius: 3,
              backgroundColor: isLight
                ? "rgba(255, 255, 255, 0.8)"
                : alpha(theme.palette.background.paper, 0.6),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(
                isLight ? theme.palette.primary.main : theme.palette.info.main,
                0.1
              )}`,
            }}
          >
            <Stack spacing={2}>
              <Breadcrumbs>
                <MuiLink
                  component={Link}
                  to="/hod/dashboard"
                  underline="hover"
                  color="inherit"
                >
                  Dashboard
                </MuiLink>
                <MuiLink
                  component={Link}
                  to="/hod/mentors"
                  underline="hover"
                  color="inherit"
                >
                  Assigned Mentors
                </MuiLink>
                <Typography color="text.primary">Mentor Dashboard</Typography>
              </Breadcrumbs>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  mb: 3,
                }}
              >
                <Avatar
                  alt={mentorInfo?.name || "Mentor"}
                  src={mentorAvatarSrc || undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    backgroundColor: isLight
                      ? theme.palette.primary.main
                      : theme.palette.info.main,
                  }}
                >
                  {!mentorAvatarSrc
                    ? getAvatarFallbackText(mentorInfo?.name || "Mentor")
                    : null}
                </Avatar>

                <Typography
                  variant="h4"
                  color={isLight ? "primary" : "info"}
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    position: "relative",
                    display: "inline-block",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      width: "40%",
                      height: "4px",
                      borderRadius: "2px",
                      backgroundColor: isLight
                        ? theme.palette.primary.main
                        : theme.palette.info.main,
                      bottom: "-8px",
                      left: "30%",
                    },
                  }}
                >
                  {mentorInfo?.name}'s Dashboard
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: "600px", mt: 3 }}
                >
                  View mentor's profile and assigned mentees
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/hod/mentors")}
                  sx={{ mt: 2 }}
                >
                  Back to Mentors
                </Button>
              </Box>
            </Stack>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={6} lg={4}>
              <Card
                sx={{
                  p: 3,
                  backgroundColor: isLight
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.info.main, 0.1),
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Mentor Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {mentorInfo?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {mentorInfo?.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Department:</strong> {mentorInfo?.department}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {mentorInfo?.phone || "N/A"}
                  </Typography>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={4}>
              <Card
                sx={{
                  p: 3,
                  backgroundColor: isLight
                    ? alpha(theme.palette.success.main, 0.05)
                    : alpha(theme.palette.success.main, 0.1),
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Mentees Statistics
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 2,
                  }}
                >
                  <Typography variant="h2" color="success.main">
                    {loading ? "-" : mentees.length}
                  </Typography>
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    Assigned Mentees
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: isLight
                ? "rgba(255, 255, 255, 0.8)"
                : alpha(theme.palette.background.paper, 0.6),
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Assigned Mentees
            </Typography>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: isLight
                      ? theme.palette.grey[100]
                      : "#2a2d32",
                  }}
                >
                  <TableRow>
                    <TableCell>Avatar</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>USN</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRowsSkeleton columns={8} rows={8} avatarColumns={[0]} />
                  ) : mentees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        No mentees assigned to this mentor.
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
                          "&:hover": {
                            backgroundColor: isLight
                              ? alpha(theme.palette.primary.main, 0.05)
                              : alpha(theme.palette.info.main, 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Avatar
                            alt={mentee.name}
                            src={avatarSrc || undefined}
                            sx={{
                              backgroundColor: isLight
                                ? theme.palette.primary.main
                                : theme.palette.info.main,
                            }}
                          >
                            {!avatarSrc ? getAvatarFallbackText(mentee.name) : null}
                          </Avatar>
                        </TableCell>
                        <TableCell
                          sx={{ color: theme.palette.text.primary }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {mentee.name}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ color: theme.palette.text.primary }}
                        >
                          {mentee.profile?.usn || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ color: theme.palette.text.primary }}
                        >
                          {mentee.email}
                        </TableCell>
                        <TableCell
                          sx={{ color: theme.palette.text.primary }}
                        >
                          {mentee.phone}
                        </TableCell>
                        <TableCell
                          sx={{ color: theme.palette.text.primary }}
                        >
                          <Chip
                            label={mentee.profile?.department || "N/A"}
                            size="small"
                            sx={{
                              backgroundColor: isLight
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.info.main, 0.15),
                            }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{ color: theme.palette.text.primary }}
                        >
                          {mentee.profile?.sem || "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color={isLight ? "primary" : "info"}
                            size="small"
                            onClick={() =>
                              handleViewMenteeDashboard(mentee._id)
                            }
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
          </Paper>
        </Container>
      </Box>
    </Page>
  );
};

export default HodMentorDashboard;
