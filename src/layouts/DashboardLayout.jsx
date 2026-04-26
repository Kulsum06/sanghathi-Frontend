import React, { useContext, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import DashboardHeader from "./header/DashboardHeader";
import useResponsive from "../hooks/useResponsive";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import ReleaseAnnouncementDialog from "../components/updates/ReleaseAnnouncementDialog";

const RELEASE_ANNOUNCEMENT_SESSION_KEY = "showSanghathi20Announcement";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isNonMobile = useResponsive("up", "sm");
  const [isSidebarOpen, setIsSidebarOpen] = useState(isNonMobile);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(isNonMobile);
  }, [isNonMobile]);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

      const shouldShowReleaseDialog =
        sessionStorage.getItem(RELEASE_ANNOUNCEMENT_SESSION_KEY) === "true";

      if (shouldShowReleaseDialog) {
        setIsReleaseDialogOpen(true);
      }
  }, [user?._id]);

  const handleBackdropClick = () => {
    if (!isNonMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleReleaseDismiss = () => {
      sessionStorage.removeItem(RELEASE_ANNOUNCEMENT_SESSION_KEY);
    setIsReleaseDialogOpen(false);
  };

  const handleReleaseCheckUpdates = () => {
      sessionStorage.removeItem(RELEASE_ANNOUNCEMENT_SESSION_KEY);
    setIsReleaseDialogOpen(false);
    navigate("/updates");
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Sidebar
        isNonMobile={isNonMobile}
        drawerWidth={{ xs: "84vw", sm: 250 }}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onBackdropClick={handleBackdropClick}
      />
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <DashboardHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
        <Footer />
      </Box>
      <ReleaseAnnouncementDialog
        open={isReleaseDialogOpen}
        onDismiss={handleReleaseDismiss}
        onCheckUpdates={handleReleaseCheckUpdates}
      />
    </Box>
  );
};

export default DashboardLayout;
