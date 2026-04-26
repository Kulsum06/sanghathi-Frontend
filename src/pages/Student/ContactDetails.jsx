import React, { useState, useEffect, useContext } from "react";
import { useSnackbar } from "notistack";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import { useForm } from "react-hook-form";
import { Box, Grid, Card, Stack, FormControlLabel, Switch, Typography, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import useApiCache from "../../hooks/useApiCache";

const DEFAULT_VALUES = {
  currentAddress: {
    line1: "",
    line2: "",
    country: "",
    state: "",
    city: "",
    district: "",
    taluka: "",
    pincode: "",
    phoneNumber: "",
  },
  permanentAddress: {
    line1: "",
    line2: "",
    country: "",
    state: "",
    city: "",
    district: "",
    taluka: "",
    pincode: "",
    phoneNumber: "",
  },
};

export default function ContactDetails({ userId: propUserId, colorMode }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get('menteeId');
  
  const userId = propUserId || menteeId || (user ? (user._id || user.id || user.userId) : null);
  
  const [sameAsCurrent, setSameAsCurrent] = useState(false);
  const methods = useForm({ defaultValues: DEFAULT_VALUES });
  const { handleSubmit, reset, setValue, formState: { isSubmitting } } = methods;

  const { data, error, invalidate } = useApiCache(
    userId ? `/v1/contact-details/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const contactData = data?.data?.contactDetails || data;
      if (contactData && contactData.currentAddress) {
        Object.keys(DEFAULT_VALUES.currentAddress).forEach(key => {
          setValue(`currentAddress.${key}`, contactData.currentAddress[key] || '');
        });
      }
      if (contactData && contactData.permanentAddress) {
        Object.keys(DEFAULT_VALUES.permanentAddress).forEach(key => {
          setValue(`permanentAddress.${key}`, contactData.permanentAddress[key] || '');
        });
        const currentAddressValues = contactData.currentAddress || {};
        const permanentAddressValues = contactData.permanentAddress || {};
        const addressesMatch = Object.keys(DEFAULT_VALUES.currentAddress).every(
          key => currentAddressValues[key] === permanentAddressValues[key]
        );
        setSameAsCurrent(addressesMatch);
      }
    }
  }, [data, setValue]);

  useEffect(() => {
    if (error) console.error("Error fetching contact details:", error);
  }, [error]);

  // Handle Same As Current Switch
  const handleSwitchChange = (event) => {
    setSameAsCurrent(event.target.checked);
    if (event.target.checked) {
      setValue("permanentAddress", methods.getValues("currentAddress"), { shouldValidate: true });
    } else {
      setValue("permanentAddress", DEFAULT_VALUES.permanentAddress, { shouldValidate: true });
    }
  };

  const onSubmit = async (formData) => {
    if (!userId) { enqueueSnackbar("User ID is required", { variant: "error" }); return; }
    try {
      await api.post("/v1/contact-details", { userId, currentAddress: formData.currentAddress, permanentAddress: formData.permanentAddress });
      enqueueSnackbar("Contact details saved successfully!", { variant: "success" });
      invalidate();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || error.message || "An error occurred while saving contact details", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Typography variant="h5" gutterBottom>Contact Details</Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>
        
        {/* Current Address */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Current Address</Typography>
              {Object.keys(DEFAULT_VALUES.currentAddress).map((field) => (
                <RHFTextField key={field} name={`currentAddress.${field}`} label={field.replace(/([A-Z])/g, ' $1').trim()} fullWidth required />
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Permanent Address */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Permanent Address</Typography>
                <FormControlLabel
                  control={<Switch checked={sameAsCurrent} onChange={handleSwitchChange} />}
                  label="Same as Current"
                />
              </Box>
              {Object.keys(DEFAULT_VALUES.permanentAddress).map((field) => (
                <RHFTextField key={field} name={`permanentAddress.${field}`} label={field.replace(/([A-Z])/g, ' $1').trim()} fullWidth required />
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <LoadingButton variant="outlined" onClick={() => reset(DEFAULT_VALUES)} disabled={isSubmitting}>
              Reset
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Save
            </LoadingButton>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}