import React, { useEffect, useContext, useCallback } from "react";
import { useSnackbar } from "notistack";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import { useForm } from "react-hook-form";
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import logger from "../../utils/logger.js";
import {
  FormProvider,
  RHFTextField,
  RHFSelect,
} from "../../components/hook-form";
import useApiCache from "../../hooks/useApiCache";

const DEFAULT_VALUES = {
  admissionYear: "",
  branch: "",
  admissionType: "",
  category: "",
  collegeId: "",
  branchChange: {
    year: "",
    branch: "",
    usn: "",
    collegeId: "",
  },
  documentsSubmitted: [],
};

export default function AdmissionDetails() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;

  const methods = useForm({ defaultValues: DEFAULT_VALUES });
  const { handleSubmit, setValue, watch, formState: { isSubmitting } } = methods;
  const documentsSubmitted = watch("documentsSubmitted");

  const { data, error, invalidate } = useApiCache(
    userId ? `/v1/admissions/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const admissionData = data?.data?.admissionDetails;
      if (admissionData) {
        Object.keys(DEFAULT_VALUES).forEach((key) => {
          if (key === "documentsSubmitted") {
            setValue(key, admissionData[key] || []);
          } else if (typeof admissionData[key] === "object" && admissionData[key] !== null) {
            Object.keys(admissionData[key]).forEach((subKey) => {
              setValue(`${key}.${subKey}`, admissionData[key][subKey] || "");
            });
          } else {
            setValue(key, admissionData[key] || "");
          }
        });
      }
    }
  }, [data, setValue]);

  useEffect(() => {
    if (error) {
        logger.error("Error fetching admission details:", error);
    }
  }, [error]);

  const onSubmit = async (formData) => {
    try {
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (key === 'branchChange') {
          acc[key] = Object.entries(value).reduce((branchAcc, [branchKey, branchValue]) => {
            if (branchValue !== null && branchValue !== '') branchAcc[branchKey] = branchValue;
            return branchAcc;
          }, {});
        } else if (key === 'documentsSubmitted') {
          acc[key] = value;
        } else if (value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const payload = { ...cleanedData, userId };
      await api.post("/v1/admissions", payload);
      enqueueSnackbar("Admission details saved successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      logger.error("Error saving admission details:", err);
      enqueueSnackbar(err.response?.data?.message || "Failed to save admission details.", { variant: "error" });
    }
  };

  const documentsList = ["SSLC/X Marks Card", "PUC/XII Marks Card", "Caste Certificate", "Migration Certificate"];

  return (
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12}>
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Admission Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: "grid", rowGap: 3, columnGap: 2, gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" } }}>
                <RHFTextField name="admissionYear" label="Admission Year" />
                <RHFTextField name="branch" label="Branch" />
                <RHFSelect name="admissionType" label="Type of Admission">
                  <option value="" />
                  {["COMEDK", "CET", "MANAGEMENT", "SNQ"].map((o) => <option key={o} value={o}>{o}</option>)}
                </RHFSelect>
                <RHFTextField name="category" label="Category" />
                <RHFTextField name="collegeId" label="College ID Number" />
              </Box>

              <Typography variant="h6" sx={{ mt: 3 }}>
                Change of Branch (if applicable)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: "grid", rowGap: 3, columnGap: 2, gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" } }}>
                <RHFTextField name="branchChange.year" label="Year of Change" />
                <RHFTextField name="branchChange.branch" label="New Branch" />
                <RHFTextField name="branchChange.usn" label="New USN" />
                <RHFTextField name="branchChange.collegeId" label="New College ID" />
              </Box>

              <Typography variant="h6" sx={{ mt: 3 }}>Documents Submitted</Typography>
              <Divider sx={{ mb: 3 }} />
              <FormControl component="fieldset">
                <FormGroup>
                  {documentsList.map((doc) => (
                    <FormControlLabel
                      key={doc}
                      control={
                        <Checkbox
                          checked={documentsSubmitted.includes(doc)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const updatedDocs = checked ? [...(documentsSubmitted || []), doc] : documentsSubmitted.filter((item) => item !== doc);
                            setValue("documentsSubmitted", updatedDocs);
                          }}
                        />
                      }
                      label={doc}
                    />
                  ))}
                </FormGroup>
              </FormControl>

              <Stack spacing={2} alignItems={{ xs: "stretch", sm: "flex-end" }} sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Save Changes
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
  );
}
