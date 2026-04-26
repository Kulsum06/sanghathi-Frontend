import React, { useEffect, useContext, useCallback, useState } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, Stack, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSearchParams } from "react-router-dom";
import { FormProvider, RHFTextField, RHFSelect } from "../../components/hook-form";
import useApiCache from "../../hooks/useApiCache";
import logger from "../../utils/logger.js";

export default function CareerCounselling() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  
  const methods = useForm();
  const { handleSubmit, reset, setValue, formState: { isSubmitting } } = methods;

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/career-counselling/career/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const careers = data?.data?.careers;
      if (careers) {
        Object.keys(careers).forEach((key) => setValue(key, careers[key]));
      } else {
        logger.warn("No Career Counselling data found for this user.");
      }
    }
  }, [data, setValue]);

  useEffect(() => {
    if (error) {
      logger.error("Error fetching career counselling data:", error);
      enqueueSnackbar("Error fetching career counselling data", { variant: "error" });
    }
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      if (!user?._id) {
        enqueueSnackbar("User information not available", { variant: "error" });
        return;
      }
      
      logger.info("Saving career counselling data for user:", userId);
      await api.post("/career-counselling/career", { ...formData, userId: menteeId || user._id });
      
      enqueueSnackbar("Career profile updated successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving career counselling data:", err);
      enqueueSnackbar("An error occurred while processing the request", { variant: "error" });
    }
  };

  const TechnicalStudies = ["Mtech in India", "Mtech in US", "Others"];
  const ManagementStudies = ["MBA in India", "MS in US", "Others"];
  const Entrepreneur = ["Family Business", "New Business", "Others"];
  const Job = ["Government", "Private", "Others"];
  const CompetitiveExams = ["GATE", "GRE", "TOEFL", "IELTS", "GMAT", "MAT", "IES", "IAS", "Others"];

  const shrink = !loading;

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} disableAutoDraft>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <RHFSelect name="TechnicalStudies" label="Technical Studies" InputLabelProps={{ shrink }}>
              <option value="" />
              {TechnicalStudies.map((o) => <option key={o} value={o}>{o}</option>)}
            </RHFSelect>
          </Grid>
          <Grid item xs={12}>
            <RHFSelect name="ManagementStudies" label="Management Studies" InputLabelProps={{ shrink }}>
              <option value="" />
              {ManagementStudies.map((o) => <option key={o} value={o}>{o}</option>)}
            </RHFSelect>
          </Grid>
          <Grid item xs={12}>
            <RHFSelect name="Entrepreneur" label="Entrepreneur" InputLabelProps={{ shrink }}>
              <option value="" />
              {Entrepreneur.map((o) => <option key={o} value={o}>{o}</option>)}
            </RHFSelect>
          </Grid>
          <Grid item xs={12}>
            <RHFSelect name="Job" label="Job" InputLabelProps={{ shrink }}>
              <option value="" />
              {Job.map((o) => <option key={o} value={o}>{o}</option>)}
            </RHFSelect>
          </Grid>
          <Grid item xs={12}>
            <RHFSelect name="CompetitiveExams" label="Competitive Exams plan to attend" InputLabelProps={{ shrink }}>
              <option value="" />
              {CompetitiveExams.map((o) => <option key={o} value={o}>{o}</option>)}
            </RHFSelect>
          </Grid>
          <Grid item xs={12}>
            <RHFTextField name="CareerObjective" label="Career Objective for studies/job, after passing out from college (in 2 or 3 sentences)" InputLabelProps={{ shrink }} multiline fullWidth rows={4} />
          </Grid>
          <Grid item xs={12}>
            <RHFTextField name="ActionPlan" label="Action Plan for Career Objective (in 2 or 3 sentences)" InputLabelProps={{ shrink }} multiline fullWidth rows={4} />
          </Grid>
          <Grid item xs={12}>
            <RHFTextField name="TrainingRequirements" label="Training Requirements: (Internal/External/Others)" InputLabelProps={{ shrink }} multiline fullWidth rows={4} />
          </Grid>
          <Grid item xs={12}>
            <RHFTextField name="TrainingPlanning" label="Trainings Planning to attend" InputLabelProps={{ shrink }} multiline fullWidth rows={4} />
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                <LoadingButton variant="outlined" color={isLight ? "primary" : "info"} onClick={() => reset()}>Reset</LoadingButton>
                <LoadingButton type="submit" variant="contained" color={isLight ? "primary" : "info"} loading={isSubmitting || loading}>Save</LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}