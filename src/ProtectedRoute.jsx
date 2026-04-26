import { useContext } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";

function ProtectedRouteWrapper({ children, allowedRoles, ...props }) {
  const { user, isFetching } = useContext(AuthContext); // Get the user and loading state from context
  const location = useLocation();
  const navigate = useNavigate();

  const dashboardPathByRole = {
    student: "/",
    faculty: "/faculty/dashboard",
    admin: "/admin/dashboard",
    hod: "/hod/dashboard",
    director: "/director/dashboard",
  };

  const dashboardPath = dashboardPathByRole[user?.roleName] || "/";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(dashboardPath, { replace: true });
  };

  // Show loading spinner while fetching user data
  if (isFetching) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If allowedRoles is specified and user doesn't have the role, show unauthorized page
  if (allowedRoles && !allowedRoles.includes(user.roleName)) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
          Unauthorized
        </Typography>
        <Typography sx={{ mb: 1.2 }}>You don't have permission to access this page.</Typography>
        <Typography sx={{ mb: 0.8 }}>Required role: {allowedRoles.join(", ")}</Typography>
        <Typography sx={{ mb: 2.2 }}>Your role: {user.roleName}</Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
          <Button variant="outlined" onClick={handleBack}>
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(dashboardPath, { replace: true })}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}

export default ProtectedRouteWrapper;
