import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Autorenew as RestoreIcon,
  InfoOutlined as DetailsIcon,
  Refresh as RefreshIcon,
  Visibility as PreviewIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { format } from "date-fns";
import Page from "../../components/Page";
import {
  listAdminUploadSessions,
  previewAdminUploadRestore,
  restoreAdminUploadSession,
} from "../../utils/uploadHistory";

const TAB_LABELS = {
  "add-users": "Add Users",
  "add-attendance": "Add Attendance",
  "add-iat-marks": "Add IAT Marks",
  "add-external-marks": "Add External Marks",
  "add-tyl-marks": "Add TYL Marks",
  "add-mooc-details": "Add MOOC Details",
  "add-mini-project-details": "Add Mini Project Details",
};

const STATUS_COLORS = {
  success: "success",
  partial: "warning",
  failed: "error",
  restored: "info",
  "restore-failed": "error",
};

const SOURCE_LABELS = {
  "dashboard-ui": "Admin Dashboard",
  "local-script": "Local Script",
  api: "API",
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return format(date, "dd MMM yyyy, hh:mm a");
};

const renderPreviewRows = (preview) => {
  if (!preview) {
    return [];
  }

  const entries = Object.entries(preview).filter(([key]) => key !== "tabType");
  return entries.map(([key, value]) => ({ key, value }));
};

const toUserLabel = (user) => {
  if (!user || typeof user !== "object") {
    return "System";
  }

  if (user.name && user.email) {
    return `${user.name} (${user.email})`;
  }

  return user.name || user.email || "System";
};

const prettySource = (source) => SOURCE_LABELS[source] || source || "Unknown";

const formatJson = (value) => {
  try {
    return JSON.stringify(value || {}, null, 2);
  } catch {
    return "{}";
  }
};

export default function UploadHistory() {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsSession, setDetailsSession] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tabFilter, setTabFilter] = useState("all");

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { limit: 100 };
      if (sourceFilter !== "all") {
        params.source = sourceFilter;
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (tabFilter !== "all") {
        params.tabType = tabFilter;
      }

      const { sessions: nextSessions } = await listAdminUploadSessions(params);
      setSessions(nextSessions);
    } catch (loadError) {
      setError(loadError?.message || "Failed to load upload history.");
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, statusFilter, tabFilter]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const summary = useMemo(
    () =>
      sessions.reduce(
        (accumulator, session) => {
          accumulator.total += 1;
          accumulator.success += session.status === "success" ? 1 : 0;
          accumulator.partial += session.status === "partial" ? 1 : 0;
          accumulator.failed += session.status === "failed" ? 1 : 0;
          accumulator.restored += session.status === "restored" ? 1 : 0;
          return accumulator;
        },
        { total: 0, success: 0, partial: 0, failed: 0, restored: 0 }
      ),
    [sessions]
  );

  const selectedSessionLabel = useMemo(
    () => TAB_LABELS[selectedSession?.tabType] || selectedSession?.tabType || "Upload",
    [selectedSession]
  );

  const openDetails = (session) => {
    setDetailsSession(session);
    setDetailsDialogOpen(true);
  };

  const closeDetails = () => {
    setDetailsSession(null);
    setDetailsDialogOpen(false);
  };

  const openPreview = async (session) => {
    setSelectedSession(session);
    setPreviewDialogOpen(true);
    setPreviewData(null);
    setPreviewLoading(true);

    try {
      const preview = await previewAdminUploadRestore(session._id);
      setPreviewData(preview);
    } catch (previewError) {
      setPreviewData({
        tabType: session?.tabType,
        error: previewError?.message || "Unable to generate restore preview.",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewDialogOpen(false);
    setSelectedSession(null);
    setPreviewData(null);
  };

  const handleRestore = async (session) => {
    const typed = window.prompt(
      "This will restore this upload session. Type RESTORE to continue."
    );

    if (typed !== "RESTORE") {
      return;
    }

    setRestoringId(session._id);
    try {
      await restoreAdminUploadSession(session._id);
      await loadSessions();
      if (previewDialogOpen) {
        closePreview();
      }
    } catch (restoreError) {
      setError(restoreError?.message || "Restore failed. Please try again.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Page title="Admin: Upload History">
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: isLight
              ? "rgba(255, 255, 255, 0.85)"
              : alpha(theme.palette.background.paper, 0.88),
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Upload History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track bulk uploads and restore a bad upload session safely.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadSessions}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {[
              { label: "Sessions", value: summary.total },
              { label: "Success", value: summary.success },
              { label: "Partial", value: summary.partial },
              { label: "Failed", value: summary.failed },
              { label: "Restored", value: summary.restored },
            ].map((item) => (
              <Grid key={item.label} item xs={6} sm={4} md={2}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ mb: 2 }}>
            <Select
              size="small"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="all">All Sources</MenuItem>
              <MenuItem value="dashboard-ui">Admin Dashboard</MenuItem>
              <MenuItem value="local-script">Local Script</MenuItem>
              <MenuItem value="api">API</MenuItem>
            </Select>

            <Select
              size="small"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="restored">Restored</MenuItem>
            </Select>

            <Select
              size="small"
              value={tabFilter}
              onChange={(event) => setTabFilter(event.target.value)}
              sx={{ minWidth: 210 }}
            >
              <MenuItem value="all">All Tabs</MenuItem>
              {Object.entries(TAB_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : sessions.length === 0 ? (
            <Alert severity="info">No uploads recorded yet.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Uploaded On</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Tab</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell align="right">Rows</TableCell>
                    <TableCell align="right">Success</TableCell>
                    <TableCell align="right">Errors</TableCell>
                    <TableCell align="right">Affected</TableCell>
                    <TableCell align="right">Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => {
                    const label = TAB_LABELS[session.tabType] || session.tabType;
                    const statusColor = STATUS_COLORS[session.status] || "default";

                    return (
                      <TableRow key={session._id} hover>
                        <TableCell>{formatDateTime(session.createdAt)}</TableCell>
                        <TableCell>{prettySource(session.source)}</TableCell>
                        <TableCell>{label}</TableCell>
                        <TableCell>{toUserLabel(session.adminUserId)}</TableCell>
                        <TableCell>{session.fileName || "-"}</TableCell>
                        <TableCell align="right">{session.totalRows || 0}</TableCell>
                        <TableCell align="right">{session.successCount || 0}</TableCell>
                        <TableCell align="right">{session.errorCount || 0}</TableCell>
                        <TableCell align="right">{session.affectedUserIds?.length || 0}</TableCell>
                        <TableCell align="right">{session.createdUserIds?.length || 0}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={session.status || "unknown"}
                            color={statusColor}
                            variant={statusColor === "default" ? "outlined" : "filled"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View full ingest details">
                              <span>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<DetailsIcon />}
                                  onClick={() => openDetails(session)}
                                  disabled={Boolean(restoringId)}
                                >
                                  Details
                                </Button>
                              </span>
                            </Tooltip>

                            <Tooltip title="Preview restore impact">
                              <span>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<PreviewIcon />}
                                  onClick={() => openPreview(session)}
                                  disabled={Boolean(restoringId)}
                                >
                                  Preview
                                </Button>
                              </span>
                            </Tooltip>

                            <Tooltip title="Restore this upload session">
                              <span>
                                <Button
                                  size="small"
                                  color="warning"
                                  variant="contained"
                                  startIcon={<RestoreIcon />}
                                  disabled={session.restored || restoringId === session._id}
                                  onClick={() => handleRestore(session)}
                                >
                                  {restoringId === session._id ? "Restoring..." : "Restore"}
                                </Button>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      <Dialog open={previewDialogOpen} onClose={closePreview} fullWidth maxWidth="sm">
        <DialogTitle>Restore Preview: {selectedSessionLabel}</DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : previewData?.error ? (
            <Alert severity="error">{previewData.error}</Alert>
          ) : (
            <Stack spacing={1.25}>
              {renderPreviewRows(previewData).map(({ key, value }) => (
                <Stack key={key} direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                    {key.replace(/([A-Z])/g, " $1")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {Array.isArray(value) ? value.length : String(value)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
          <Button
            color="warning"
            variant="contained"
            startIcon={<RestoreIcon />}
            disabled={!selectedSession || selectedSession?.restored || previewLoading}
            onClick={() => selectedSession && handleRestore(selectedSession)}
          >
            Restore Session
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsDialogOpen} onClose={closeDetails} fullWidth maxWidth="md">
        <DialogTitle>Ingest Details</DialogTitle>
        <DialogContent dividers>
          {!detailsSession ? (
            <Typography variant="body2" color="text.secondary">
              No session selected.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Grid container spacing={1.25}>
                {[
                  ["Tab", TAB_LABELS[detailsSession.tabType] || detailsSession.tabType || "-"],
                  ["Source", prettySource(detailsSession.source)],
                  ["Uploaded By", toUserLabel(detailsSession.adminUserId)],
                  ["Uploaded On", formatDateTime(detailsSession.createdAt)],
                  ["File", detailsSession.fileName || "-"],
                  ["Status", detailsSession.status || "unknown"],
                  ["Total Rows", detailsSession.totalRows || 0],
                  ["Success Count", detailsSession.successCount || 0],
                  ["Error Count", detailsSession.errorCount || 0],
                  ["Affected Users", detailsSession.affectedUserIds?.length || 0],
                  ["Created Users", detailsSession.createdUserIds?.length || 0],
                  [
                    "Restored By",
                    detailsSession.restoredBy ? toUserLabel(detailsSession.restoredBy) : "-",
                  ],
                ].map(([label, value]) => (
                  <Grid key={label} item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {String(value)}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Errors ({detailsSession.errors?.length || 0})
                </Typography>
                {detailsSession.errors?.length ? (
                  <Stack spacing={0.75}>
                    {detailsSession.errors.slice(0, 30).map((entry, index) => (
                      <Typography key={`${index}-${entry}`} variant="body2" color="error.main">
                        {`• ${entry}`}
                      </Typography>
                    ))}
                    {detailsSession.errors.length > 30 ? (
                      <Typography variant="caption" color="text.secondary">
                        {`Showing first 30 of ${detailsSession.errors.length} errors.`}
                      </Typography>
                    ) : null}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No errors recorded.
                  </Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Metadata
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    borderRadius: 1.5,
                    backgroundColor: alpha(theme.palette.background.default, 0.65),
                    overflowX: "auto",
                    fontSize: 12,
                  }}
                >
                  {formatJson(detailsSession.metadata)}
                </Box>
              </Box>

              {detailsSession.restoreSummary ? (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Restore Summary
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 1.5,
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.background.default, 0.65),
                        overflowX: "auto",
                        fontSize: 12,
                      }}
                    >
                      {formatJson(detailsSession.restoreSummary)}
                    </Box>
                  </Box>
                </>
              ) : null}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
