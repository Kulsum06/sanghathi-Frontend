import React, { useEffect, useContext, useCallback } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm, useFieldArray } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, Stack, Button, IconButton, Typography, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { useSearchParams } from "react-router-dom";
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

const EMPTY_ROW = { eventType: "", eventTitle: "", description: "", eventDate: "" };

export default function Activity() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;

  const methods = useForm({ defaultValues: { activity: [{ ...EMPTY_ROW }] } });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "activity" });

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/activity-data/activity/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const list = data?.data?.activity;
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((a) => ({
          ...a,
          eventDate: a.eventDate ? new Date(a.eventDate).toISOString().split("T")[0] : "",
        }));
        reset({ activity: formatted });
      } else {
        logger.warn("No activity data found for this user");
        reset({ activity: [{ ...EMPTY_ROW }] });
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) {
      logger.error("Error fetching activity data:", error);
      enqueueSnackbar("Error fetching activity data", { variant: "error" });
    }
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      if (!user?._id) {
        enqueueSnackbar("User information not available", { variant: "error" });
        return;
      }
      
      logger.info("Saving activity data for user:", userId);
      await api.post("/activity-data/activity", { activity: formData.activity, userId: menteeId || user._id });
      
      enqueueSnackbar("Activity data updated successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving activity data:", err);
      enqueueSnackbar("An error occurred while processing the request", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} disableAutoDraft>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Event Participation Record in Sports, Cultural, Societal, etc by the Student
        </Typography>
        <Grid container spacing={2}>
          {fields.map((item, index) => (
            <Grid container spacing={2} key={item.id} alignItems="center" sx={{ mb: 1, mt: 1 }}>
              <Grid item xs={1}>
                <TextField disabled value={index + 1} label="Sl. No." variant="outlined" />
              </Grid>
              <Grid item xs={2}>
                <RHFTextField name={`activity[${index}].eventType`} label="Event Type" fullWidth />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`activity[${index}].eventTitle`} label="Event Title" fullWidth />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`activity[${index}].description`} label="Description" fullWidth />
              </Grid>
              <Grid item xs={2}>
                <RHFTextField name={`activity[${index}].eventDate`} label="Event Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => remove(index)} sx={{ mt: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" onClick={() => append({ ...EMPTY_ROW })} sx={{ mt: 2, display: "block", mx: "auto" }}>
              Add Activity
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Box display="flex" gap={1}>
                <LoadingButton variant="outlined" onClick={() => reset({ activity: [{ ...EMPTY_ROW }] })}>Reset</LoadingButton>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>Save</LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}