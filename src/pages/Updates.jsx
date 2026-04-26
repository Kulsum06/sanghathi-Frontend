import React, { useContext } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import MobileFriendlyRoundedIcon from "@mui/icons-material/MobileFriendlyRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import Page from "../components/Page";
import { AuthContext } from "../context/AuthContext";

const releaseHighlights = [
  {
    title: "Unified Dashboards",
    description:
      "Student, Faculty, Admin, HOD, and Director dashboards now feel more consistent and easier to navigate.",
    icon: GroupsRoundedIcon,
  },
  {
    title: "Faster Data Flows",
    description:
      "Pagination, filtering, and backend query optimizations improve loading speed and reduce heavy fetches.",
    icon: SpeedRoundedIcon,
  },
  {
    title: "Better Mobile Experience",
    description:
      "Key screens like login, forms, profile pages, and scorecards are now cleaner and more responsive on phones.",
    icon: MobileFriendlyRoundedIcon,
  },
  {
    title: "Stronger Security",
    description:
      "Route protection, role checks, request validation, and test coverage were strengthened across the app.",
    icon: SecurityRoundedIcon,
  },
  {
    title: "Smarter Mentoring UX",
    description:
      "Mentor-mentee visibility, avatar support, and conversation/thread interactions were improved for clarity.",
    icon: ManageSearchRoundedIcon,
  },
  {
    title: "Admin Upload Control",
    description:
      "Upload history, source tracking, and restore workflows make data operations safer and easier.",
    icon: TaskAltRoundedIcon,
  },
];

const detailedSections = [
  {
    title: "Role Dashboards and Navigation",
    items: [
      "Added shared dashboard hero card patterns for role dashboards.",
      "Improved profile identity display and avatar fallback behavior.",
      "Normalized role-based navigation for HOD and Director paths.",
      "Improved back-navigation behavior in mentoring-related flows.",
    ],
  },
  {
    title: "Mentoring and Communication",
    items: [
      "Enhanced mentor and mentee list experience with better profile context.",
      "Improved mentor details reliability with safer fallback handling.",
      "Refined thread and conversation UX for readability and participant context.",
      "Expanded profile photo enrichment in conversation and thread endpoints.",
    ],
  },
  {
    title: "Admin Data and Operational Workflows",
    items: [
      "Added admin upload history with filtering and restore workflow support.",
      "Added source attribution for local script ingestion in upload history.",
      "Added local IAT ingest and rollback scripts for safer correction cycles.",
      "Improved admin data forms and data-entry UX on desktop and mobile.",
    ],
  },
  {
    title: "Performance and Reliability",
    items: [
      "Added pagination and filtering support to multiple backend endpoints.",
      "Improved backend response structures for data-heavy views.",
      "Added index and query-level improvements to reduce overfetching.",
      "Expanded loading-state consistency in frontend API-heavy pages.",
    ],
  },
  {
    title: "Security, Authentication, and Recovery",
    items: [
      "Expanded protected-route and role-restricted route hardening.",
      "Added integration tests for protected and role-restricted access.",
      "Improved forgot/reset password workflow and email template quality.",
      "Enhanced request validation and middleware safety coverage.",
    ],
  },
  {
    title: "Frontend Product Improvements",
    items: [
      "Introduced About Developers and dedicated developer profile pages.",
      "Improved footer information architecture and role-aware links.",
      "Added SEO upgrades including metadata, robots.txt, and sitemap support.",
      "Added semester-specific technical work tab support in career review flows.",
    ],
  },
];

const dashboardPathByRole = {
  student: "/",
  faculty: "/faculty/dashboard",
  admin: "/admin/dashboard",
  hod: "/hod/dashboard",
  director: "/director/dashboard",
};

const Updates = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isLight = theme.palette.mode === "light";

  const dashboardPath = dashboardPathByRole[user?.roleName] || "/";

  const impactStory = {
    title: "The Fix That Mattered Most",
    subtitle: "Why 29,024 new lines came down to one broken feature",
    paragraphs: [
      "Frontend → 19,249 lines added",
      "Backend → 9,775 lines added",
      "But the one fix that actually mattered to every student?",
      "They couldn't reset their password."
    ],
  };

  return (
    <Page
      title="What's New"
      description="Sanghathi 2.0 release notes with highlights and detailed updates for all users."
      canonicalPath="/updates"
      keywords="Sanghathi 2.0, Sanghathi updates, release notes, what's new"
    >
      <Box
        sx={{
          pt: 3,
          pb: 6,
          minHeight: "100vh",
          background: isLight
            ? `radial-gradient(circle at 10% 8%, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 34%), linear-gradient(180deg, ${alpha(
                theme.palette.background.default,
                1
              )} 0%, ${alpha(theme.palette.primary.lighter, 0.2)} 100%)`
            : `radial-gradient(circle at 10% 8%, ${alpha(theme.palette.info.light, 0.2)} 0%, transparent 30%), linear-gradient(180deg, ${alpha(
                theme.palette.background.default,
                1
              )} 0%, ${alpha("#0D1117", 0.96)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2.2}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.2, md: 3 },
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.88),
              }}
            >
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <RocketLaunchRoundedIcon
                    color={isLight ? "primary" : "info"}
                    fontSize="medium"
                  />
                  <Chip
                    label="Version 2.0"
                    size="small"
                    color={isLight ? "primary" : "info"}
                    variant="filled"
                  />
                </Stack>

                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  Sanghathi 2.0 is live
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 900 }}>
                  This release focuses on smoother role-based experience, stronger
                  mentoring flows, responsive UI improvements, safer admin operations,
                  and better performance across the platform.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ pt: 0.4 }}>
                  <Button
                    variant="contained"
                    color={isLight ? "primary" : "info"}
                    onClick={() => navigate(dashboardPath)}
                    sx={{ width: { xs: "100%", sm: "fit-content" } }}
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => window.scrollTo({ top: 620, behavior: "smooth" })}
                    sx={{ width: { xs: "100%", sm: "fit-content" } }}
                  >
                    Jump to Full Details
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 3,
                border: `2px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                backgroundColor: alpha(theme.palette.warning.lighter || theme.palette.warning.light, 0.08),
              }}
            >
              <Stack spacing={2}>
                <Stack spacing={0.8}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      background: isLight
                        ? `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.error.light} 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {impactStory.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {impactStory.subtitle}
                  </Typography>
                </Stack>

                <Stack spacing={1.4}>
                  {impactStory.paragraphs.map((paragraph, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{
                        lineHeight: 1.65,
                        fontWeight: paragraph.includes("They couldn't") || paragraph.includes("password") ? 700 : 500,
                        color:
                          paragraph.includes("They couldn't") || paragraph.includes("Locked out")
                            ? theme.palette.mode === "light"
                              ? theme.palette.error.main
                              : theme.palette.error.light
                            : "text.secondary",
                      }}
                    >
                      {paragraph}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Key highlights for all users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A quick overview of the major improvements rolled out in Sanghathi 2.0.
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {releaseHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <Grid item xs={12} sm={6} md={4} key={item.title}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                        backgroundColor: alpha(theme.palette.background.paper, 0.86),
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1.2}>
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              display: "grid",
                              placeItems: "center",
                              backgroundColor: alpha(theme.palette.primary.main, 0.12),
                              color: isLight ? "primary.main" : "info.light",
                            }}
                          >
                            <Icon fontSize="small" />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Stack spacing={1.2} sx={{ pt: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Full detailed updates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete release notes for product, platform, and operational improvements.
              </Typography>
            </Stack>

            <Box>
              {detailedSections.map((section) => (
                <Accordion
                  key={section.title}
                  disableGutters
                  elevation={0}
                  sx={{
                    mb: 1.2,
                    borderRadius: "14px !important",
                    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.86),
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Typography sx={{ fontWeight: 800 }}>{section.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {section.items.map((item) => (
                        <Typography key={item} variant="body2" color="text.secondary">
                          - {item}
                        </Typography>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Stack>
        </Container>
      </Box>
    </Page>
  );
};

export default Updates;
