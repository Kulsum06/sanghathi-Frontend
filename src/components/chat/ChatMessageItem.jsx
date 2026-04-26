// import React from "react";
// import { Box, Avatar, Typography } from "@mui/material";
// import { styled } from "@mui/system";
// import { formatDistanceToNowStrict } from "date-fns";

// const RootStyle = styled("div")(({ theme }) => ({
//   marginBottom: theme.spacing(3),
// }));

// const ContentStyle = styled("div")(({ theme }) => ({
//   maxWidth: 380,
//   padding: theme.spacing(1.5),
//   borderRadius: theme.shape.borderRadius,
//   backgroundColor: theme.palette.grey[500_12],
//   color: theme.palette.text.primary,
// }));

// export default function ChatMessageItem({ message, conversation }) {
//   const currentUserId = "6440840795719c38cc99d814";
//   const sender = conversation.participants.find(
//     (participant) => participant._id === message.senderId
//   );

//   const isMe = message.senderId === currentUserId;
//   const justifyContent = isMe ? "flex-end" : "flex-start";

//   const firstName = sender?.name && sender.name.split(" ")[0];

//   return (
//     <RootStyle>
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent,
//         }}
//       >
//         {!isMe && (
//           <Avatar
//             alt={sender?.name || " "}
//             src={sender?.avatar || " "}
//             sx={{ width: 32, height: 32, mr: 2 }}
//           />
//         )}

//         <div>
//           <ContentStyle
//             sx={{
//               ...(isMe && { color: "grey.800", bgcolor: "primary.lighter" }),
//             }}
//           >
//             <Typography variant="body2">{message.body}</Typography>
//           </ContentStyle>
//           <Typography
//             variant="caption"
//             sx={{
//               mt: 0.5,
//               textAlign: isMe ? "right" : "left",
//             }}
//           >
//             {!isMe && `${firstName}, `}
//             {formatDistanceToNowStrict(new Date(message.createdAt), {
//               addSuffix: true,
//             })}
//           </Typography>
//         </div>
//       </Box>
//     </RootStyle>
//   );
// }


import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { formatDistanceToNowStrict } from "date-fns";
import { useContext } from "react";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";
import { AuthContext } from "../../context/AuthContext";

const RootStyle = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ContentStyle = styled("div")(({ theme }) => ({
  display: "inline-block",
  maxWidth: "min(75vw, 420px)",
  padding: theme.spacing(1.5),
  borderRadius: 14,
  backgroundColor: theme.palette.grey[500_12],
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
}));

export default function ChatMessageItem({ message, conversation }) {
  const { user } = useContext(AuthContext);

  const participants = Array.isArray(conversation?.participants)
    ? conversation.participants
    : [];

  const messageSenderId =
    message?.senderId?._id ||
    message?.sender?._id ||
    message?.senderId ||
    message?.sender;

  const normalizedSenderId = String(messageSenderId || "");
  const normalizedCurrentUserId = String(user?._id || "");

  const sender =
    participants.find(
      (participant) => String(participant?._id || "") === normalizedSenderId
    ) ||
    message?.sender ||
    null;

  const isMe = normalizedSenderId === normalizedCurrentUserId;
  const justifyContent = isMe ? "flex-end" : "flex-start";
  const firstName = sender?.name?.split(" ")[0] || "Anonymous";
  const senderAvatarSrc = getAvatarSrc(sender);

  return (
    <RootStyle>
      <Box sx={{ display: "flex", justifyContent, alignItems: "flex-end", gap: 1 }}>
        {!isMe && sender && (
          <Avatar
            alt={sender.name || "Unknown"}
            src={senderAvatarSrc || undefined}
            sx={{ width: 32, height: 32 }}
          >
            {!senderAvatarSrc ? getAvatarFallbackText(sender.name) : null}
          </Avatar>
        )}

        <div>
          <ContentStyle
            sx={
              isMe
                ? {
                    color: "primary.contrastText",
                    bgcolor: "primary.main",
                    borderColor: "primary.main",
                    borderTopRightRadius: 6,
                  }
                : {
                    borderTopLeftRadius: 6,
                  }
            }
          >
            <Typography variant="body2">{message.body}</Typography>
          </ContentStyle>
          <Typography
            variant="caption"
            sx={{ mt: 0.5, textAlign: isMe ? "right" : "left" }}
          >
            {!isMe && `${firstName}, `}
            {formatDistanceToNowStrict(new Date(message.createdAt || Date.now()), {
              addSuffix: true,
            })}
          </Typography>
        </div>
      </Box>
    </RootStyle>
  );
}
