import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import getNavConfig from "./NavConfig";
import SidebarDrawer from "./SidebarDrawer";
import NavItemsList from "./NavItemsList";
import FlexBetween from "../../components/FlexBetween";
import logo from "../../public/logo.svg";
import { Box, IconButton, useTheme } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
  onBackdropClick,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("dashboard");
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const normalizeText = (text) => {
    return text.replace(/[\s_-]/g, "");
  };

  useEffect(() => {
    if (pathname === "/") {
      setActive("dashboard");
    } else {
      setActive(normalizeText(pathname.substring(1)));
    }
  }, [pathname]);

  const navConfig = getNavConfig(user?.roleName);

  return (
    <Box
      component="nav"
      sx={{ width: isNonMobile ? drawerWidth : 0, flexShrink: { sm: 0 } }}
    >
      {isSidebarOpen && (
        <SidebarDrawer
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          drawerWidth={drawerWidth}
          onBackdropClick={onBackdropClick}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <img
              src={logo}
              alt="CMRIT Logo"
              style={{
                filter: "none",
                margin: isNonMobile ? "16px 5px" : "20px 8px",
                width: isNonMobile ? "145px" : "110px",
                maxWidth: "100%",
                transition: "width 0.2s ease",
              }}
            />
          </Box>
          <FlexBetween color={theme.palette.secondary.main}>
            {!isNonMobile && (
              <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <ChevronLeft />
              </IconButton>
            )}
          </FlexBetween>
          <NavItemsList
            navConfig={navConfig}
            active={active}
            setActive={setActive}
          />
        </SidebarDrawer>
      )}
    </Box>
  );
};

export default Sidebar;
