import { useContext, useEffect, useState } from "react";
import {
  Box,
  Divider,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ChatMessageList from "./ChatMessageList";
import ChatMessageInput from "./ChatMessageInput";
import ChatContext from "../../context/ChatContext";
import PhoneIcon from "@mui/icons-material/Phone";
import VideocamIcon from "@mui/icons-material/Videocam";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";
import { AuthContext } from "../../context/AuthContext";
import useResponsive from "../../hooks/useResponsive";

export default function ChatWindow() {
  const { currentChat, messages, sendMessage } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useResponsive("down", "sm");
  const sender =
    currentChat?.participants?.find(
      (participant) => participant._id !== user?._id
    ) || currentChat?.participants?.[0];
  const senderAvatarSrc = getAvatarSrc(sender);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!currentChat) {
      setIsLoading(false);
      return;
    }

    if (messages.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [messages, currentChat]);

  return (
    <Stack sx={{ flexGrow: 1, minWidth: "1px", minHeight: 0 }}>
      {!currentChat ? (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          Select a conversation to start chatting.
        </Box>
      ) : (
        <>
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 0 },
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{ ml: { xs: 0, sm: 2 }, display: "flex", flexDirection: "row" }}
            >
              <Avatar
                alt={sender?.name}
                src={senderAvatarSrc || undefined}
                sx={{
                  bgcolor: "primary.main",
                  mr: 2,
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  ...(sender?.isOnline && {
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      right: 0,
                      bottom: 0,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                    },
                  }),
                }}
              >
                {!senderAvatarSrc ? getAvatarFallbackText(sender?.name) : null}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {sender?.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mt: 0.5,
                    opacity: 0.6,
                    fontWeight: 300,
                  }}
                >
                  {sender?.isOnline ? "Online" : "Offline"}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                alignSelf: { xs: "flex-end", sm: "center" },
              }}
            >
              {!isMobile && <PhoneIcon sx={{ cursor: "pointer" }} />}
              {!isMobile && <VideocamIcon sx={{ cursor: "pointer" }} />}
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>Test 1</MenuItem>
                <MenuItem onClick={handleMenuClose}>Test 2</MenuItem>
              </Menu>
            </Box>
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
                <ChatMessageList
                  conversation={currentChat}
                  messages={messages}
                />
                <Divider />
                <ChatMessageInput onSend={sendMessage} />
              </Stack>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}
