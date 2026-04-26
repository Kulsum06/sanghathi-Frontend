import { useState } from "react";
// @mui
import { Container, Tab, Box, Tabs, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
// components
import Page from "../../components/Page";
import StudentDetailsForm from "./StudentDetailsForm";

// ----------------------------------------------------------------------

export default function StudentProfileOnly() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  // Manage tabs state using useState (if useTabs is unavailable or not implemented correctly)
  const [currentTab, setCurrentTab] = useState("Student Details");

  // Update the selected tab when clicked
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Define the tabs
  const ACCOUNT_TABS = [
    {
      value: "Student Details",
      component: <StudentDetailsForm />,
    },
  ];

  return (
    <Page title="Student Profile">
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            backgroundColor: isLight
              ? 'rgba(255, 255, 255, 0.8)'
              : alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.35rem', sm: '1.5rem' },
              mb: 1.5,
            }}
          >
            Student Profile
          </Typography>
          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            value={currentTab}
            onChange={handleChangeTab}
            textColor="inherit"
            sx={{
              '& .MuiTab-root': {
                px: { xs: 1.5, sm: 3 },
                borderRadius: '8px 8px 0 0',
              },
            }}
          >
            {ACCOUNT_TABS.map((tab) => (
              <Tab
                disableRipple
                key={tab.value}
                label={tab.value}
                value={tab.value}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Render the selected tab's content */}
        {ACCOUNT_TABS.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
