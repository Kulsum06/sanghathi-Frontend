import React, { useState } from "react";
import { useSnackbar } from "notistack";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Select,
  TextField,
  Typography,
  MenuItem,
  Avatar,
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";

import logger from "../../utils/logger.js";

const NewThreadDialog = ({
  open,
  onClose,
  users,
  currentUser,
  onSave,
  colorMode = "primary",
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState("");

  const [newThreadData, setNewThreadData] = useState({
    title: "",
    topic: "",
    author: currentUser._id,
    participants: [{ _id: currentUser._id, name: currentUser.name }],
  });

  const TOPICS = ["general", "attendance", "performance", "well-being"];

  const selectableUsers = users.filter(
    (user) =>
      user._id !== currentUser._id &&
      !newThreadData.participants.some(
        (participant) => participant._id === user._id
      )
  );

  const membersForDisplay =
    currentUser?.roleName === "faculty"
      ? newThreadData.participants.filter(
          (participant) => participant._id !== currentUser._id
        )
      : newThreadData.participants;

  const handleCloseDialog = () => {
    onClose();
    setNewThreadData({
      title: "",
      topic: "",
      author: currentUser._id,
      participants: [{ _id: currentUser._id, name: currentUser.name }],
    });
    setSearchTerm("");
  };

  const handleNewThreadChange = (e) => {
    setNewThreadData({ ...newThreadData, [e.target.name]: e.target.value });
  };

  const handleAddMember = (member) => {
    if (!newThreadData.participants.find((m) => m._id === member._id)) {
      setNewThreadData((prevState) => ({
        ...prevState,
        participants: [...prevState.participants, member],
      }));
    }

    setSearchTerm("");
  };

  const handleDeselectMember = (memberId) => {
    if (memberId === currentUser._id) return;

    setNewThreadData((prevState) => ({
      ...prevState,
      participants: prevState.participants.filter(
        (participant) => participant._id !== memberId
      ),
    }));
  };

  const handleSave = () => {
    onSave(newThreadData)
      .then(() => {
        enqueueSnackbar("Thread created successfully!", { variant: "success" });
        handleCloseDialog();
      })
      .catch((error) => {
        enqueueSnackbar("Error creating thread!", { variant: "error" });
        logger.error("Error creating new thread:", error);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      sx={{
        "& .MuiPaper-root": {
          width: "50vh",
        },
      }}
    >
      <DialogTitle>Create a new thread</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "column",
          }}
        >
          <Box sx={{ py: 1 }}>
            <TextField
              label="Title"
              name="title"
              value={newThreadData.title}
              onChange={handleNewThreadChange}
              fullWidth
              color={colorMode}
            />
          </Box>
          <Box sx={{ py: 1 }}>
            <InputLabel shrink htmlFor="topic-select" color={colorMode}>
              Topic
            </InputLabel>
            <Select
              name="topic"
              value={newThreadData.topic}
              onChange={handleNewThreadChange}
              inputProps={{ name: "topic", id: "topic-select" }}
              fullWidth
              color={colorMode}
            >
              <MenuItem value="" disabled>
                Topic
              </MenuItem>
              {TOPICS.map((topic, index) => (
                <MenuItem key={index} value={topic}>
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ py: 1 }}>
            <Autocomplete
              value={null}
              options={selectableUsers}
              getOptionLabel={(option) => option?.name || ""}
              inputValue={searchTerm}
              onInputChange={(_event, newInputValue) => {
                setSearchTerm(newInputValue);
              }}
              onChange={(_event, selectedUser) => {
                if (selectedUser) {
                  handleAddMember(selectedUser);
                }
              }}
              filterOptions={(options, state) => {
                const normalized = state.inputValue.trim().toLowerCase();
                if (!normalized) {
                  return options;
                }

                return options.filter((user) =>
                  `${user.name || ""} ${user.email || ""}`
                    .toLowerCase()
                    .includes(normalized)
                );
              }}
              noOptionsText={
                searchTerm.trim()
                  ? "No matching users found"
                  : "Start typing to search users"
              }
              renderOption={(props, option) => {
                const optionAvatarSrc = getAvatarSrc(option);

                return (
                  <Box component="li" {...props} key={option._id}>
                    <Avatar
                      src={optionAvatarSrc || undefined}
                      alt={option.name}
                      sx={{ width: 30, height: 30, mr: 1.2 }}
                    >
                      {!optionAvatarSrc
                        ? getAvatarFallbackText(option.name)
                        : null}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.name}
                      </Typography>
                      {option.email ? (
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search user"
                  color={colorMode}
                  helperText="Select users from the dropdown"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton color={colorMode} edge="end" tabIndex={-1}>
                          <Search />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </Box>

        <Typography variant="subtitle1" mt={2}>
          Members:
        </Typography>
        <List>
          {membersForDisplay.map((participant) => {
            const participantAvatarSrc = getAvatarSrc(participant);

            return (
              <ListItem
                key={participant._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    alt={participant.name}
                    src={participantAvatarSrc || undefined}
                  >
                    {!participantAvatarSrc
                      ? getAvatarFallbackText(participant.name)
                      : null}
                  </Avatar>
                  <ListItemText sx={{ ml: 2 }} primary={participant.name} />
                </Box>
                {participant._id !== currentUser._id && (
                  <IconButton
                    onClick={() => handleDeselectMember(participant._id)}
                  >
                    <Close />
                  </IconButton>
                )}
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button onClick={handleSave} color={colorMode}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewThreadDialog;
