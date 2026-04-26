import React from "react";
import { Box, Container, Paper, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Page from "../components/Page";

const DeveloperProfile = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Page
      title="Profile Update"
      description="Profile to be updated soon."
      canonicalPath="/about-developers"
      noIndex
    >
      <Box
        sx={{
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 6 },
          background: isLight
            ? `linear-gradient(180deg, ${alpha(theme.palette.grey[100], 0.92)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.98)} 0%, ${alpha("#0D1117", 0.98)} 100%)`,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              textAlign: "center",
              border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.88),
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Profile to be updated soon
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Page>
  );
};

export default DeveloperProfile;
