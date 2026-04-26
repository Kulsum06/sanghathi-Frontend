// MentorAssignmentDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import MentorSuggestionMenu from "./MentorSuggestionMenu";

import logger from "../../utils/logger.js";
const MentorAssignmentDialog = ({ open, studentIds, onClose, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedMentor, setSelectedMentor] = useState({ name: "" }); // Initialize with empty name
  const [anchorEl, setAnchorEl] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await api.get("/users", {
          params: {
            role: "faculty",
            page: 1,
            limit: 500,
            fields: "_id,name,email",
            includeProfiles: false,
          },
        });
        const { data } = response.data;
        setMentors(data.users);
      } catch (error) {
        logger.error(error);
      }
    };

    if (open) {
      fetchMentors();
    }
  }, [open]);

  const handleMentorNameChange = (event) => {
    const value = event.target.value;
    setSelectedMentor({ ...selectedMentor, name: value });
    
    if (value.trim() !== "") {
      // Updated filter to search anywhere in the name
      setSuggestions(
        mentors.filter((mentor) =>
          mentor.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.post("/mentors/batch", {
        mentorId: selectedMentor._id,
        menteeIds: studentIds,
        startDate: new Date().toISOString(),
      });

      // Call onSuccess with the updated data
      onSuccess && onSuccess({
        mentorId: selectedMentor._id,
        mentorName: selectedMentor.name,
        affectedStudentIds: studentIds
      });

      handleCancel();
    } catch (error) {
      logger.error("Error assigning mentor:", error);
      enqueueSnackbar("Failed to assign mentor", { variant: "error" });
    }
  };

  const handleCancel = () => {
    setSelectedMentor({ name: "" });
    setSuggestions([]);
    setAnchorEl(null);
    onClose();
  };

  const handleMentorSelect = (mentor) => {
    setSelectedMentor(mentor);
    setSuggestions([]);
    setAnchorEl(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="mentor-dialog-title"
      maxWidth="sm"
      PaperProps={{
        sx: {
          position: 'relative',
          minHeight: '300px'  // Ensure enough space for suggestions
        }
      }}
    >
      <DialogTitle>
        Assign Mentor to {studentIds.length} Selected Student(s)
      </DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Search Mentor"
            type="text"
            fullWidth
            value={selectedMentor.name || ""}
            onChange={handleMentorNameChange}
          />
          {suggestions.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: '250px',  // Show more items
                overflow: 'auto',
                borderRadius: 1,
                boxShadow: (theme) => theme.shadows[5]
              }}
            >
              <MentorSuggestionMenu 
                suggestions={suggestions}
                onMentorSelect={handleMentorSelect}
              />
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!selectedMentor._id}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MentorAssignmentDialog;