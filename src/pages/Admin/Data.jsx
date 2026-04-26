import { capitalCase } from "change-case";
import { useState } from "react";
// @mui
import {
  Alert,
  Container,
  Tab,
  Box,
  Tabs,
  Paper,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";


// routes


// hooks
import useTabs from "../../hooks/useTabs";


// components
import Page from "../../components/Page";
import Iconify from "../../components/Iconify";
// sections


import AddIat from "./AddIat";
import AddAttendance from "./AddAttendance";
import AddStudents from "./AddStudents";
import AddMarks from "../Scorecard/AddMarks";
import AddTylMarks from "./AddTylMarks";
import AddMoocDetails from "./AddMoocDetails";
import AddMiniProjectDetails from "./AddMiniProjectDetails";
import React from "react";

const TAB_GUIDES = {
  "Add Users": {
    title: "Add Users",
    columns: ["Role-wise template columns (required fields are highlighted)", "Use unique email and phone per user", "For students, ensure valid USN and semester"],
    notes: [
      "If users already exist with the same email, those rows will fail.",
      "Upload in smaller batches (50-200 rows) for easier error review.",
    ],
  },
  "Add Attendance": {
    title: "Add Attendance",
    columns: ["USN", "Sem", "Month", "WorkingDays", "AttendedDays", "AttendancePercentage"],
    notes: [
      "Month values should be valid month names/abbreviations.",
      "Each row should map to one student and one month in one semester.",
    ],
  },
  "Add IAT Marks": {
    title: "Add IAT Marks",
    columns: ["USN", "Sem", "SubjectCode", "SubjectName", "IAT1", "IAT2", "Avg"],
    notes: [
      "For wide-format files with repeated subject blocks, use the local script workflow (db:ingest-iat-local).",
      "Allowed marks include numeric values and AB/NE/ABSENT entries.",
    ],
  },
  "Add External Marks": {
    title: "Add External Marks",
    columns: ["USN", "Sem", "SubjectCode", "SubjectName", "ExternalMarks"],
    notes: [
      "One row should represent one subject for one student in one semester.",
      "Verify subject codes before upload to avoid accidental overwrites.",
    ],
  },
  "Add TYL Marks": {
    title: "Add TYL Marks",
    columns: ["USN", "Parameter", "Target", "Actual", "Semester"],
    notes: [
      "TYL entries are user-scoped; wrong USN will fail the row.",
      "Confirm semester mapping before uploading large files.",
    ],
  },
  "Add MOOC Details": {
    title: "Add MOOC Details",
    columns: ["USN", "CourseName", "Platform", "Duration", "Status"],
    notes: [
      "Keep platform names consistent for easier reporting.",
      "Use final status values only (Completed/Ongoing/etc.).",
    ],
  },
  "Add MiniProject Details": {
    title: "Add MiniProject Details",
    columns: ["USN", "ProjectTitle", "Domain", "GuideName", "Outcome/Status"],
    notes: [
      "Use the same USN format as student records.",
      "Avoid empty titles and ambiguous status values.",
    ],
  },
};


// ----------------------------------------------------------------------
export default function Data() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [editingUser, setEditingUser] = useState(null);
  const { currentTab, onChangeTab } = useTabs("Add Users");


  // Get the color based on the current theme mode
  const activeColor = isLight ? theme.palette.primary.main : theme.palette.info.main;
  const activeGuide = TAB_GUIDES[currentTab] || TAB_GUIDES["Add Users"];


  const ACCOUNT_TABS = [
    {
      value: "Add Users",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <AddStudents editingUser={editingUser} />,
    },
    {
      value: "Add Attendance",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <AddAttendance editingUser={editingUser} />,
    },
    {
      value: "Add IAT Marks",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: (
        <AddIat
          onEdit={(user) => {
            setEditingUser(user);
            onChangeTab(null, "Add IAT Marks");
          }}
        />
      ),
    },
    {
      value: "Add External Marks",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: (
        <AddMarks
          onEdit={(user) => {
            setEditingUser(user);
            onChangeTab(null, "Add External Marks");
          }}
        />
      ),
    },
    {
      value: "Add TYL Marks",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <AddTylMarks />,
    },
    {
      value: "Add MOOC Details",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <AddMoocDetails />,
    },
    {
      value: "Add MiniProject Details",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <AddMiniProjectDetails />,
    },
  ];

  return (
    <Page title="User: Account Settings">
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            borderRadius: 2,
            backgroundColor: isLight
              ? 'rgba(255, 255, 255, 0.8)'
              : alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
            boxShadow: isLight
              ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
              : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              mb: 3
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.6rem', sm: '2.125rem' },
                background: isLight
                  ? `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                  : `-webkit-linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Data Management
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: { xs: '100%', sm: 600 }, mx: 'auto' }}
            >
              Upload and manage bulk academic data with safer workflows and history tracking.
            </Typography>

            <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={RouterLink}
                to="/admin/upload-history"
                variant="outlined"
                size="small"
              >
                View Upload History & Restore
              </Button>

              <Button
                component={RouterLink}
                to="/admin/data"
                variant="contained"
                size="small"
              >
                Add Data
              </Button>
            </Box>
          </Box>


          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            value={currentTab}
            onChange={onChangeTab}
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: activeColor
              }
            }}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                minHeight: 48,
                px: { xs: 1.5, sm: 3 },
                mx: 0.5,
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  color: activeColor,
                  backgroundColor: alpha(activeColor, isLight ? 0.1 : 0.2),
                  fontWeight: 'bold',
                },
                '&:hover': {
                  backgroundColor: alpha(activeColor, isLight ? 0.05 : 0.1),
                  color: theme.palette.text.primary,
                },
              }
            }}
          >
            {ACCOUNT_TABS.map((tab) => (
              <Tab
                disableRipple
                key={tab.value}
                label={capitalCase(tab.value)}
                icon={tab.icon}
                value={tab.value}
              />
            ))}
          </Tabs>

          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              backgroundColor: isLight
                ? alpha(theme.palette.primary.main, 0.03)
                : alpha(theme.palette.info.main, 0.08),
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Bulk Upload Checklist
            </Typography>
            <Typography variant="body2" color="text.secondary">1. Download template from the selected tab first.</Typography>
            <Typography variant="body2" color="text.secondary">2. Keep header names exactly as expected.</Typography>
            <Typography variant="body2" color="text.secondary">3. Validate USN values against existing students before upload.</Typography>
            <Typography variant="body2" color="text.secondary">4. Upload in manageable batches to review errors faster.</Typography>
            <Typography variant="body2" color="text.secondary">5. Verify the result from Upload History after each run.</Typography>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {`Selected Tab Guide: ${activeGuide.title}`}
            </Typography>
            {activeGuide.columns.map((line) => (
              <Typography key={line} variant="body2" color="text.secondary">
                {`• ${line}`}
              </Typography>
            ))}

            <Box sx={{ mt: 1 }}>
              {activeGuide.notes.map((line) => (
                <Typography key={line} variant="body2" color="text.secondary">
                  {`• ${line}`}
                </Typography>
              ))}
            </Box>

            {currentTab === "Add IAT Marks" ? (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                For wide-format semester sheets, ingest from local file script and then verify from Upload History.
              </Alert>
            ) : null}
          </Paper>
        </Paper>


        {ACCOUNT_TABS.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
