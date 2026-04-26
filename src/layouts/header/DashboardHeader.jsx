import { useContext, createRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowBackRounded,
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
  NotificationsOutlined,
  PersonOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { useState } from "react";

import AccountPopover from "./AccountPopover";
import NotificationsPopover from "./NotificationsPopover";
import FlexBetween from "../../components/FlexBetween";
import {
  AppBar,
  Button,
  Box,
  Typography,
  IconButton,
  InputBase,
  Toolbar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  Tooltip,
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import useSettings from "../../hooks/useSettings";

const DashboardHeader = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const { onToggleMode } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const dashboardPathByRole = {
    student: "/",
    faculty: "/faculty/dashboard",
    admin: "/admin/dashboard",
    hod: "/hod/dashboard",
    director: "/director/dashboard",
  };

  const dashboardHomePath = dashboardPathByRole[user?.roleName] || "/";
  const showBackButton = location.pathname !== dashboardHomePath;

  const toggleThemeMode = () => {
    onToggleMode.toggleThemeMode();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(dashboardHomePath, { replace: true });
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: theme.palette.background.paper,
        boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.2)",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1.5, sm: 2.5 },
          gap: 1,
        }}
      >
        {/* LEFT SIDE */}
        <FlexBetween gap={{ xs: 0.5, sm: 1.5 }}>
          <IconButton 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            sx={{ color: theme.palette.text.primary }}
          >
            <MenuIcon />
          </IconButton>
          {showBackButton && (
            <Tooltip title="Go Back">
              <Button
                onClick={handleGoBack}
                variant="outlined"
                size="small"
                startIcon={<ArrowBackRounded />}
                sx={{
                  minWidth: { xs: 0, sm: 104 },
                  px: { xs: 1, sm: 1.5 },
                  fontWeight: 700,
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Back
                </Box>
              </Button>
            </Tooltip>
          )}
          {/* Search Bar */}
          {/* <FlexBetween backgroundColor={theme.palette.background.alt} borderRadius="9px" gap="3rem" p="0.1rem 1.5rem">
            <InputBase placeholder="Search..." />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween> */}
        </FlexBetween>

        {/* RIGHT SIDE */}
        <FlexBetween gap={{ xs: 0.5, sm: 1 }}>
          <Tooltip title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}>
            <IconButton 
              onClick={toggleThemeMode}
              sx={{ color: theme.palette.text.primary }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkModeOutlined />
              ) : (
                <LightModeOutlined />
              )}
            </IconButton>
          </Tooltip>

          <NotificationsPopover />
          <AccountPopover />
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;