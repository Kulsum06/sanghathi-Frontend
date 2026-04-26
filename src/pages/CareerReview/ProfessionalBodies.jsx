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

const EMPTY_ROW = { ProffessionalBodyName: "", UniqueID: "", registeredDate: "" };

export default function ProfessionalBodies() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const methods = useForm({ defaultValues: { proffessionalbodies: [{ ...EMPTY_ROW }] } });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "proffessionalbodies" });

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/proffessional-body/proffessionalbody/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const list = data?.data?.proffessionalbody;
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((p) => ({
          ...p,
          registeredDate: p.registeredDate ? new Date(p.registeredDate).toISOString().split("T")[0] : "",
        }));
        reset({ proffessionalbodies: formatted });
      } else {
        logger.warn("No professional bodies data found for this user");
        reset({ proffessionalbodies: [{ ...EMPTY_ROW }] });
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) {
      logger.error("Error fetching professional bodies data:", error);
      enqueueSnackbar("Error fetching professional bodies data", { variant: "error" });
    }
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      if (!user?._id) {
        enqueueSnackbar("User information not available", { variant: "error" });
        return;
      }
      
      logger.info("Saving professional bodies for user:", userId);
      await api.post("/proffessional-body/proffessionalbody", { 
        proffessionalbodies: formData.proffessionalbodies, 
        userId: menteeId || user._id 
      });
      
      enqueueSnackbar("Professional Bodies data updated successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving professional bodies data:", err);
      enqueueSnackbar("Error updating professional bodies data", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} disableAutoDraft>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Professional Bodies Registered</Typography>
        <Grid container spacing={2}>
          {fields.map((item, index) => (
            <Grid container spacing={2} key={item.id} alignItems="center" sx={{ mb: 1, mt: 1 }}>
              <Grid item xs={1}>
                <TextField fullWidth disabled value={index + 1} label="Sl. No." variant="outlined" />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`proffessionalbodies[${index}].ProffessionalBodyName`} label="Professional Body Name" fullWidth />
              </Grid>
              <Grid item xs={4}>
                <RHFTextField name={`proffessionalbodies[${index}].UniqueID`} label="Unique ID" fullWidth />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`proffessionalbodies[${index}].registeredDate`} label="Event Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
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
              Add Professional Body
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                <LoadingButton variant="outlined" color={isLight ? "primary" : "info"} onClick={() => reset({ proffessionalbodies: [{ ...EMPTY_ROW }] })}>Reset</LoadingButton>
                <LoadingButton type="submit" variant="contained" color={isLight ? "primary" : "info"} loading={isSubmitting || loading}>Save</LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}