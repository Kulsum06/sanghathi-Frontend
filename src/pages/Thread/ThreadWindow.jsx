import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Divider,
  Stack,
  Typography,
  CircularProgress,
  Container,
  Card,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import { useSnackbar } from "notistack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { AuthContext } from "../../context/AuthContext";
import Page from "../../components/Page";
import api from "../../utils/axios";
import { MessageList, MessageInput } from "./Message/Message";
import useSocket from "../../hooks/useSocket";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";

import logger from "../../utils/logger.js";
const ThreadHeader = ({ thread, onCloseThread, currentUser, onBack }) => {
  const statusColors = {
    open: "#4caf50",
    "In Progress": "#ff9800",
    closed: "#f44336",
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getDisplayParticipants = () => {
    const participants = Array.isArray(thread?.participants)
      ? thread.participants
      : [];

    if (currentUser?.roleName !== "faculty") {
      return participants;
    }

    const studentParticipants = participants.filter(
      (participant) => participant?.roleName === "student"
    );

    if (studentParticipants.length > 0) {
      return studentParticipants;
    }

    return participants.filter(
      (participant) => participant?._id !== currentUser?._id
    );
  };

  return (
    <Box>
      <Button
        variant="text"
        onClick={onBack}
        startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />}
        sx={{
          mb: 1,
          px: 0,
          minWidth: "fit-content",
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        Back to Threads
      </Button>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 1,
            fontSize: { xs: "1.35rem", sm: "2rem" },
            lineHeight: 1.2,
          }}
        >
          {thread.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mt: 1, flexWrap: "wrap", rowGap: 0.8 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              color: "text.secondary",
              mr: 1,
            }}
          >
            Topic:
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              mr: 2,
            }}
          >
            #{thread.topic}
          </Typography>
          <Typography
            variant="subtitle2"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: statusColors[thread.status],
              borderRadius: "12px",
              padding: "0 8px",
              color: "white",
              fontWeight: "bold",
              mr: 2,
            }}
          >
            Status: {thread.status}
          </Typography>
        </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 0.8 }}>
          {getDisplayParticipants().map((participant, idx) => {
            const participantAvatarSrc = getAvatarSrc(participant);

            return (
            <Tooltip
              key={participant._id}
              title={participant.name}
              placement="top"
            >
              <Avatar
                src={participantAvatarSrc || undefined}
                sx={{
                  ml: idx === 0 ? 0 : { xs: -0.75, sm: -1 },
                  zIndex: 100 - idx,
                  width: 36,
                  height: 36,
                  position: "relative",
                }}
                alt={participant.name}
              >
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 8,
                    transform: "translate(50%, 50%)",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    border: `1px solid ${"success.main"}`,
                    backgroundColor: "success.main",
                  }}
                />
                {!participantAvatarSrc
                  ? getAvatarFallbackText(participant.name)
                  : null}
              </Avatar>
            </Tooltip>
            );
          })}

          {/* "Mark as closed" option remains unchanged */}
          {thread.status === "open" &&
            thread.participants[0]._id === currentUser._id && (
              <Box sx={{ ml: { xs: 0.75, sm: 2 } }}>
                <IconButton onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      onCloseThread();
                    }}
                  >
                    Mark as closed
                  </MenuItem>
                </Menu>
              </Box>
            )}
        </Box>
      </Box>
    </Box>
  );
};

export default function ThreadWindow() {
  const [isLoading, setIsLoading] = useState(false);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { sendMessage, joinRoom, leaveRoom } = useSocket(
    threadId,
    user._id,
    setMessages
  );
  const { enqueueSnackbar } = useSnackbar();

  // Join the socket room when the component mounts and threadId is available
  useEffect(() => {
    if (threadId) {
      logger.info(`Joining thread room: ${threadId}`);
      joinRoom(threadId);
    }

    return () => {
      if (threadId) {
        logger.info(`Leaving thread room: ${threadId}`);
        leaveRoom(threadId);
      }
    };
  }, [threadId, joinRoom, leaveRoom]);

  const fetchThread = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/threads/${threadId}`, {
        params: {
          messagePage: 1,
          messageLimit: 150,
        },
      });
      if (response.status === 200) {
        const { data } = response.data;
        setThread(data.thread);
        setMessages(data.thread.messages);
        logger.info("THREAD ", data.thread);
      }
    } catch (error) {
      logger.error(error);
      enqueueSnackbar("Error loading thread", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const handleSendMessage = async (newMessage) => {
    // Prevent sending message if thread is closed
    if (thread.status === "closed") return;

    const message = {
      senderId: user._id,
      body: newMessage,
    };
    try {
      const response = await api.post(`/threads/${threadId}/messages`, message);
      const { data } = response.data;
      setMessages((prev) => [...prev, data.message]);
      sendMessage(data.message, threadId);
    } catch (err) {
      logger.info(err);
    }
  };

  const handleThreadClose = async () => {
    try {
      const response = await api.patch(`/threads/${thread._id}/close`);
      if (response.status === 200) {
        enqueueSnackbar("Successfully marked thread closed!", {
          variant: "success",
        });
        // Update thread status locally
        setThread((prevThread) => ({ ...prevThread, status: "closed" }));
      } else {
        enqueueSnackbar("Thread close request failed!", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      logger.error("ERROR OCCURRED 💥 ", error);
    }
  };

  const handleBackToThreads = () => {
    navigate("/threads");
  };

  return (
    <Page title="Thread">
      <Container
        maxWidth="xl"
        sx={{ px: { xs: 1.5, sm: 3 }, overflowX: "hidden", overflowY: "auto" }}
      >
        <Card
          sx={{
            height: { xs: "calc(100vh - 140px)", sm: "80vh" },
            minHeight: { xs: 520, sm: 620 },
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Stack sx={{ flexGrow: 1, minWidth: "1px", minHeight: 0 }}>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              {thread && (
                <ThreadHeader
                  thread={thread}
                  onCloseThread={handleThreadClose}
                  currentUser={user}
                  onBack={handleBackToThreads}
                />
              )}
            </Box>
            <Divider />
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                overflow: "hidden",
                minWidth: "0",
                minHeight: 0,
              }}
            >
              {isLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <Stack sx={{ flexGrow: 1, minHeight: 0 }}>
                  {thread && (
                    <>
                      <MessageList conversation={thread} messages={messages} />
                      <Divider />
                      {thread.status === "closed" ? (
                        <Box
                          sx={{
                            p: 2,
                            textAlign: "center",
                            color: "error.main",
                            fontWeight: "bold",
                          }}
                        >
                          This thread is closed
                        </Box>
                      ) : (
                        <MessageInput
                          disabled={!thread}
                          onSend={handleSendMessage}
                        />
                      )}
                    </>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </Card>
      </Container>
    </Page>
  );
}
