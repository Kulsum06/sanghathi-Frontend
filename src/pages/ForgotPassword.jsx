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
import { Link as RouterLink } from "react-router-dom";
import { useSnackbar } from "notistack";
import Page from "../components/Page";
import api from "../utils/axios";

import logger from "../utils/logger.js";

export default function ForgotPassword() {
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      enqueueSnackbar("Please enter your email address.", { variant: "warning" });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/users/forgotPassword", { email: email.trim() });
      setIsSubmitted(true);
      enqueueSnackbar(
        "If an account exists with this email, a reset link has been sent.",
        { variant: "success" }
      );
    } catch (error) {
      logger.error("Forgot password request failed", error);
      enqueueSnackbar(
        error.message || "Unable to send reset link. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page title="Forgot Password">
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Card sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Typography variant="h4">Forgot Password</Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your account email and we will send a password reset link.
            </Typography>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              fullWidth
              required
              disabled={isSubmitting}
            />

            {isSubmitted && (
              <Box>
                <Typography variant="body2" color="success.main">
                  Request received. Check your inbox for the reset link.
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>

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