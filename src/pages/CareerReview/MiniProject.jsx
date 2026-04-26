import React, { useEffect, useContext, useCallback } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm, useFieldArray } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, Stack, Button, IconButton, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { useSearchParams } from "react-router-dom";
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

const EMPTY_ROW = { title: "", manHours: "", startDate: "", completedDate: "" };

export default function MiniProject() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;

  const methods = useForm({ defaultValues: { miniproject: [{ ...EMPTY_ROW }] } });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "miniproject" });

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/project/miniproject/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const list = data?.data?.miniproject;
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((m) => ({
          ...m,
          startDate: m.startDate ? new Date(m.startDate).toISOString().split("T")[0] : "",
          completedDate: m.completedDate ? new Date(m.completedDate).toISOString().split("T")[0] : "",
        }));
        reset({ miniproject: formatted });
      } else {
        logger.warn("No miniproject data found for this user");
        reset({ miniproject: [{ ...EMPTY_ROW }] });
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) {
      logger.error("Error fetching mini project data:", error);
      enqueueSnackbar("Error fetching mini project data", { variant: "error" });
    }
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      if (!user?._id) {
        enqueueSnackbar("User information not available", { variant: "error" });
        return;
      }
      
      logger.info("Saving mini projects for user:", userId);
      await api.post("/project/miniproject", { miniproject: formData.miniproject, userId: menteeId || user._id });
      
      enqueueSnackbar("Mini project data updated successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving mini project data:", err);
      enqueueSnackbar("An error occurred while processing the request", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} disableAutoDraft>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {fields.map((item, index) => (
            <Grid container spacing={2} key={item.id} alignItems="center" sx={{ mb: 1, mt: 1 }}>
              <Grid item xs={1}>
                <TextField disabled value={index + 1} label="Sl. No." variant="outlined" />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`miniproject[${index}].title`} label="Mini Project Title" fullWidth />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`miniproject[${index}].manHours`} label="Man Hours" fullWidth />
              </Grid>
              <Grid item xs={2}>
                <RHFTextField name={`miniproject[${index}].startDate`} label="Start Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <RHFTextField name={`miniproject[${index}].completedDate`} label="Completed Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
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
              Add Row
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Box display="flex" gap={1}>
                <LoadingButton variant="outlined" onClick={() => reset({ miniproject: [{ ...EMPTY_ROW }] })}>Reset</LoadingButton>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>Save</LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}
