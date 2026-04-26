import { useState, useEffect, useCallback, useContext } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  EventAvailable as EventAvailableIcon,
  LocalPhone as LocalPhoneIcon,
  MeetingRoom as MeetingRoomIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import logger from "../../utils/logger.js";
import { getAvatarFallbackText, getAvatarSrc } from "../../utils/avatarResolver";

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : "Not available";
  }

  return String(value);
};

const getPhoneHref = (phoneValue) => {
  const value = formatValue(phoneValue);
  if (value === "Not available") {
    return null;
  }

  const normalized = value.replace(/[^0-9+]/g, "");
  return normalized ? `tel:${normalized}` : null;
};

const InfoRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.2} alignItems="flex-start" sx={{ py: 0.8 }}>
    {icon}
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
        {formatValue(value)}
      </Typography>
    </Box>
  </Stack>
);

const FacultyProfileInfo = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const isLight = theme.palette.mode === "light";

  const fetchMentorDetails = useCallback(async () => {
    if (!user || !user._id) {
      logger.error("User ID not found");
      setErrorMessage("Unable to identify current user.");
      setLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const mentorResponse = await api.get(`/mentorship/mentor/${user._id}`);
      const mentor = mentorResponse.data?.mentor;

      if (mentor?._id) {
        let facultyProfile = null;

        const shouldFetchProfile = !(
          mentor.department &&
          mentor.cabin &&
          (mentor.mobileNumber || mentor.phone)
        );

        if (shouldFetchProfile) {
          try {
            const profileResponse = await api.get(`/faculty/profile/${mentor._id}`);
            facultyProfile = profileResponse.data?.data?.facultyProfile || null;
          } catch (profileError) {
            if (profileError?.response?.status !== 404) {
              logger.error("Error fetching faculty profile:", profileError);
            }
          }
        }

        const profileName = facultyProfile?.fullName
          ? [
              facultyProfile.fullName.firstName,
              facultyProfile.fullName.middleName,
              facultyProfile.fullName.lastName,
            ]
              .filter(Boolean)
              .join(" ")
          : null;

        setMentorDetails({
          fullName: profileName || mentor.name || "Not available",
          roleName: mentor.roleName || "Faculty Mentor",
          department: facultyProfile?.department || mentor.department || "Not available",
          email: facultyProfile?.email || mentor.email || "Not available",
          personalEmail:
            facultyProfile?.personalEmail || mentor.personalEmail || "Not available",
          mobileNumber:
            facultyProfile?.mobileNumber ||
            mentor.mobileNumber ||
            mentor.phone ||
            "Not available",
          alternatePhoneNumber:
            facultyProfile?.alternatePhoneNumber ||
            mentor.alternatePhoneNumber ||
            "Not available",
          cabin: facultyProfile?.cabin || mentor.cabin || "Not available",
          status: mentor.status || "active",
          photo:
            facultyProfile?.photo ||
            mentor.photo ||
            mentor.avatar ||
            null,
        });
      } else {
        setErrorMessage("No mentor assigned yet.");
      }
    } catch (error) {
      logger.error("Error fetching mentor details:", error);
      if (error?.response?.status === 404) {
        setErrorMessage("No mentor assigned yet.");
      } else {
        setErrorMessage("Unable to load mentor details right now.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchMentorDetails();
  }, [fetchMentorDetails]);

  const mentorAvatarSrc = getAvatarSrc(mentorDetails);
  const mentorFallbackName = mentorDetails?.fullName || "Mentor";
  const officialEmail = formatValue(mentorDetails?.email);
  const mobileNumber = formatValue(mentorDetails?.mobileNumber);
  const emailHref =
    officialEmail === "Not available" ? null : `mailto:${officialEmail}`;
  const phoneHref = getPhoneHref(mentorDetails?.mobileNumber);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        background: isLight
          ? "linear-gradient(180deg, rgba(25,118,210,0.08) 0%, rgba(255,255,255,1) 45%)"
          : "linear-gradient(180deg, rgba(34,45,68,0.7) 0%, rgba(14,20,36,1) 55%)",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            mb: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Mentor Details
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.8 }}>
                Reach your assigned mentor quickly with the most relevant contact details.
              </Typography>
            </Box>
            {!loading && !errorMessage ? (
              <Chip
                label={`Status: ${formatValue(mentorDetails?.status)}`}
                icon={<EventAvailableIcon />}
                color={mentorDetails?.status === "active" ? "success" : "default"}
                variant="outlined"
              />
            ) : null}
          </Stack>
        </Paper>

        {loading ? (
          <Alert severity="info">Loading mentor profile...</Alert>
        ) : errorMessage ? (
          <Alert severity="warning">{errorMessage}</Alert>
        ) : mentorDetails ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <CardContent>
                  <Stack alignItems="center" spacing={1.5} sx={{ textAlign: "center" }}>
                    <Avatar
                      src={mentorAvatarSrc || undefined}
                      alt={mentorFallbackName}
                      sx={{
                        width: 104,
                        height: 104,
                        bgcolor: isLight ? "primary.main" : "info.main",
                        color: "common.white",
                        fontSize: "2.2rem",
                        fontWeight: 700,
                      }}
                    >
                      {!mentorAvatarSrc
                        ? getAvatarFallbackText(mentorFallbackName)
                        : null}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatValue(mentorDetails.fullName)}
                    </Typography>
                    <Chip
                      label={formatValue(mentorDetails.roleName)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <InfoRow
                    icon={<BusinessIcon fontSize="small" color="action" />}
                    label="Department"
                    value={mentorDetails.department}
                  />
                  <InfoRow
                    icon={<MeetingRoomIcon fontSize="small" color="action" />}
                    label="Cabin"
                    value={mentorDetails.cabin}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  mb: 3,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
                    Contact Mentor
                  </Typography>

                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <InfoRow
                        icon={<EmailIcon fontSize="small" color="action" />}
                        label="Official Email"
                        value={mentorDetails.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow
                        icon={<EmailIcon fontSize="small" color="action" />}
                        label="Personal Email"
                        value={mentorDetails.personalEmail}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow
                        icon={<LocalPhoneIcon fontSize="small" color="action" />}
                        label="Mobile Number"
                        value={mentorDetails.mobileNumber}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow
                        icon={<LocalPhoneIcon fontSize="small" color="action" />}
                        label="Alternate Number"
                        value={mentorDetails.alternatePhoneNumber}
                      />
                    </Grid>
                  </Grid>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
                    <Button
                      variant="contained"
                      startIcon={<EmailIcon />}
                      href={emailHref || undefined}
                      disabled={!emailHref}
                    >
                      Email Mentor
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<LocalPhoneIcon />}
                      href={phoneHref || undefined}
                      disabled={!phoneHref}
                    >
                      Call Mentor
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                  <PersonIcon color="action" fontSize="small" sx={{ mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Tip: Use official email for academic communication and call only during working hours.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="warning">No mentor details found.</Alert>
        )}
      </Container>
    </Box>
  );
};

export default FacultyProfileInfo;
