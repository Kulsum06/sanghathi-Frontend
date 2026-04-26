import React, { useEffect, useContext, useCallback } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm, useFieldArray } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, Stack, Button, IconButton, Typography, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { FormProvider, RHFTextField, RHFSelect } from "../../components/hook-form";
import { useSearchParams } from "react-router-dom";
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

const locationOptions = [
  { label: "College", value: "College" },
  { label: "Public Section", value: "Public Section" },
  { label: "Private", value: "Private" },
];

const DEFAULT_EMPTY_PROJECT = {
  domain: "",
  projectTitle: "",
  location: "College",
  dateOfStart: "",
  dateOfEnd: "",
  teamInformation: "",
  projectDescription: "",
};

export default function Project() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const methods = useForm({ defaultValues: { projects: [{ ...DEFAULT_EMPTY_PROJECT }] } });
  const { handleSubmit, reset, formState: { isSubmitting, errors } } = methods;
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "projects" });

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/placement/project/projects/${userId}` : null
  );

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      logger.error("Form errors:", errors);
      enqueueSnackbar("Please fill all required fields", { variant: "error" });
    }
  }, [errors, enqueueSnackbar]);

  useEffect(() => {
    if (data !== undefined) {
      const list = data?.data?.projects;
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((p) => ({
          ...p,
          dateOfStart: p.dateOfStart ? new Date(p.dateOfStart).toISOString().split("T")[0] : "",
          dateOfEnd: p.dateOfEnd ? new Date(p.dateOfEnd).toISOString().split("T")[0] : "",
        }));
        reset({ projects: formatted });
      } else {
        logger.warn("No project data found for this user");
        reset({ projects: [{ ...DEFAULT_EMPTY_PROJECT }] });
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) {
      logger.error("Error fetching project data:", error);
      enqueueSnackbar("Failed to fetch project data", { variant: "error" });
      reset({ projects: [{ ...DEFAULT_EMPTY_PROJECT }] });
    }
  }, [error, enqueueSnackbar, reset]);

  const validateProjects = (formData) => {
    const isValid = formData.projects.every(
      (p) => p.domain && p.projectTitle && p.location && p.dateOfStart && p.dateOfEnd && p.teamInformation && p.projectDescription
    );
    if (!isValid) enqueueSnackbar("Please fill all required fields for each project", { variant: "error" });
    return isValid;
  };

  const onSubmit = async (formData) => {
    try {
      if (!user?._id) { enqueueSnackbar("User information not available", { variant: "error" }); return; }
      if (!validateProjects(formData)) return;
      
      const formattedProjects = formData.projects.map((p) => ({
        ...p,
        dateOfStart: new Date(p.dateOfStart),
        dateOfEnd: new Date(p.dateOfEnd),
      }));
      
      logger.info("Saving project details for user:", userId);
      await api.post("/placement/project", { projects: formattedProjects, userId: menteeId || user._id });
      
      enqueueSnackbar("Project details saved successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving project details:", err);
      enqueueSnackbar(err.message || "An error occurred while processing the request", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} disableAutoDraft>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Project Details</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Fields marked with * are required</Typography>
        <Grid container spacing={2}>
          {fields.map((item, index) => (
            <React.Fragment key={item.id}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={11}>
                      <Typography variant="subtitle1" gutterBottom>Project - {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={1} sx={{ textAlign: "right" }}>
                      {fields.length > 1 && (
                        <IconButton color="error" onClick={() => remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField name={`projects[${index}].domain`} label="Domain" fullWidth required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField name={`projects[${index}].projectTitle`} label="Project Title" fullWidth required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField 
                        name={`projects[${index}].dateOfStart`} 
                        label="Start Date" 
                        type="date" 
                        fullWidth 
                        InputLabelProps={{ shrink: true }} 
                        required 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField 
                        name={`projects[${index}].dateOfEnd`} 
                        label="End Date" 
                        type="date" 
                        fullWidth 
                        InputLabelProps={{ shrink: true }} 
                        required 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFSelect name={`projects[${index}].location`} label="Location" fullWidth required>
                        {locationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </RHFSelect>
                    </Grid>
                    <Grid item xs={12}>
                      <RHFTextField name={`projects[${index}].teamInformation`} label="Team Information (USN & Name)" multiline fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                      <RHFTextField name={`projects[${index}].projectDescription`} label="Project Description" multiline fullWidth required />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color={theme.palette.mode === 'light' ? "primary" : "info"} 
              onClick={() => append({ ...DEFAULT_EMPTY_PROJECT })} 
              sx={{ mt: 2, display: "block", mx: "auto" }}
            >
              Add Project
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                <LoadingButton 
                  variant="outlined" 
                  color={theme.palette.mode === 'light' ? "primary" : "info"} 
                  onClick={() => reset({ projects: [{ ...DEFAULT_EMPTY_PROJECT }] })}
                >
                  Reset
                </LoadingButton>
                <LoadingButton 
                  type="submit" 
                  variant="contained" 
                  color={theme.palette.mode === 'light' ? "primary" : "info"} 
                  loading={isSubmitting || loading}
                >
                  Save
                </LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}
