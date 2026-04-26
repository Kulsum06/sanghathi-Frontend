import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Avatar,
  Paper,
  TablePagination,
  useTheme,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";
import useResponsive from "../../hooks/useResponsive";

const ThreadList = ({
  threads,
  currentUser,
  onThreadClick,
  onThreadDelete,
  colorMode = "primary",
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useResponsive("down", "sm");

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(threads.length / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, rowsPerPage, threads.length]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const rowsPerPageOptions = [10, 25, 50];

  const getStatusColor = (status) => {
    const normalizedStatus = (status || "").toLowerCase().trim();
    if (normalizedStatus === "open") {
      return "#4caf50";
    }
    if (normalizedStatus === "in progress") {
      return "#ff9800";
    }
    if (normalizedStatus === "closed") {
      return "#f44336";
    }
    return theme.palette.grey[500];
  };

  const getDisplayParticipants = (thread) => {
    const participants = Array.isArray(thread?.participants)
      ? thread.participants
      : [];

    if (currentUser?.roleName !== "faculty") {
      return participants;
    }

    const studentParticipants = participants.filter(
      (participant) => participant?.roleName === "student"
    );

    if (studentParticipants.length > 0) {
      return studentParticipants;
    }

    return participants.filter(
      (participant) => participant?._id !== currentUser?._id
    );
  };

  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Table
          sx={{
            tableLayout: { xs: "auto", md: "fixed" },
            minWidth: { xs: 620, md: "100%" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: { xs: "32%", md: "25%" } }}>Title</TableCell>
              <TableCell sx={{ width: { xs: "18%", md: "12%" } }}>Status</TableCell>
              <TableCell sx={{ width: "15%", display: { xs: "none", sm: "table-cell" } }}>
                Category
              </TableCell>
              <TableCell sx={{ width: "15%", display: { xs: "none", md: "table-cell" } }}>
                Date
              </TableCell>
              <TableCell sx={{ width: "13%", display: { xs: "none", sm: "table-cell" } }}>
                Members
              </TableCell>
              <TableCell sx={{ width: { xs: "50%", md: "20%" }, pl: 1 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {threads
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((thread) => (
                <TableRow key={thread._id}>
                  <TableCell>{thread.title}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        backgroundColor: getStatusColor(thread.status),
                        borderRadius: "12px",
                        px: 1.5,
                        py: 0.5,
                        color: "white",
                        fontSize: "0.8rem",
                      }}
                    >
                      {thread.status}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {thread.topic}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    <Box sx={{ display: "flex", cursor: "pointer", ml: -1 }}>
                      {getDisplayParticipants(thread).map((participant, idx) => {
                        const participantAvatarSrc = getAvatarSrc(participant);

                        return (
                        <Tooltip
                          key={participant._id}
                          title={participant.name}
                          placement="top"
                        >
                          <Avatar
                            src={participantAvatarSrc || undefined}
                            sx={{
                              ml: idx === 0 ? 0 : -1.5,
                              zIndex: 100 - idx,
                              width: 32,
                              height: 32,
                              fontSize: "0.8rem",
                            }}
                            alt={participant.name}
                          >
                            {!participantAvatarSrc
                              ? getAvatarFallbackText(participant.name)
                              : null}
                          </Avatar>
                        </Tooltip>
                        );
                      })}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        gap: 1,
                        alignItems: "center",
                        pl: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        color={colorMode}
                        onClick={() => onThreadClick(thread)}
                        sx={{
                          px: { xs: 1.25, sm: 2 },
                          py: 0.5,
                          fontSize: "0.8rem",
                        }}
                        size={isMobile ? "small" : "medium"}
                      >
                        View
                      </Button>
                      {thread.status === "closed" && (
                        <Button
                          variant="outlined"
                          sx={{
                            backgroundColor: "#f44336",
                            color: "white",
                            px: { xs: 1.25, sm: 1.5 },
                            py: 0.5,
                            fontSize: "0.8rem",
                            minWidth: "auto",
                            "&:hover": {
                              backgroundColor: "error.dark",
                            },
                            "& .MuiButton-startIcon": {
                              mr: 0.5,
                            },
                          }}
                          onClick={() => onThreadDelete(thread)}
                          startIcon={<Delete fontSize="small" />}
                          size={isMobile ? "small" : "medium"}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "8px",
          }}
        >
          <TablePagination
            rowsPerPageOptions={isMobile ? [10, 25] : rowsPerPageOptions}
            component="div"
            count={threads.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    </TableContainer>
  );
};

export default ThreadList;
