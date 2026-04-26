import React from "react";
import { Avatar, Box, Paper, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getAvatarFallbackText, getAvatarSrc } from "../../utils/avatarResolver";

const DashboardHeroCard = ({
  user,
  dashboardTitle,
  description,
  fallbackName = "User",
}) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const displayName = user?.name?.trim() || fallbackName;
  const avatarSrc = getAvatarSrc(user);
  const possessiveName = displayName.endsWith("s")
    ? `${displayName}'`
    : `${displayName}'s`;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 4 },
        mb: 4,
        mt: 1,
        borderRadius: 3,
        backgroundColor: isLight
          ? "rgba(255, 255, 255, 0.8)"
          : alpha(theme.palette.background.paper, 0.6),
        backdropFilter: "blur(20px)",
        border: `1px solid ${alpha(
          isLight ? theme.palette.primary.main : theme.palette.info.main,
          isLight ? 0.1 : 0.2
        )}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mb: 1,
        }}
      >
        <Avatar
          src={avatarSrc || undefined}
          alt={displayName}
          sx={{
            width: { xs: 64, sm: 76 },
            height: { xs: 64, sm: 76 },
            mb: 2,
            bgcolor: isLight ? "primary.main" : "info.main",
            color: "common.white",
            fontSize: { xs: "1.4rem", sm: "1.7rem" },
            fontWeight: 700,
          }}
        >
          {!avatarSrc ? getAvatarFallbackText(displayName) : null}
        </Avatar>

        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            letterSpacing: "0.12em",
            fontWeight: 700,
          }}
        >
          Welcome, {displayName}
        </Typography>

        <Typography
          variant="h4"
          color={isLight ? "primary" : "info"}
          gutterBottom
          sx={{
            fontSize: { xs: "1.5rem", sm: "2.125rem" },
            fontWeight: "bold",
            position: "relative",
            display: "inline-block",
            "&:after": {
              content: '""',
              position: "absolute",
              width: "36%",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: isLight
                ? theme.palette.primary.main
                : theme.palette.info.main,
              bottom: "-8px",
              left: "32%",
            },
          }}
        >
          {possessiveName} {dashboardTitle}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: "680px", mt: 3 }}
        >
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DashboardHeroCard;