import { useEffect, useRef, useState } from "react";
import { Box, LinearProgress, alpha, useTheme } from "@mui/material";
import { useGlobalLoading } from "../../context/LoadingContext";

const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 280;

const clearTimer = (timerRef) => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};

const GlobalTopLoader = () => {
  const theme = useTheme();
  const { isLoading } = useGlobalLoading();
  const [visible, setVisible] = useState(false);

  const shownAtRef = useRef(0);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    clearTimer(showTimerRef);
    clearTimer(hideTimerRef);

    if (isLoading) {
      showTimerRef.current = setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, SHOW_DELAY_MS);
      return () => {
        clearTimer(showTimerRef);
      };
    }

    if (!visible) {
      return () => {};
    }

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, remaining);

    return () => {
      clearTimer(hideTimerRef);
    };
  }, [isLoading, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: (muiTheme) => muiTheme.zIndex.snackbar + 20,
        pointerEvents: "none",
      }}
    >
      <LinearProgress
        color={theme.palette.mode === "light" ? "primary" : "info"}
        sx={{
          height: 3,
          borderRadius: 0,
          backgroundColor: alpha(theme.palette.primary.main, 0.16),
          "& .MuiLinearProgress-bar": {
            borderRadius: 0,
          },
        }}
      />
    </Box>
  );
};

export default GlobalTopLoader;
