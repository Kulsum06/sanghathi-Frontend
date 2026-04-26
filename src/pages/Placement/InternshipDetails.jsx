import React, { useEffect, useContext } from "react";
import { useSnackbar } from "notistack";
import { useForm, useFieldArray } from "react-hook-form";
import { Box, Grid, Card, Stack, Button, IconButton, Typography, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import useApiCache from "../../hooks/useApiCache";

const DEFAULT_EMPTY_INTERNSHIP = {
  companyName: "",
  location: "",
  dateOfSelection: new Date().toISOString().split("T")[0],
  dateOfEnd: "",
  stipend: "",
  semester: "",
  description: "",
};

export default function InternshipDetails() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const methods = useForm({ defaultValues: { internships: [{ ...DEFAULT_EMPTY_INTERNSHIP }] } });
  const { handleSubmit, reset, formState: { isSubmitting, errors } } = methods;
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "internships" });

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/internship/${userId}` : null
  );

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      enqueueSnackbar("Please fill all required fields", { variant: "error" });
    }
  }, [errors, enqueueSnackbar]);

  useEffect(() => {
    if (data !== undefined) {
      const list = data?.data;
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((i) => ({
          ...i,
          dateOfSelection: i.dateOfSelection ? new Date(i.dateOfSelection).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          dateOfEnd: i.dateOfEnd ? new Date(i.dateOfEnd).toISOString().split("T")[0] : "",
        }));
        reset({ internships: formatted });
      } else {
        reset({ internships: [{ ...DEFAULT_EMPTY_INTERNSHIP }] });
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar("Failed to fetch internship data", { variant: "error" });
      reset({ internships: [{ ...DEFAULT_EMPTY_INTERNSHIP }] });
    }
  }, [error, enqueueSnackbar, reset]);

  const validateInternships = (formData) => {
    const isValid = formData.internships.every(
      (i) => i.companyName && i.location && i.dateOfSelection && i.dateOfEnd && i.stipend && i.semester
    );
    if (!isValid) enqueueSnackbar("Please fill all required fields for each internship", { variant: "error" });
    return isValid;
  };

  const onSubmit = async (formData) => {
    try {
      if (!user?._id) { enqueueSnackbar("User information not available", { variant: "error" }); return; }
      if (!validateInternships(formData)) return;
      await api.post("/internship", { internships: formData.internships, userId: menteeId || user._id });
      enqueueSnackbar("Internship details saved successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      enqueueSnackbar(err.message || "An error occurred while processing the request", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Internship Details</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Fields marked with * are required</Typography>
        <Grid container spacing={2}>
          {fields.map((item, index) => (
            <React.Fragment key={item.id}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={11}>
                      <Typography variant="subtitle1" gutterBottom>Internship - {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={1} sx={{ textAlign: "right" }}>
                      {fields.length > 1 && <IconButton color="error" onClick={() => remove(index)}><DeleteIcon /></IconButton>}
                    </Grid>
                    <Grid item xs={12} md={6}><RHFTextField name={`internships[${index}].companyName`} label="Company Name" fullWidth required /></Grid>
                    <Grid item xs={12} md={6}><RHFTextField name={`internships[${index}].location`} label="Location" fullWidth required /></Grid>
                    <Grid item xs={12} md={6}><RHFTextField name={`internships[${index}].dateOfSelection`} label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} required /></Grid>
                    <Grid item xs={12} md={6}><RHFTextField name={`internships[${index}].dateOfEnd`} label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} required /></Grid>
                    <Grid item xs={12} md={6}><RHFTextField name={`internships[${index}].stipend`} label="Stipend" fullWidth required /></Grid>
                    <Grid item xs={12} md={6}><RHFTextField name={`internships[${index}].semester`} label="Semester" fullWidth required /></Grid>
                    <Grid item xs={12}><RHFTextField name={`internships[${index}].description`} label="Description" multiline rows={3} fullWidth /></Grid>
                  </Grid>
                </Card>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" color={isLight ? "primary" : "info"} onClick={() => append({ ...DEFAULT_EMPTY_INTERNSHIP })} sx={{ mt: 2, display: "block", mx: "auto" }}>
              Add Internship
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                <LoadingButton variant="outlined" color={isLight ? "primary" : "info"} onClick={() => reset({ internships: [{ ...DEFAULT_EMPTY_INTERNSHIP }] })}>Reset</LoadingButton>
                <LoadingButton type="submit" variant="contained" color={isLight ? "primary" : "info"} loading={isSubmitting || loading}>Save</LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}
