import React, { useEffect, useContext } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm, useFieldArray } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, Stack, Button, IconButton, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { useSearchParams } from "react-router-dom";
import useApiCache from "../../hooks/useApiCache";

const EMPTY_ROW = { portal: "", title: "", startDate: null, completedDate: null, score: null, certificateLink: "" };

export default function Mooc() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const userId = menteeId || user?._id;

  const methods = useForm({ defaultValues: { mooc: [{ ...EMPTY_ROW }] } });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "mooc" });

  const { data, loading, error, invalidate } = useApiCache(
    userId ? `/mooc-data/mooc/${userId}` : null
  );

  useEffect(() => {
    if (data !== undefined) {
      const moocList = data?.data?.mooc;
      if (Array.isArray(moocList) && moocList.length > 0) {
        const formatted = moocList.map((m) => ({
          ...m,
          startDate: m.startDate ? new Date(m.startDate).toISOString().split("T")[0] : "",
          completedDate: m.completedDate ? new Date(m.completedDate).toISOString().split("T")[0] : "",
        }));
        reset({ mooc: formatted });
      } else {
        reset({ mooc: [{ ...EMPTY_ROW }] });
      }
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) enqueueSnackbar("Error fetching MOOC data", { variant: "error" });
  }, [error, enqueueSnackbar]);

  const onSubmit = async (formData) => {
    try {
      await api.post("/mooc-data/mooc", { mooc: formData.mooc, userId: user._id });
      enqueueSnackbar("MOOC data updated successfully!", { variant: "success" });
      invalidate();
    } catch (err) {
      enqueueSnackbar("An error occurred while processing the request", { variant: "error" });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {fields.map((item, index) => (
            <Grid container spacing={2} key={item.id} alignItems="center" sx={{ mb: 1, mt: 1 }}>
              <Grid item xs={1}>
                <TextField disabled value={index + 1} label="Sl. No." variant="outlined" />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`mooc[${index}].portal`} label="Course Portal" fullWidth />
              </Grid>
              <Grid item xs={3}>
                <RHFTextField name={`mooc[${index}].title`} label="MOOC Title" fullWidth />
              </Grid>
              <Grid item xs={2}>
                <RHFTextField name={`mooc[${index}].startDate`} label="Start Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <RHFTextField name={`mooc[${index}].completedDate`} label="Completed Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <RHFTextField name={`mooc[${index}].score`} label="Score" fullWidth />
              </Grid>
              <Grid item xs={5}>
                <RHFTextField name={`mooc[${index}].certificateLink`} label="Certificate Link" fullWidth />
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => remove(index)} sx={{ mt: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" onClick={() => append({ ...EMPTY_ROW })} sx={{ mt: 2, display: "block", mx: "auto" }}>
              Add Row
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Box display="flex" gap={1}>
                {import.meta.env.MODE === "development" && (
                  <LoadingButton variant="outlined" onClick={() => reset({ mooc: [{ ...EMPTY_ROW }] })}>Reset</LoadingButton>
                )}
                <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>Save</LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}
