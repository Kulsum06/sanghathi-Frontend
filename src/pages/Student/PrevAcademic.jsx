import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useSnackbar } from "notistack";
import { useForm, useWatch } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  Divider,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import logger from "../../utils/logger.js";
import useDraftPersistence from "../../hooks/useDraftPersistence";
import {
  FormProvider,
  RHFSelect,
  RHFTextField,
} from "../../components/hook-form";
import useApiCache from "../../hooks/useApiCache";

const DEFAULT_VALUES = {
  sslc: { school: "", percentage: "", board: "", yearOfPassing: "", schoolAddress: "" },
  puc: { school: "", percentage: "", board: "", yearOfPassing: "", subjects: [], schoolAddress: "" },
  diploma: { college: "", branch: "", percentage: "", board: "", yearOfPassing: "", collegeAddress: "" }
};
const BOARDS = ["CBSE", "ICSE", "State Board", "Others"];
const PUC_SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology"];

export default function PrevAcademic() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get('menteeId');
  const userId = menteeId || user?._id;

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [versions, setVersions] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const methods = useForm({ defaultValues: DEFAULT_VALUES });
  const { setValue, getValues, reset, control, handleSubmit, formState: { isSubmitting } } = methods;

  const watchedValues = useWatch({ control });

  const { data, error, invalidate } = useApiCache(
    userId ? `/v1/academics/${userId}` : null
  );

  const draftScopeId = useMemo(
    () => menteeId || user?._id || "default",
    [menteeId, user?._id]
  );

  const {
    syncState,
    lastSavedAt,
    hasLocalDraft,
    clearDraft,
    forceSync,
  } = useDraftPersistence({
    formType: "academic-details",
    scopeId: draftScopeId,
    values: watchedValues,
    reset,
    enableServerSync: Boolean(user?._id),
    enablePersistence: isDataFetched,
  });

  const formatDateTime = (value) => {
    if (!value) return "Not saved yet";
    const asDate = new Date(value);
    if (Number.isNaN(asDate.getTime())) return "Not saved yet";
    return asDate.toLocaleString();
  };

  const fetchVersions = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const response = await api.get("/forms/versions/academic-details", {
        params: { scopeId: draftScopeId, limit: 20 },
      });
      setVersions(response.data?.data?.versions || []);
    } catch (error) {
      logger.error("Failed to load academic version history", error);
      enqueueSnackbar("Failed to load version history", { variant: "error" });
    } finally {
      setIsHistoryLoading(false);
    }
  }, [draftScopeId, enqueueSnackbar]);

  const handleCreateVersion = async () => {
    setIsSavingVersion(true);
    try {
      const currentData = getValues();
      const snapshot = {
        ...currentData,
        puc: {
          ...currentData.puc,
          subjects: selectedSubjects,
        },
      };

      await api.post("/forms/versions/academic-details", {
        scopeId: draftScopeId,
        snapshot,
        reason: "manual-save",
        changedFields: [],
      });

      enqueueSnackbar("Version checkpoint created", { variant: "success" });
      await fetchVersions();
      await forceSync();
    } catch (error) {
      logger.error("Failed to create academic version", error);
      enqueueSnackbar("Failed to create version", { variant: "error" });
    } finally {
      setIsSavingVersion(false);
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    setIsRestoringVersion(true);
    try {
      const response = await api.post(
        `/forms/versions/academic-details/${versionNumber}/restore`,
        {
          scopeId: draftScopeId,
        }
      );

      const restored = response.data?.data?.draft?.draftData;

      if (restored) {
        reset(restored);
        setSelectedSubjects(restored?.puc?.subjects || []);
        enqueueSnackbar(`Restored version ${versionNumber}`, {
          variant: "success",
        });
      } else {
        enqueueSnackbar("Restore completed but no draft payload returned", {
          variant: "warning",
        });
      }

      await fetchVersions();
    } catch (error) {
      logger.error("Failed to restore academic version", error);
      enqueueSnackbar("Failed to restore version", { variant: "error" });
    } finally {
      setIsRestoringVersion(false);
    }
  };

  useEffect(() => {
    if (data !== undefined) {
      const academicData = data?.data?.academicDetails || data;
      if (academicData) {
        if (academicData.sslc) {
          Object.keys(DEFAULT_VALUES.sslc).forEach(key => setValue(`sslc.${key}`, academicData.sslc[key] || ""));
        }
        if (academicData.puc) {
          Object.keys(DEFAULT_VALUES.puc).forEach(key => {
            if (key !== 'subjects') setValue(`puc.${key}`, academicData.puc[key] || "");
          });
          if (academicData.puc.subjects && Array.isArray(academicData.puc.subjects)) {
            setSelectedSubjects(academicData.puc.subjects);
            setValue("puc.subjects", academicData.puc.subjects);
          }
        }
        if (academicData.diploma) {
          Object.keys(DEFAULT_VALUES.diploma).forEach(key => setValue(`diploma.${key}`, academicData.diploma[key] || ""));
        }
      }
      setIsDataFetched(true);
    }
  }, [data, setValue, reset]);

  useEffect(() => {
    if (error) {
        logger.error("Error fetching academic details:", error);
    }
  }, [error]);

  useEffect(() => {
    setValue("puc.subjects", selectedSubjects, {
      shouldDirty: isDataFetched,
    });
  }, [isDataFetched, selectedSubjects, setValue]);

  const handleSubjectChange = (subject, checked) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subject]);
    } else {
      setSelectedSubjects(prev => prev.filter(item => item !== subject));
    }
  };

  const onSubmit = async (formData) => {
    try {
      if (!userId) { enqueueSnackbar("User ID is required", { variant: "error" }); return; }
      
      const payload = {
        ...formData,
        puc: { ...formData.puc, subjects: selectedSubjects },
        userId
      };
      
      logger.info("Submitting academic data:", payload);
      const response = await api.post("/v1/academics", payload);
      logger.info("Academic data response:", response.data);

      try {
        await api.post("/forms/versions/academic-details", {
          scopeId: draftScopeId,
          snapshot: payload,
          reason: "submit",
          changedFields: [],
        });
      } catch (versionError) {
        logger.error("Failed to record submit version", versionError);
      }

      clearDraft();
      enqueueSnackbar("Academic details saved successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving academic details:", err);
      enqueueSnackbar(err.response?.data?.message || err.message || "An error occurred while saving academic details", { variant: "error" });
    }
  };

  return (
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        disableAutoDraft
      >
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>Academic Background</Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ mb: 2 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    size="small"
                    label={`Draft: ${syncState}`}
                    color={
                      syncState === "error"
                        ? "error"
                        : syncState === "synced"
                          ? "success"
                          : "default"
                    }
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Last saved: {formatDateTime(lastSavedAt)}
                  </Typography>
                  {hasLocalDraft && (
                    <Typography variant="caption" color="text.secondary">
                      Local draft available
                    </Typography>
                  )}
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    onClick={forceSync}
                    loading={syncState === "syncing"}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    Sync Now
                  </LoadingButton>
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    onClick={handleCreateVersion}
                    loading={isSavingVersion}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    Save Version
                  </LoadingButton>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      const nextOpenState = !isHistoryOpen;
                      setIsHistoryOpen(nextOpenState);
                      if (nextOpenState) {
                        await fetchVersions();
                      }
                    }}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    {isHistoryOpen ? "Hide History" : "View History"}
                  </Button>
                </Stack>
              </Stack>

              {isHistoryOpen && (
                <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Version History
                  </Typography>

                  {isHistoryLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading versions...
                    </Typography>
                  ) : versions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No version checkpoints found.
                    </Typography>
                  ) : (
                    <List dense>
                      {versions.map((versionDoc) => (
                        <ListItem
                          key={versionDoc._id}
                          secondaryAction={
                            <LoadingButton
                              size="small"
                              variant="outlined"
                              loading={isRestoringVersion}
                              onClick={() => handleRestoreVersion(versionDoc.version)}
                            >
                              Restore
                            </LoadingButton>
                          }
                        >
                          <ListItemText
                            primary={`Version ${versionDoc.version} (${versionDoc.reason})`}
                            secondary={formatDateTime(versionDoc.createdAt)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              )}

              <Typography variant="h6">SSLC / Class X</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: "grid", rowGap: 3, columnGap: 2, gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" } }}>
                <RHFTextField name="sslc.school" label="School" />
                <RHFTextField name="sslc.percentage" label="GPA/ % " />
                <RHFSelect name="sslc.board" label="Board">
                  <option value="" />
                  {BOARDS.map((o) => <option key={o} value={o}>{o}</option>)}
                </RHFSelect>
                <RHFTextField name="sslc.yearOfPassing" label="Year of Passing" />
                <RHFTextField name="sslc.schoolAddress" label="School Address" />
              </Box>

              <Typography variant="h6" sx={{ mt: 4 }}>PUC / Class XII</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: "grid", rowGap: 3, columnGap: 2, gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" } }}>
                <RHFTextField name="puc.school" label="School" />
                <RHFTextField name="puc.percentage" label="GPA/ % " />
                <RHFSelect name="puc.board" label="Board">
                  <option value="" />
                  {BOARDS.map((o) => <option key={o} value={o}>{o}</option>)}
                </RHFSelect>
                <RHFTextField name="puc.yearOfPassing" label="Year of Passing" />
                <FormControl component="fieldset" sx={{ gridColumn: "span 2" }}>
                  <FormLabel component="legend">Subjects</FormLabel>
                  <FormGroup aria-label="position" row sx={{ rowGap: 0.5, columnGap: 1 }}>
                    {PUC_SUBJECTS.map(subject => (
                      <FormControlLabel
                        key={subject}
                        value={subject}
                        control={<Checkbox checked={selectedSubjects.includes(subject)} onChange={(e) => handleSubjectChange(subject, e.target.checked)} />}
                        label={subject}
                        labelPlacement="end"
                      />
                    ))}
                  </FormGroup>
                </FormControl>
                <RHFTextField name="puc.schoolAddress" label="School Address" />
              </Box>

              <Typography variant="h6" sx={{ mt: 4 }}>Lateral Entry/Diploma</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: "grid", rowGap: 3, columnGap: 2, gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" } }}>
                <RHFTextField name="diploma.college" label="College" />
                <RHFTextField name="diploma.branch" label="Branch" />
                <RHFTextField name="diploma.percentage" label="GPA/ % " />
                <RHFSelect name="diploma.board" label="Board">
                  <option value="" />
                  {BOARDS.map((o) => <option key={o} value={o}>{o}</option>)}
                </RHFSelect>
                <RHFTextField name="diploma.yearOfPassing" label="Year of Passing" />
                <RHFTextField name="diploma.collegeAddress" label="College Address" />
              </Box>

              <Stack spacing={2} alignItems={{ xs: "stretch", sm: "flex-end" }} sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Save Changes
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
  );
}
