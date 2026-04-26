import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Container,
  useTheme,
  TextField,
  MenuItem,
  Stack,
  InputAdornment,
} from "@mui/material";

import { useSnackbar } from "notistack";

import NewThreadDialog from "./NewThreadDialog";
import ThreadList from "./ThreadList";
import Page from "../../components/Page";

import { Add } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import api from "../../utils/axios";

import { AuthContext } from "../../context/AuthContext";

import logger from "../../utils/logger.js";

const dedupeUsersById = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const id = item?._id;
    if (!id || seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
};

const MAX_PAGES_TO_FETCH = 25;

const LoadingSpinner = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
    }}
  >
    <CircularProgress />
  </Box>
);

const Thread = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [threads, setThreads] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const colorMode = isLight ? 'primary' : 'info';

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const categoryOptions = Array.from(
    new Set(threads.map((thread) => thread?.topic).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const filteredThreads = threads.filter((thread) => {
    const normalizedStatus = (thread?.status || "").toLowerCase().trim();
    const normalizedTopic = (thread?.topic || "").toLowerCase();
    const normalizedTitle = (thread?.title || "").toLowerCase();
    const participantMatches = (thread?.participants || []).some((participant) =>
      (participant?.name || "").toLowerCase().includes(normalizedSearchTerm)
    );
    const searchMatches =
      !normalizedSearchTerm ||
      normalizedTitle.includes(normalizedSearchTerm) ||
      normalizedTopic.includes(normalizedSearchTerm) ||
      participantMatches;

    const statusMatches =
      !statusFilter || normalizedStatus === statusFilter.toLowerCase();
    const categoryMatches =
      !categoryFilter || (thread?.topic || "") === categoryFilter;

    return searchMatches && statusMatches && categoryMatches;
  });

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`users/${user._id}/threads`, {
        params: {
          page: 1,
          limit: 100,
        },
      });
      if (response.data.status === "success") {
        setThreads(response.data.data.threads);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      logger.error("Error fetching threads:", error);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    try {
      const shouldScopeToStudents = ["faculty", "hod", "director"].includes(user?.roleName);

      if (user?.roleName === "faculty") {
        const mentees = [];
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages && page <= MAX_PAGES_TO_FETCH) {
          const response = await api.get(`/mentorship/${user._id}/mentees-with-profiles`, {
            params: {
              page,
              limit: 500,
            },
          });

          const fetchedMentees = Array.isArray(response?.data?.mentees)
            ? response.data.mentees
            : [];

          mentees.push(...fetchedMentees);
          totalPages = Number(response?.data?.pagination?.totalPages) || 1;
          page += 1;
        }

        setUsers(dedupeUsersById(mentees));
        return;
      }

      const fetchedUsers = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages && page <= MAX_PAGES_TO_FETCH) {
        const response = await api.get("users", {
          params: {
            page,
            limit: 500,
            role: shouldScopeToStudents ? "student" : undefined,
            fields: "_id,name,email,roleName,avatar,photo",
            includeProfiles: true,
          },
        });

        if (response?.data?.status !== "success") {
          break;
        }

        const currentPageUsers = Array.isArray(response?.data?.data?.users)
          ? response.data.data.users
          : [];

        fetchedUsers.push(...currentPageUsers);
        totalPages = Number(response?.data?.pagination?.totalPages) || 1;
        page += 1;
      }

      setUsers(dedupeUsersById(fetchedUsers));
    } catch (error) {
      logger.error("Error fetching Users:", error);
    }
  }, [user?._id, user?.roleName]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleThreadClick = (thread) => {
    navigate(`/threads/${thread._id}`);
  };

  const handleAddNewThread = async (newThreadData) => {
    setIsLoading(true);
    try {
      const payload = {
        author: typeof newThreadData.author === "string"
          ? newThreadData.author
          : newThreadData.author?._id,
        participants: (newThreadData.participants || [])
          .map((participant) =>
            typeof participant === "string" ? participant : participant?._id
          )
          .filter(Boolean),
        title: (newThreadData.title || "").trim(),
        topic: (newThreadData.topic || "").trim(),
      };

      const response = await api.post("threads", payload);
      if (response.data.status === "success") {
        const newThread = response.data.data.thread;
        setThreads((prevThreads) => [
          newThread,
          ...prevThreads.filter((thread) => thread._id !== newThread._id),
        ]);
        setIsLoading(false);
        if (newThread?._id) {
          navigate(`/threads/${newThread._id}`);
        }
        return Promise.resolve(newThread);
      }
    } catch (error) {
      setIsLoading(false);
      return Promise.reject(error);
    }
  };

  const handleThreadEdit = async (thread) => {
    logger.info("Edit requested for thread", { threadId: thread._id });
    enqueueSnackbar("Thread edit is not available yet.", { variant: "info" });
  };

  const handleThreadDelete = async (thread) => {
    try {
      logger.info(`Delete thread ${thread._id}`);
      const response = await api.delete(`/threads/${thread._id}`);
      if (response.status === 204) {
        setThreads((prevThreads) =>
          prevThreads.filter((curr) => curr._id !== thread._id)
        );
        enqueueSnackbar("Thread Deleted successfully!", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      logger.error("ERROR OCCURED 💥 ", error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  return (
    <Page title="Thread">
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 1, sm: 0 },
              p: 2,
            }}
          >
            <Typography variant="h4" component="h1">
              Threads
            </Typography>
            <Button
              variant="contained"
              color={colorMode}
              onClick={handleOpenDialog}
              startIcon={<Add />}
              sx={{ mt: 1, mb: 2, width: { xs: "100%", sm: "auto" } }}
            >
              Add new
            </Button>
          </Box>
          <Divider />
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 1.25,
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search by title, topic, or participant"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                sx={{ minWidth: { sm: 150 } }}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in progress">In Progress</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                sx={{ minWidth: { sm: 170 } }}
              >
                <MenuItem value="">All categories</MenuItem>
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                color={colorMode}
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setCategoryFilter("");
                }}
              >
                Clear
              </Button>
            </Stack>
          </Box>
          <Divider />
          {isLoading ? (
            <LoadingSpinner />
          ) : threads.length === 0 ? (
            <Typography variant="h6" textAlign="center" mt={2}>
              No threads found. Create a new thread to get started!
            </Typography>
          ) : filteredThreads.length === 0 ? (
            <Typography variant="h6" textAlign="center" mt={2}>
              No threads match the selected search or filters.
            </Typography>
          ) : (
            <ThreadList
              threads={filteredThreads}
              currentUser={user}
              onThreadClick={handleThreadClick}
              onThreadEdit={handleThreadEdit}
              onThreadDelete={handleThreadDelete}
              colorMode={colorMode}
            />
          )}
          <NewThreadDialog
            open={openDialog}
            onClose={handleCloseDialog}
            users={users}
            currentUser={user}
            onSave={handleAddNewThread}
            colorMode={colorMode}
          />
        </Box>
      </Container>
    </Page>
  );
};
export default React.memo(Thread);
