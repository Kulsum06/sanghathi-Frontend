import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Grid, Card, Stack, Typography, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import useApiCache from "../../hooks/useApiCache";

const DEFAULT_VALUES = {
  fatherFirstName: "",
  fatherMiddleName: "",
  fatherLastName: "",
  motherFirstName: "",
  motherMiddleName: "",
  motherLastName: "",
  fatherOccupation: "",
  motherOccupation: "",
  fatherOrganization: "",
  motherOrganization: "",
  fatherDesignation: "",
  motherDesignation: "",
  fatherOfficeAddress: "",
  motherOfficeAddress: "",
  fatherAnnualIncome: "",
  motherAnnualIncome: "",
  fatherPhoneNumber: "",
  fatherOfficePhone: "",
  motherPhoneNumber: "",
  motherOfficePhone: "",
};

export default function ParentsDetails() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;

  const methods = useForm({ defaultValues: DEFAULT_VALUES });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/parent-details/${userId}` : null
  );

  // Populate form when data loads
  useEffect(() => {
    if (data !== undefined) {
      const parentDetails = data?.data?.parentDetails;
      if (parentDetails) {
        const formData = {};
        Object.keys(DEFAULT_VALUES).forEach((key) => {
          formData[key] = parentDetails[key] || "";
        });
        reset(formData);
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar("Error fetching parent details", { variant: "error" });
    }
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      if (!userId) {
        enqueueSnackbar("User ID is required", { variant: "error" });
        return;
      }
      await api.post("/parent-details", { ...formData, userId });
      enqueueSnackbar("Parent details saved successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message || err.message || "An error occurred while saving parent details",
        { variant: "error" }
      );
    }
  };

  return (
    <div>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Parents Details</Typography>
              <Divider sx={{ mb: 3 }} />

              {loading ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography>Loading parent details...</Typography>
                </Box>
              ) : (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <RHFTextField name="fatherFirstName" label="Father's First Name" fullWidth required />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <RHFTextField name="fatherMiddleName" label="Father's Middle Name" fullWidth />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <RHFTextField name="fatherLastName" label="Father's Last Name" fullWidth />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <RHFTextField name="motherFirstName" label="Mother's First Name" fullWidth required />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <RHFTextField name="motherMiddleName" label="Mother's Middle Name" fullWidth />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <RHFTextField name="motherLastName" label="Mother's Last Name" fullWidth />
                    </Grid>
                  </Grid>
                </>
              )}
            </Card>
          </Grid>

          {!loading && (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    <Typography variant="h6">Father's Details</Typography>
                    <RHFTextField name="fatherOccupation" label="Father's Occupation" fullWidth required />
                    <RHFTextField name="fatherOrganization" label="Father's Organization" fullWidth />
                    <RHFTextField name="fatherDesignation" label="Father's Designation" fullWidth />
                    <RHFTextField name="fatherPhoneNumber" label="Father's Phone Number" fullWidth required />
                    <RHFTextField name="fatherOfficePhone" label="Father's Office Phone" fullWidth />
                    <RHFTextField name="fatherOfficeAddress" label="Father's Office Address" fullWidth />
                    <RHFTextField name="fatherAnnualIncome" label="Father's Annual Income" fullWidth />
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    <Typography variant="h6">Mother's Details</Typography>
                    <RHFTextField name="motherOccupation" label="Mother's Occupation" fullWidth required />
                    <RHFTextField name="motherOrganization" label="Mother's Organization" fullWidth />
                    <RHFTextField name="motherDesignation" label="Mother's Designation" fullWidth />
                    <RHFTextField name="motherPhoneNumber" label="Mother's Phone Number" fullWidth required />
                    <RHFTextField name="motherOfficePhone" label="Mother's Office Phone" fullWidth />
                    <RHFTextField name="motherOfficeAddress" label="Mother's Office Address" fullWidth />
                    <RHFTextField name="motherAnnualIncome" label="Mother's Annual Income" fullWidth />
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={12}>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={3} alignItems="flex-end">
                    <Box display="flex" gap={1}>
                      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                        Save
                      </LoadingButton>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </FormProvider>
    </div>
  );
}