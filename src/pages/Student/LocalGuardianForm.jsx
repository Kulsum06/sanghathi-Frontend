import React, { useEffect, useState, useContext } from "react";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { Box, Grid, Card, Stack, Typography, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/axios";

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

const LABELS = {
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  email: "Email",
  relationWithGuardian: "Relation with Guardian",
  mobileNumber: "Mobile Number",
  phoneNumber: "Phone Number",
  residenceAddress: "Residence Address",
  taluka: "Taluka",
  district: "District",
  state: "State",
  pincode: "Pincode",
};

export default function LocalGuardianForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Check if the current user is faculty
  const isFaculty = user?.roleName === "faculty";

  // Fields should be editable only if user is not faculty
  const isEditable = !isFaculty;

  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const fetchLocalGuardian = async () => {
      try {
        const userId = menteeId || user?._id;
        if (!userId) return;

        const response = await api.get(`/v1/local-guardians/${userId}`);

        if (response.data.status === "success") {
          if (response.data.data?.localGuardian) {
            reset(response.data.data.localGuardian);
          } else {
            reset(DEFAULT_VALUES);
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          reset(DEFAULT_VALUES);
        } else {
          enqueueSnackbar("Error fetching guardian details", {
            variant: "error",
          });
        }
      } finally {
        setIsDataFetched(true);
      }
    };

    fetchLocalGuardian();
  }, [menteeId, user, reset, enqueueSnackbar]);

  const onSubmit = async (data) => {
    try {
      const userId = menteeId || user?._id;
      if (!userId) {
        enqueueSnackbar("User ID is required", { variant: "error" });
        return;
      }

      await api.post("/v1/local-guardians", { ...data, userId });
      enqueueSnackbar("Guardian details saved successfully!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Error saving guardian details",
        { variant: "error" }
      );
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {isFaculty && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
          <Typography variant="body2" color="warning.dark">
            You are viewing this student profile in read-only mode. Only
            students can edit their own profiles.
          </Typography>
        </Box>
      )}
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Local Guardian Details
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {!isDataFetched ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography>Loading guardian details...</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {Object.keys(DEFAULT_VALUES).map((field) => (
                <Grid
                  item
                  xs={12}
                  md={field === "residenceAddress" ? 12 : 4}
                  key={field}
                >
                  <RHFTextField
                    name={field}
                    id={field} // ✅ Added id for accessibility + autofill
                    label={LABELS[field] || field}
                    fullWidth
                    multiline={field === "residenceAddress"}
                    rows={field === "residenceAddress" ? 4 : 1}
                    disabled={!isEditable}
                    InputProps={{
                      readOnly: !isEditable,
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                <LoadingButton
                  variant="outlined"
                  onClick={() => reset(DEFAULT_VALUES)}
                  disabled={isSubmitting || !isEditable}
                >
                  Reset
                </LoadingButton>
                {isEditable && (
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                  >
                    Save
                  </LoadingButton>
                )}
              </Box>
            </Stack>
          </>
        )}
      </Card>
    </FormProvider>
  );
}


