import { Drawer, useTheme } from "@mui/material";
import useResponsive from "../../hooks/useResponsive";

const SidebarDrawer = ({
  isSidebarOpen,
  setIsSidebarOpen,
  drawerWidth,
  children,
  onBackdropClick,
}) => {
  const theme = useTheme();
  const isNonMobile = useResponsive("up", "sm");

  return (
    <Drawer
      open={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      variant={isNonMobile ? "persistent" : "temporary"}
      anchor="left"
      ModalProps={{
        keepMounted: true,
        onBackdropClick: onBackdropClick || (() => setIsSidebarOpen(false)),
      }}
      sx={{
        flexShrink: 0,
        width: isNonMobile ? drawerWidth : 0,
        boxShadow: theme.palette.mode === "light"
          ? "0 0 6px rgba(0, 0, 0, 0.1)"
          : "0 0 8px rgba(0, 0, 0, 0.3)",
        "& .MuiDrawer-paper": {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          width: drawerWidth,
          maxWidth: "100vw",
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === "light"
            ? "0 0 6px rgba(0, 0, 0, 0.1)"
            : "0 0 8px rgba(0, 0, 0, 0.3)",
          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.standard,
          }),
          overscrollBehavior: "contain",
          paddingBottom: isNonMobile ? "0" : "20px",
        },
      }}
    >
      {children}
    </Drawer>
  );
};

export default SidebarDrawer;
