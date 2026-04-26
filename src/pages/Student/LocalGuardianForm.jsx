import React, { useEffect, useState, useContext } from "react";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { Box, Grid, Card, Stack, Typography, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/axios";
import useApiCache from "../../hooks/useApiCache";

const DEFAULT_VALUES = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  relationWithGuardian: "",
  mobileNumber: "",
  phoneNumber: "",
  residenceAddress: "",
  taluka: "",
  district: "",
  state: "",
  pincode: "",
};

export default function LocalGuardianForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;

  const methods = useForm({ defaultValues: DEFAULT_VALUES });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/v1/local-guardians/${userId}` : null
  );

  // Populate form when cached/fresh data arrives
  useEffect(() => {
    if (data !== undefined) {
      if (data?.data?.localGuardian) {
        reset(data.data.localGuardian);
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [data, reset]);

  // Show error snackbar for non-404 errors
  useEffect(() => {
    if (error) {
      enqueueSnackbar("Error fetching guardian details", { variant: "error" });
    }
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      if (!userId) {
        enqueueSnackbar("User ID is required", { variant: "error" });
        return;
      }
      await api.post("/v1/local-guardians", { ...formData, userId });
      enqueueSnackbar("Guardian details saved successfully!", { variant: "success" });
      invalidate(); // refresh cache after save
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message || "Error saving guardian details",
        { variant: "error" }
      );
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Local Guardian Details</Typography>
        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography>Loading guardian details...</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {Object.keys(DEFAULT_VALUES).map((field) => (
                <Grid item xs={12} md={field === "residenceAddress" ? 12 : 4} key={field}>
                  <RHFTextField
                    name={field}
                    label={field.split(/(?=[A-Z])/).join(" ")}
                    fullWidth
                    multiline={field === "residenceAddress"}
                    rows={field === "residenceAddress" ? 4 : 1}
                  />
                </Grid>
              ))}
            </Grid>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                <LoadingButton
                  variant="outlined"
                  onClick={() => reset(DEFAULT_VALUES)}
                  disabled={isSubmitting}
                >
                  Reset
                </LoadingButton>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Save
                </LoadingButton>
              </Box>
            </Stack>
          </>
        )}
      </Card>
    </FormProvider>
  );
}