import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import Page from "../components/Page";
import api from "../utils/axios";

import logger from "../utils/logger.js";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      enqueueSnackbar("Reset token is missing from the URL.", {
        variant: "error",
      });
      return;
    }

    if (password.length < 8) {
      enqueueSnackbar("Password must be at least 8 characters.", {
        variant: "warning",
      });
      return;
    }

    if (password !== passwordConfirm) {
      enqueueSnackbar("Passwords do not match.", { variant: "warning" });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.patch(`/users/resetPassword/${token}`, {
        password,
        passwordConfirm,
      });

      setIsCompleted(true);
      enqueueSnackbar("Password reset successful. Please sign in.", {
        variant: "success",
      });
    } catch (error) {
      logger.error("Reset password request failed", error);
      enqueueSnackbar(
        error.message || "Reset link is invalid or expired. Request a new link.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page title="Reset Password">
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Card sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Typography variant="h4">Reset Password</Typography>
            <Typography variant="body2" color="text.secondary">
              Set a new password for your account.
            </Typography>

            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              fullWidth
              required
              disabled={isSubmitting || isCompleted}
            />

            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              autoComplete="new-password"
              fullWidth
              required
              disabled={isSubmitting || isCompleted}
            />

            {isCompleted ? (
              <Button variant="contained" onClick={() => navigate("/login")}>
                Go to Sign In
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            )}

            <Box>
              <Link component={RouterLink} to="/login" underline="hover">
                Back to Sign In
              </Link>
            </Box>
          </Stack>
        </Card>
      </Container>
    </Page>
  );
}