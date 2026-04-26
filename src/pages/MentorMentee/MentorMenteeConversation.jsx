import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Box,
  Paper,
  CircularProgress,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  ArrowBackRounded,
  CheckCircleOutline,
  InfoOutlined,
} from "@mui/icons-material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import useMenteesData from "../../hooks/useMenteesData";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";

import logger from "../../utils/logger.js";

const MentorMenteeConversation = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const accentColor = isLight
    ? theme.palette.primary.main
    : theme.palette.info.main;
  const navigate = useNavigate();
  const { menteeId: menteeIdFromPath } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [mooc, setMooc] = useState(false);
  const [miniProject, setMiniProject] = useState(false);
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    mentees,
    loading: loadingMentees,
    error,
  } = useMenteesData(user?._id, {
    enabled: Boolean(user?._id),
  });

  const [existingConversation, setExistingConversation] = useState(null);
  const [checkingConversation, setCheckingConversation] = useState(false);
  const preselectedMenteeId = searchParams.get("menteeId") || menteeIdFromPath || "";
  const normalizedMentees = useMemo(() => {
    if (!preselectedMenteeId) {
      return mentees;
    }

    const isPresent = mentees.some((mentee) => mentee._id === preselectedMenteeId);
    if (isPresent) {
      return mentees;
    }

    return [
      {
        _id: preselectedMenteeId,
        name: "Selected Mentee",
        profile: {
          usn: "",
          sem: "",
        },
      },
      ...mentees,
    ];
  }, [mentees, preselectedMenteeId]);

  useEffect(() => {
    if (preselectedMenteeId) {
      setSelectedStudent(preselectedMenteeId);
    }
  }, [preselectedMenteeId]);

  // Check if conversation already exists for selected mentee
  useEffect(() => {
    const checkExistingConversation = async () => {
      if (!selectedStudent || !user) {
        setExistingConversation(null);
        return;
      }

      try {
        setCheckingConversation(true);
        logger.info("🔍 Checking for existing conversation...", {
          mentorId: user._id,
          menteeId: selectedStudent,
        });

        const response = await api.get("/conversations", {
          params: {
            mentorId: user._id,
            menteeId: selectedStudent,
            isOffline: true,
            hasSummary: true,
            page: 1,
            limit: 1,
            fields: "_id,mentorId,menteeId,title,description,isOffline,date",
          },
        });

        const conversations = response.data?.conversations || [];
        const existing = conversations[0] || null;

        if (existing) {
          logger.info("✅ Found existing conversation:", existing);
          setExistingConversation(existing);
        } else {
          logger.info("📝 No existing conversation found");
          setExistingConversation(null);
        }
      } catch (error) {
        logger.error("❌ Error checking existing conversation:", error);
        setExistingConversation(null);
      } finally {
        setCheckingConversation(false);
      }
    };

    checkExistingConversation();
  }, [selectedStudent, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (summary.length < 30) {
      enqueueSnackbar("Summary must be at least 30 characters long!", {
        variant: "warning",
      });
      return;
    }

    setIsLoading(true);

    try {
      logger.info("📤 Submitting offline conversation...", {
        mentorId: user._id,
        menteeId: selectedStudent,
        title: title || "Offline Conversation",
        topic: topic || "Offline Mentorship",
        conversationText: summary,
        moocChecked: mooc,
        projectChecked: miniProject,
      });

      const response = await api.post("/conversations/mentor-mentee", {
        mentorId: user._id,
        menteeId: selectedStudent,
        title: title || "Offline Conversation",
        topic: topic || "Offline Mentorship",
        conversationText: summary,
        moocChecked: mooc,
        projectChecked: miniProject,
      });

      logger.info("✅ API Response received:", response.data);

      if (response.status === 201) {
        const { aiSummary, conversation } = response.data.data;

        logger.info("✅ Conversation saved successfully:", {
          conversationId: conversation._id,
          descriptionLength: conversation.description?.length,
          aiSummaryLength: aiSummary?.length,
        });

        enqueueSnackbar(
          "Conversation saved successfully! AI summary has been generated.",
          {
            variant: "success",
            autoHideDuration: 5000,
          }
        );

        logger.info("📝 AI Generated Summary:", aiSummary);

        // Reset form
        setSelectedStudent("");
        setMooc(false);
        setMiniProject(false);
        setSummary("");
        setTitle("");
        setTopic("");
      }
    } catch (error) {
      logger.error("❌ Error saving offline conversation:", error);
      logger.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      enqueueSnackbar(
        error.response?.data?.message || "Error saving offline conversation!",
        { variant: "error" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setExistingConversation(null);
    setSummary("");
    setTitle("");
    setTopic("");
    setMooc(false);
    setMiniProject(false);
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <Typography color="error">User not authenticated.</Typography>
        </Paper>
      </Container>
    );
  }

  if (loadingMentees) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading mentees...</Typography>
      </Container>
    );
  }

  if (error && !preselectedMenteeId) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, pb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
              return;
            }

            navigate("/", { replace: true });
          }}
          sx={{ fontWeight: 700 }}
        >
          Back
        </Button>
      </Box>
      <Grid container spacing={3}>
        {/* Left Side - Form */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 3,
              border: `1px solid ${alpha(accentColor, 0.24)}`,
              bgcolor: isLight
                ? alpha(theme.palette.background.paper, 0.96)
                : alpha(theme.palette.background.paper, 0.86),
              boxShadow: isLight
                ? "0 10px 28px rgba(15, 23, 42, 0.08)"
                : "0 12px 30px rgba(2, 6, 23, 0.5)",
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              Mentor-Mentee Conversation (Offline)
            </Typography>

            <form onSubmit={handleSubmit}>
              {/* Select Student */}
              <TextField
                select
                label="Select Mentee"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                fullWidth
                required
                sx={{ mb: 3 }}
                disabled={normalizedMentees.length === 0 && !preselectedMenteeId}
                helperText={
                  normalizedMentees.length === 0 && !preselectedMenteeId
                    ? "No mentees assigned to you"
                    : preselectedMenteeId
                      ? "Mentee preselected from dashboard"
                      : ""
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selectedValue) => {
                    if (!selectedValue) {
                      return "Select Mentee";
                    }

                    const selectedMentee = mentees.find(
                      (mentee) => mentee._id === selectedValue
                    );

                    if (!selectedMentee && selectedValue) {
                      return `Mentee ID: ${selectedValue}`;
                    }

                    if (!selectedMentee) {
                      return "Select Mentee";
                    }

                    const selectedAvatarSrc = getAvatarSrc(selectedMentee);
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Avatar
                          src={selectedAvatarSrc || undefined}
                          alt={selectedMentee.name}
                          sx={{ width: 28, height: 28 }}
                        >
                          {!selectedAvatarSrc
                            ? getAvatarFallbackText(selectedMentee.name)
                            : null}
                        </Avatar>
                        <Box sx={{ lineHeight: 1.15 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedMentee.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedMentee?.profile?.usn
                              ? `USN: ${selectedMentee.profile.usn}`
                              : selectedMentee?.profile?.sem
                                ? `Semester ${selectedMentee.profile.sem}`
                                : "Mentee"}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  },
                }}
              >
                {normalizedMentees.map((mentee) => {
                  const menteeAvatarSrc = getAvatarSrc(mentee);
                  return (
                    <MenuItem key={mentee._id} value={mentee._id}>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                        }}
                      >
                        <Avatar
                          src={menteeAvatarSrc || undefined}
                          alt={mentee.name}
                          sx={{ width: 30, height: 30 }}
                        >
                          {!menteeAvatarSrc
                            ? getAvatarFallbackText(mentee.name)
                            : null}
                        </Avatar>
                        <Box sx={{ lineHeight: 1.2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {mentee.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {mentee?.profile?.usn
                              ? `${mentee.profile.usn} • Sem ${mentee?.profile?.sem || "-"}`
                              : `Semester ${mentee?.profile?.sem || "-"}`}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>

            {/* Existing Conversation Alert */}
            {checkingConversation && (
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <CircularProgress size={20} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Checking for existing conversation...
                </Typography>
              </Box>
            )}

            {existingConversation && !checkingConversation && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  bgcolor: alpha(theme.palette.success.main, isLight ? 0.16 : 0.22),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.48)}`,
                  "& .MuiAlert-icon": {
                    color: "success.main",
                  },
                }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleCreateNew}
                    sx={{ fontWeight: "bold" }}
                  >
                    Create New
                  </Button>
                }
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main", mb: 1 }}>
                  Mentoring Already Done for This Person
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                  <strong>Date:</strong> {new Date(existingConversation.date).toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </Typography>
                {existingConversation.title && (
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                    <strong>Title:</strong> {existingConversation.title}
                  </Typography>
                )}
                
              </Alert>
            )}

              {/* Title (Optional) */}
              <TextField
                label="Conversation Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
              />

              {/* Topic (Optional) */}
              <TextField
                label="Topic (Optional)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
              />

              {/* Checkboxes */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={mooc}
                      onChange={(e) => setMooc(e.target.checked)}
                    />
                  }
                  label="MOOC Completed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={miniProject}
                      onChange={(e) => setMiniProject(e.target.checked)}
                    />
                  }
                  label="Mini Project Completed"
                />
              </Box>

              {/* Summary */}
              <TextField
                label="Conversation Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                fullWidth
                required
                multiline
                minRows={6}
                helperText="Minimum 30 characters - AI will generate a detailed summary"
                sx={{ mb: 3 }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={!selectedStudent || isLoading || mentees.length === 0}
                startIcon={isLoading && <CircularProgress size={20} />}
              >
                {isLoading ? "Generating AI Summary..." : "Save Offline Conversation"}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Right Side - Guidance Box */}
        <Grid item xs={12} md={5}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              bgcolor: isLight
                ? alpha(theme.palette.background.paper, 0.97)
                : alpha(theme.palette.background.paper, 0.9),
              border: `1px solid ${alpha(accentColor, 0.4)}`,
              position: "sticky",
              top: 100,
              boxShadow: isLight
                ? "0 10px 28px rgba(15, 23, 42, 0.08)"
                : "0 12px 30px rgba(2, 6, 23, 0.5)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <InfoOutlined sx={{ mr: 1, fontSize: 28, color: accentColor }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: accentColor }}>
                Tips for Better AI Summary
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Alert
              severity="info"
              sx={{
                mb: 2,
                bgcolor: alpha(accentColor, isLight ? 0.12 : 0.2),
                border: `1px solid ${alpha(accentColor, 0.35)}`,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                To get a comprehensive AI-generated summary, include these details in your conversation text:
              </Typography>
            </Alert>

            <List dense sx={{ py: 0 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Student's Concerns/Problems</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "text.secondary" }}>What challenges or issues did the student raise?</Typography>}
                  sx={{ my: 0 }}
                />
              </ListItem>

              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Counseling Approach Used</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "text.secondary" }}>What techniques or methods did you use? (e.g., active listening, goal-setting, problem-solving)</Typography>}
                  sx={{ my: 0 }}
                />
              </ListItem>

              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Guidance & Recommendations</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "text.secondary" }}>What advice, resources, or action steps did you provide?</Typography>}
                  sx={{ my: 0 }}
                />
              </ListItem>

              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Student's Response</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "text.secondary" }}>How did the student react? Were they receptive?</Typography>}
                  sx={{ my: 0 }}
                />
              </ListItem>

              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Achievements Discussed</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "text.secondary" }}>Academic performance, MOOC completions, projects, extracurriculars</Typography>}
                  sx={{ my: 0 }}
                />
              </ListItem>

              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Resolution Status</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "text.secondary" }}>Was the problem resolved? Are follow-ups needed?</Typography>}
                  sx={{ my: 0 }}
                />
              </ListItem>

              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutline color="success" sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Career/Academic Goals</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: "text.secondary" }}>Future plans, internships, placements, higher studies</Typography>}
                  sx={{ my: 0 }}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                bgcolor: alpha(theme.palette.warning.main, isLight ? 0.12 : 0.2),
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.45)}`,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                <strong>Pro Tip:</strong> Write the conversation in a dialogue format or structured narrative to help the AI better understand the context and generate an accurate summary.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MentorMenteeConversation;
