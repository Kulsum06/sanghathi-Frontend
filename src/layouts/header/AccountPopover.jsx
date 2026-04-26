import { useSnackbar } from "notistack";
import { useState, useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
// @mui
import { alpha } from "@mui/material/styles";
import { Box, Divider, Typography, Stack, MenuItem } from "@mui/material";
// routes
// import { PATH_DASHBOARD, PATH_AUTH } from "../../../routes/paths";
// hooks
// import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from "../../hooks/useIsMountedRef";
// components
import MyAvatar from "../../components/MyAvatar";
import MenuPopover from "../../components/MenuPopover";
import IconButtonAnimate from "../../components/animate/IconButtonAnimate";
import { AuthContext } from "../../context/AuthContext";

import logger from "../../utils/logger.js";
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function AccountPopover() {
   const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext); // Now user is available

  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(null);

  const studentHomeLink = "/";
  const facultyHomeLink = "/faculty/dashboard";
  const adminHomeLink = "/admin/dashboard";
  const hodHomeLink = "/hod/dashboard";
  const directorHomeLink = "/director/dashboard";

  const studentProfileLink = "/student/profile";
  const facultyProfileLink = "/faculty/profile";
  const adminProfileLink = "/admin/dashboard";
  const hodProfileLink = "/hod/dashboard";
  const directorProfileLink = "/director/dashboard";

  const getHomeLink = (role) => {
    switch (role) {
      case "admin":
        return adminHomeLink;
      case "hod":
        return hodHomeLink;
      case "director":
        return directorHomeLink;
      case "faculty":
        return facultyHomeLink;
      case "student":
        return studentHomeLink;
      default:
        return "/";
    }
  };

  const getprofileconfig = (role) => {
    switch (role) {
      case "admin":
        return adminProfileLink;
      case "hod":
        return hodProfileLink;
      case "director":
        return directorProfileLink;
      case "faculty":
        return facultyProfileLink;
      case "student":
        return studentProfileLink;
      default:
        return null;
    }
  };

  const homeLink = getHomeLink(user?.roleName);
  const profile = getprofileconfig(user?.roleName); // ✅ safe now that user exists

  const MENU_OPTIONS = [
    {
      label: "Home",
      linkTo: homeLink,
    },
    {
      label: "Profile",
      linkTo: profile,
    },
    {
      label: "Settings",
      linkTo: "/settings",
    },
  ];

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => {
    try {
      dispatch({ type: "LOGOUT" });
      navigate("/login");

      if (isMountedRef.current) {
        handleClose();
      }
    } catch (error) {
      logger.error(error);
      enqueueSnackbar("Unable to logout!", { variant: "error" });
    }
  };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            "&:before": {
              zIndex: 1,
              content: "''",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "absolute",
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <MyAvatar user={user} />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          "& .MuiMenuItem-root": {
            typography: "body2",
            borderRadius: 0.75,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2">{user?.name}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              to={option.linkTo}
              component={RouterLink}
              onClick={handleClose}
            >
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </MenuPopover>
    </>
  );
}
