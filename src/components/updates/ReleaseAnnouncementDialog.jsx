import React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

const ReleaseAnnouncementDialog = ({ open, onDismiss, onCheckUpdates }) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      fullWidth
      maxWidth="xs"
      aria-labelledby="Sanghathi-release-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: "none",
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              backgroundColor: alpha(theme.palette.primary.main, 0.14),
              color: theme.palette.mode === "light" ? "primary.main" : "info.light",
            }}
          >
            <CampaignRoundedIcon fontSize="large" />
          </Box>

          <Stack spacing={1.2} alignItems="center">
            <Chip
              label="New release"
              size="small"
              color={theme.palette.mode === "light" ? "primary" : "info"}
            />
            <Typography id="Sanghathi-release-dialog-title" variant="h5" sx={{ fontWeight: 800 }}>
              Sanghathi 2.0 is live
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
              New dashboard polish, stronger mentoring workflows, better mobile UX,
              and smoother admin data operations are now available.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: "100%" }}>
            <Button
              variant="contained"
              fullWidth
              onClick={onCheckUpdates}
              color={theme.palette.mode === "light" ? "primary" : "info"}
            >
              Check What&apos;s New
            </Button>
            <Button variant="outlined" fullWidth onClick={onDismiss}>
              Dismiss
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ReleaseAnnouncementDialog;
