import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Link as MuiLink,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import Page from "../components/Page";
import { developers, developerGroups } from "../data/developers";
import { buildCanonicalUrl, compactObject } from "../utils/seo";
import { buildBrandedMailto } from "../utils/mailto";

const orderedDeveloperIds = [
  ...developerGroups.founders,
  ...developerGroups.others,
];

const aboutDevelopersStructuredData = compactObject({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "About Developers | Sanghathi",
  description:
    "Meet the Sanghathi development team with dedicated profile pages and contribution highlights.",
  url: buildCanonicalUrl("/about-developers"),
  mainEntity: {
    "@type": "ItemList",
    itemListElement: orderedDeveloperIds.map((id, index) => {
      const developer = developers[id];

      if (!developer) {
        return null;
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        name: developer.name,
        url: buildCanonicalUrl(`/about-developers/${developer.id}`),
      };
    }),
  },
});

const DeveloperPreviewCard = ({ developer, featured = false }) => {
  const theme = useTheme();
  const hasImage = Boolean(developer.image);
  const socialButtonStyle = {
    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
    color: "text.secondary",
    backgroundColor: alpha(theme.palette.background.default, 0.65),
    "&:hover": {
      color: "primary.main",
      borderColor: alpha(theme.palette.primary.main, 0.5),
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(
          featured ? theme.palette.primary.main : theme.palette.divider,
          featured ? 0.35 : 0.85
        )}`,
        background: featured
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(
              theme.palette.background.paper,
              0.88
            )} 64%)`
          : alpha(theme.palette.background.paper, 0.84),
        height: "100%",
        overflow: "hidden",
      }}
    >
      <CardContent>
        <Stack
          direction={featured ? { xs: "column", md: "row" } : { xs: "column", sm: "row" }}
          spacing={2.2}
          alignItems={featured ? { xs: "flex-start", md: "center" } : "center"}
        >
          {hasImage ? (
            <Box
              component="img"
              src={developer.image}
              alt={developer.name}
              sx={{
                width: featured ? { xs: "100%", md: 220 } : 68,
                height: featured ? { xs: 240, md: 220 } : 68,
                objectFit: "cover",
                borderRadius: 2.2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                flexShrink: 0,
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.mode === "light" ? "primary.main" : "info.main",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {developer.name.charAt(0).toUpperCase()}
            </Avatar>
          )}

          <Stack spacing={1.1} sx={{ width: "100%" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
              <Chip
                label={featured ? "Featured" : "Contributor"}
                size="small"
                color={featured ? "primary" : "default"}
                variant={featured ? "filled" : "outlined"}
              />
            </Stack>
            <Typography variant={featured ? "h5" : "h6"} sx={{ fontWeight: 800 }}>
              {developer.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {developer.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {developer.shortBio}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }}>
              <Stack direction="row" spacing={0.8}>
                <Tooltip title="GitHub">
                  <IconButton
                    component="a"
                    href={developer.github}
                    target="_blank"
                    rel="noreferrer"
                    size="small"
                    sx={socialButtonStyle}
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {developer.linkedin ? (
                  <Tooltip title="LinkedIn">
                    <IconButton
                      component="a"
                      href={developer.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      size="small"
                      sx={socialButtonStyle}
                    >
                      <LinkedInIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
                {developer.email ? (
                  <Tooltip title="Email">
                    <IconButton
                      component="a"
                      href={buildBrandedMailto(developer.email, {
                        subject: `Sanghathi Developer Contact - ${developer.name}`,
                        intro: `Hello ${developer.name},`,
                        details: "I am reaching out from Sanghathi.",
                      })}
                      size="small"
                      sx={socialButtonStyle}
                    >
                      <MailOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Stack>

              <Button
                component={RouterLink}
                to={`/about-developers/${developer.id}`}
                variant="outlined"
                size="small"
                endIcon={<ArrowOutwardRoundedIcon fontSize="small" />}
                sx={{ width: "fit-content" }}
              >
                Read More
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const TeamSection = ({ title, ids, featuredFirst = false }) => (
  <Stack spacing={1.6}>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 800,
        borderLeft: (theme) => `4px solid ${alpha(theme.palette.primary.main, 0.65)}`,
        pl: 1.2,
      }}
    >
      {title}
    </Typography>
    <Grid container spacing={2.2}>
      {ids.map((id, index) => {
        const developer = developers[id];

        if (!developer) {
          return null;
        }

        const isFeatured = featuredFirst && index === 0;

        return (
          <Grid item xs={12} md={isFeatured ? 12 : 6} key={developer.id}>
            <DeveloperPreviewCard developer={developer} featured={isFeatured} />
          </Grid>
        );
      })}
    </Grid>
  </Stack>
);

const AboutDevelopers = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Page
      title="About Developers"
      description="Meet the developers behind Sanghathi. Explore team roles, social profiles, and dedicated developer pages."
      canonicalPath="/about-developers"
      image="/developers/kethanvr.jpeg"
      keywords="Sanghathi developers, Sanghathi team, CMRIT mentoring platform, full stack AI developer"
      structuredData={aboutDevelopersStructuredData}
    >
      <Box
        sx={{
          pt: 3,
          pb: 5,
          background: isLight
            ? `radial-gradient(circle at 8% 10%, ${alpha(theme.palette.primary.light, 0.18)} 0%, transparent 36%),
               linear-gradient(180deg, ${alpha(theme.palette.primary.lighter, 0.3)} 0%, ${alpha(
                 theme.palette.background.default,
                 0.96
               )} 100%)`
            : `radial-gradient(circle at 8% 10%, ${alpha(theme.palette.info.light, 0.18)} 0%, transparent 34%),
               linear-gradient(180deg, ${alpha(theme.palette.grey[900], 0.35)} 0%, ${alpha(
                 theme.palette.background.default,
                 0.98
               )} 100%)`,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 0 } }}>
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
                0.15
              )}`,
            }}
          >
            <Stack spacing={1.2} sx={{ textAlign: "left" }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                About Developers
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Explore the team behind Sanghathi. Each card shows a short overview, and Read More opens the dedicated profile page.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 0.8 }}>
                <Chip label="Sanghathi Engineering" size="small" variant="outlined" />
                <Chip label="AI + Full Stack" size="small" variant="outlined" />
                <Chip label="Open Source Contributors" size="small" variant="outlined" />
              </Stack>
            </Stack>
          </Paper>

          <Stack spacing={3}>
            <TeamSection title="Founders" ids={developerGroups.founders} />
            <TeamSection title="Other Developers" ids={developerGroups.others} />
          </Stack>
        </Container>
      </Box>
    </Page>
  );
};

export default AboutDevelopers;
