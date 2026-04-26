import React, { useEffect, useContext, useCallback } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { useSearchParams } from "react-router-dom";
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

const defaultValues = {
  hobby: "",
  nccNss: "",
  academic: "",
  cultural: "",
  sports: "",
  others: "",
  ambition: "",
  plans: "",
  roleModel: "",
  roleModelReason: "",
  selfDescription: "",
};

export default function Hobbies() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;

  const methods = useForm({ defaultValues });
  const { handleSubmit, reset, setValue, formState: { isSubmitting } } = methods;

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/hobbies-data/hobbies/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const hobbies = data?.data?.hobbies;
      if (hobbies) {
        Object.keys(defaultValues).forEach((key) => {
          setValue(key, hobbies[key] || "");
        });
      } else {
        logger.warn("No hobbies data found for this user.");
      }
    }
  }, [data, setValue]);

  useEffect(() => {
    if (error) {
      logger.error("Error fetching hobbies data:", error);
      enqueueSnackbar("Error fetching hobbies data", { variant: "error" });
    }
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      if (!user?._id) {
        enqueueSnackbar("User information not available", { variant: "error" });
        return;
      }
      
      logger.info("Saving hobbies for user:", userId);
      await api.post("/hobbies-data/hobbies", { ...formData, userId: menteeId || user._id });
      
      enqueueSnackbar("Hobbies updated successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving hobbies data:", err);
      enqueueSnackbar("An error occurred while processing the request", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} disableAutoDraft>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6" textAlign="center" sx={{ fontWeight: "bold", mb: 2 }}>
                Hobbies and Aspirations
              </Typography>

              <RHFTextField name="hobby" label="What are your hobbies?" InputLabelProps={{ shrink: !loading }} multiline fullWidth />
              <RHFTextField name="nccNss" label="Are you a member of NCC/NSS? If yes, describe" InputLabelProps={{ shrink: !loading }} fullWidth multiline />

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>What are your achievements so far?</Typography>
                <Stack spacing={2}>
                  <RHFTextField name="academic" label="Academic" InputLabelProps={{ shrink: !loading }} fullWidth multiline />
                  <RHFTextField name="cultural" label="Cultural" InputLabelProps={{ shrink: !loading }} fullWidth multiline />
                  <RHFTextField name="sports" label="Sports" InputLabelProps={{ shrink: !loading }} fullWidth multiline />
                  <RHFTextField name="others" label="Others" InputLabelProps={{ shrink: !loading }} fullWidth multiline />
                </Stack>
              </Box>

              <RHFTextField label="What is your ambition or goal?" name="ambition" InputLabelProps={{ shrink: !loading }} fullWidth multiline />
              <RHFTextField label="What are your plans to achieve your goals?" name="plans" InputLabelProps={{ shrink: !loading }} fullWidth multiline />

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Who is your role model and why?</Typography>
                <Stack spacing={2}>
                  <RHFTextField label="Role Model" name="roleModel" InputLabelProps={{ shrink: !loading }} fullWidth multiline />
                  <RHFTextField label="Reason" name="roleModelReason" InputLabelProps={{ shrink: !loading }} fullWidth multiline />
                </Stack>
              </Box>

              <RHFTextField label="Describe yourself" name="selfDescription" InputLabelProps={{ shrink: !loading }} fullWidth multiline />

              <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
                <Box display="flex" gap={1}>
                  <LoadingButton variant="outlined" onClick={() => reset(defaultValues)}>Reset</LoadingButton>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>Save</LoadingButton>
                </Box>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}