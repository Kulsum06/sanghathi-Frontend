import React, { useEffect, useContext } from "react";
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

const EMPTY_ROW = { ProffessionalBodyName: "", eventTitle: "", eventDate: null };

export default function PBEvent() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const methods = useForm({ defaultValues: { pbevents: [{ ...EMPTY_ROW }] } });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "pbevents" });

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/proffessional-body/professionalbodyevent/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const list = data?.data?.ProffessionalBodyEvent;
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((e) => ({
          ...e,
          eventDate: e.eventDate ? new Date(e.eventDate).toISOString().split("T")[0] : "",
        }));
        reset({ pbevents: formatted });
      } else {
        reset({ pbevents: [{ ...EMPTY_ROW }] });
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) enqueueSnackbar("Error fetching professional body events", { variant: "error" });
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      await api.post("/proffessional-body/professionalbodyevent", { userId: user._id, ProffessionalBodyEvent: formData.pbevents });
      enqueueSnackbar("PB Event data updated successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      enqueueSnackbar("Error updating PB Event data", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Professional Bodies Events</Typography>
        <Grid container spacing={2}>
          {fields.map((item, index) => (
            <Grid container spacing={2} key={item.id} alignItems="center" sx={{ mb: 1, mt: 1 }}>
              <Grid item xs={1}>
                <TextField fullWidth disabled value={index + 1} label="Sl. No." variant="outlined" />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`pbevents[${index}].ProffessionalBodyName`} label="Professional Body Name" fullWidth />
              </Grid>
              <Grid item xs={4}>
                <RHFTextField name={`pbevents[${index}].eventTitle`} label="Event Title" fullWidth />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`pbevents[${index}].eventDate`} label="Event Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => remove(index)} sx={{ mt: 1 }}><DeleteIcon /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" color={isLight ? "primary" : "info"} onClick={() => append({ ...EMPTY_ROW })} sx={{ mt: 2, display: "block", mx: "auto" }}>
              Add Professional Body Event
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                {import.meta.env.MODE === "development" && (
                  <LoadingButton variant="outlined" color={isLight ? "primary" : "info"} onClick={() => reset({ pbevents: [{ ...EMPTY_ROW }] })}>Reset</LoadingButton>
                )}
                <LoadingButton type="submit" variant="contained" color={isLight ? "primary" : "info"} loading={isSubmitting || loading}>Save</LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}