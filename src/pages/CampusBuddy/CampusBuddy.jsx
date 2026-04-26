import React, { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AssistantIcon from "@mui/icons-material/Assistant";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import { alpha } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import logger from "../../utils/logger.js";

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    body: "Hey, I'm your Campus Buddy. How can I help you today?",
    sender: "ai",
  },
];

const quickOptions = [
  "Department Location",
  "IAT dates",
  "VTU Examinations",
  "Department HOD",
  "Other question",
];

const quickOptionPrompts = {
  "Department Location": "For CMRIT, where is the department located on campus?",
  "IAT dates": "What is the latest schedule information for the IAT exams?",
  "VTU Examinations": "What is the latest information available for VTU examinations?",
  "Department HOD": "Who is the HOD of this department? Include name and designation if available.",
  "Other question": "Please ask your question and I will try to help you.",
};

const CampusBuddyHeader = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const colorMode = isLight ? "primary" : "info";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: { xs: 2, sm: 3 },
        pt: { xs: 1.5, sm: 2 },
        pb: 1.5,
      }}
    >
      <Avatar
        sx={{
          bgcolor: theme.palette[colorMode].main,
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
        }}
      >
        <AssistantIcon />
      </Avatar>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
          Campus Buddy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your Personal AI Assistant
        </Typography>
      </Box>
    </Box>
  );
};

const CampusBuddy = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isLight = theme.palette.mode === "light";
  const accentColor = isLight ? theme.palette.primary.main : theme.palette.info.main;

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const surfaceStyles = useMemo(
    () => ({
      card: {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isLight ? "0 12px 30px rgba(15, 23, 42, 0.06)" : "0 12px 30px rgba(0, 0, 0, 0.25)",
      },
      chatArea: {
        backgroundColor: isLight ? theme.palette.background.default : theme.palette.background.paper,
      },
      userBubble: {
        backgroundColor: accentColor,
        color: theme.palette.common.white,
      },
      botBubble: {
        backgroundColor: isLight ? theme.palette.grey[100] : theme.palette.grey[800],
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
      },
      input: {
        backgroundColor: theme.palette.background.paper,
      },
    }),
    [accentColor, isLight, theme.palette.background.default, theme.palette.background.paper, theme.palette.common.white, theme.palette.divider, theme.palette.grey, theme.palette.text.primary]
  );

  const sendMessage = async (text = messageInput) => {
    const query = text.trim();
    if (!query || isLoading) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      body: query,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageInput("");
    setIsLoading(true);

    try {
      const response = await api.post("campus-buddy/query", { query });
      const output = response?.data?.data?.output || "I couldn't fetch a response right now.";
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ai`,
          body: output,
          sender: "ai",
        },
      ]);
    } catch (error) {
      logger.error("Error communicating with Campus Buddy:", error);
      enqueueSnackbar("Error communicating with Campus Buddy. Please try again.", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleQuickOption = (option) => {
    const prompt = quickOptionPrompts[option] || option;
    setMessageInput(prompt);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
      <CampusBuddyHeader />

      <Container maxWidth="lg" sx={{ pb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 1.5,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.2, sm: 1.5 },
            borderRadius: 2,
            border: `1px solid ${alpha(accentColor, 0.35)}`,
            background: isLight
              ? `linear-gradient(120deg, ${alpha(accentColor, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`
              : `linear-gradient(120deg, ${alpha(accentColor, 0.16)} 0%, ${alpha(theme.palette.success.main, 0.12)} 100%)`,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                }}
              >
                <ConstructionRoundedIcon sx={{ fontSize: 18, color: accentColor }} />
                Campus Buddy is under active development
              </Typography>
              <Typography variant="caption" color="text.secondary">
                More features are being rolled out soon. Current build supports quick department, exam, and FAQ assistance.
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                icon={<RocketLaunchRoundedIcon />}
                label="Upcoming: smarter context"
                sx={{ borderColor: alpha(accentColor, 0.4) }}
                variant="outlined"
              />
              <Chip
                size="small"
                label="Feature preview"
                color={isLight ? "primary" : "info"}
                variant="filled"
              />
            </Stack>
          </Stack>
        </Paper>

        <Alert
          severity="info"
          sx={{
            mb: 1.5,
            borderRadius: 2,
            border: `1px solid ${alpha(accentColor, 0.3)}`,
            bgcolor: alpha(accentColor, isLight ? 0.08 : 0.16),
          }}
        >
          Responses may be refined as new data and features are integrated.
        </Alert>

        <Card
          sx={{
            ...surfaceStyles.card,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              ...surfaceStyles.chatArea,
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: "calc(100vh - 250px)", md: "72vh" },
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                px: { xs: 2, sm: 3 },
                py: { xs: 2, sm: 3 },
                overflowY: "auto",
              }}
            >
              <Stack spacing={1.6}>
                {messages.map((message) => {
                  const isUser = message.sender === "user";

                  return (
                    <Box
                      key={message.id}
                      sx={{
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                        gap: 1,
                      }}
                    >
                      {!isUser && (
                        <Avatar sx={{ bgcolor: accentColor, width: 34, height: 34 }}>
                          <AssistantIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      )}
                      <Paper
                        elevation={0}
                        sx={{
                          ...(isUser ? surfaceStyles.userBubble : surfaceStyles.botBubble),
                          px: 2,
                          py: 1.5,
                          borderRadius: 3,
                          maxWidth: { xs: "85%", sm: "70%" },
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {message.body}
                        </Typography>
                      </Paper>
                      {isUser && (
                        <Avatar sx={{ bgcolor: accentColor, width: 34, height: 34 }}>
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      )}
                    </Box>
                  );
                })}

                {isLoading && (
                  <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 1 }}>
                    <Avatar sx={{ bgcolor: accentColor, width: 34, height: 34 }}>
                      <AssistantIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Paper
                      elevation={0}
                      sx={{
                        ...surfaceStyles.botBubble,
                        px: 2,
                        py: 1.5,
                        borderRadius: 3,
                      }}
                    >
                      <Typography variant="body2">Thinking...</Typography>
                    </Paper>
                  </Box>
                )}
              </Stack>
            </Box>

            <Box
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                ...surfaceStyles.input,
              }}
            >
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {quickOptions.map((option) => (
                    <Button
                      key={option}
                      variant="outlined"
                      size="small"
                      onClick={() => handleQuickOption(option)}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        borderColor: alpha(accentColor, 0.35),
                        color: isLight ? theme.palette.text.primary : theme.palette.info.light,
                        bgcolor: isLight ? theme.palette.common.white : "rgba(20, 34, 58, 0.28)",
                        '&:hover': {
                          borderColor: accentColor,
                          bgcolor: alpha(accentColor, isLight ? 0.08 : 0.18),
                        },
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <TextField
                    fullWidth
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    variant="outlined"
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={4}
                    placeholder={isLoading ? "Thinking..." : "Type your message..."}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => sendMessage()}
                    disabled={!messageInput.trim() || isLoading}
                    sx={{
                      minWidth: 48,
                      height: 40,
                      borderRadius: 2,
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default CampusBuddy;
