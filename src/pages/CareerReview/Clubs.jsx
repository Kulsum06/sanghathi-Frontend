import React, { useEffect, useContext, useCallback } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm, useFieldArray } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, Stack, Button, IconButton, Typography, TextField, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { useSearchParams } from "react-router-dom";
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

const EMPTY_ROW = { clubName: "", clubdepartment: "", registeredDate: "" };

export default function Clubs() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const methods = useForm({ defaultValues: { clubs: [{ ...EMPTY_ROW }] } });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "clubs" });

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/career-counselling/clubs/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const list = data?.data?.clubs;
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((c) => ({
          ...c,
          registeredDate: c.registeredDate ? new Date(c.registeredDate).toISOString().split("T")[0] : "",
        }));
        reset({ clubs: formatted });
      } else {
        logger.warn("No club data found for this user");
        reset({ clubs: [{ ...EMPTY_ROW }] });
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) {
      logger.error("Error fetching club data:", error);
      enqueueSnackbar("Error fetching club data", { variant: "error" });
    }
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      if (!user?._id) {
        enqueueSnackbar("User information not available", { variant: "error" });
        return;
      }
      
      logger.info("Saving clubs for user:", userId);
      await api.post("/career-counselling/clubs", { clubs: formData.clubs, userId: menteeId || user._id });
      
      enqueueSnackbar("Club data updated successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving club data:", err);
      enqueueSnackbar("An error occurred while processing the request", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} disableAutoDraft>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Clubs Registered (Department Specific or Institution Specific)</Typography>
        <Grid container spacing={2}>
          {fields.map((item, index) => (
            <Grid container spacing={2} key={item.id} alignItems="center" sx={{ mb: 1, mt: 1 }}>
              <Grid item xs={1}>
                <TextField fullWidth disabled value={index + 1} label="Sl. No." variant="outlined" />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`clubs[${index}].clubName`} label="Club Name" fullWidth />
              </Grid>
              <Grid item xs={4}>
                <RHFTextField name={`clubs[${index}].clubdepartment`} label="Club Department" fullWidth />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`clubs[${index}].registeredDate`} label="Registered Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => remove(index)} sx={{ mt: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" color={isLight ? "primary" : "info"} onClick={() => append({ ...EMPTY_ROW })} sx={{ mt: 2, display: "block", mx: "auto" }}>
              Add Clubs
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                <LoadingButton variant="outlined" color={isLight ? "primary" : "info"} onClick={() => reset({ clubs: [{ ...EMPTY_ROW }] })}>Reset</LoadingButton>
                <LoadingButton type="submit" variant="contained" color={isLight ? "primary" : "info"} loading={isSubmitting || loading}>Save</LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}