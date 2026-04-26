// @mui
import { Container, Tab, Box, Tabs, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useTabs from "../../hooks/useTabs";
import Page from "../../components/Page";
import Iconify from "../../components/Iconify";
import PrevAcademic from "./PrevAcademic";

export default function Academic() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const { currentTab, onChangeTab } = useTabs("Academic Details");
  const ACCOUNT_TABS = [
    {
      value: "Academic Details",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <PrevAcademic />,
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
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1.5 }}>
            Academic Details
          </Typography>
          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            value={currentTab}
            onChange={onChangeTab}
          >
            {ACCOUNT_TABS.map((tab) => (
              <Tab
                disableRipple
                key={tab.value}
                label={tab.value}
                icon={tab.icon}
                value={tab.value}
              />
            ))}
          </Tabs>
        </Paper>

        {ACCOUNT_TABS.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  )
}
