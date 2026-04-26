import React, { useState, useCallback } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TableContainer,
  Paper,
  useTheme,
  Avatar,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Typography,
  TablePagination,
  Divider,
  Select,
  TextField,
  Button,
  Checkbox,
  Stack,
  Chip,
  Card,
  CardHeader,
  CardContent,
  InputAdornment,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { useSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

import ConfirmationDialog from "./ConfirmationDialog";
import { useEffect } from "react";

import api from "../../utils/axios";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";

import logger from "../../utils/logger.js";
function UserList({ onEdit }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPageOptions = [20, 10, 25];
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const tableHeaderColor = isLight ? theme.palette.primary.main : theme.palette.info.main;

  const getAllUsers = useCallback(async () => {
    try {
      const pageSize = 200;
      let pageNumber = 1;
      let totalPages = 1;
      const aggregatedUsers = [];

      do {
        const response = await api.get("/users", {
          params: {
            page: pageNumber,
            limit: pageSize,
            fields:
              "_id,name,email,phone,avatar,photo,role,roleName,profile,status,lastActivity,department,sem,usn,cabin",
            includeProfiles: true,
          },
        });

        if (response.data.status !== "success") {
          throw new Error("Error fetching users");
        }

        const usersPage = response.data?.data?.users || [];
        aggregatedUsers.push(...usersPage);

        totalPages = response.data?.pagination?.totalPages || 1;
        pageNumber += 1;
      } while (pageNumber <= totalPages);

      logger.info("All users data:", aggregatedUsers);
      setUsers(aggregatedUsers);
    } catch (error) {
      logger.info(error);
      enqueueSnackbar("Error fetching users", { variant: "error" });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleEdit = (user) => {
    onEdit(user);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleClose();
  };

  const handleConfirmDelete = async () => {
    try {
      const deleteUserAndRelatedData = async (userId) => {
        const deletePromises = [
          // User core data
          api.delete(`/users/${userId}`), // Delete user account
          api.delete(`/notifications/${userId}`), // Delete user notifications
          
          // Student related data
          api.delete(`/students/academic/${userId}`), // Delete academic data
          api.delete(`/activity-data/activity${userId}`), //delete activity data
          api.delete(`/v1/admissions/${userId}`), // Delete admission data
          api.delete(`/students/attendance/${userId}`), // Delete attendance data
          api.delete(`/career-counselling/career/${userId}`), // Delete career data
          api.delete(`/career-counselling/clubevent/${userId}`), // Delete club event data
          api.delete(`/career-counselling/clubs/${userId}`), // Delete clubs data
          api.delete(`/v1/contact-details/${userId}`), // Delete contact details
          api.delete(`/students/external/${userId}`), // Delete external marks
          api.delete(`/hobbies-data/${userId}`), // Delete hobbies data
          api.delete(`/students/Iat/${userId}`), // Delete IAT marks
          api.delete(`/internship/${userId}`), // Delete internship data
          api.delete(`/v1/local-guardians/${userId}`), // Delete local guardian data
          api.delete(`/meetings/${userId}`), // Delete local guardian data
          
          // Faculty related data
          api.delete(`/faculty/profile/${userId}`), // Delete faculty profile if exists
        ];
  
        try {
          await Promise.allSettled(deletePromises);
          logger.info(`Successfully processed deletion for user ${userId}`);
        } catch (error) {
          logger.error(`Error deleting data for user ${userId}:`, error);
          throw error;
        }
      };
  
      if (selectedUsers.length > 0) {
        // Bulk delete
        await Promise.all(selectedUsers.map(deleteUserAndRelatedData));
        setUsers((prevUsers) =>
          prevUsers.filter((user) => !selectedUsers.includes(user._id))
        );
        enqueueSnackbar(`Successfully deleted ${selectedUsers.length} users`, { 
          variant: "success" 
        });
        setSelectedUsers([]);
      } else if (selectedUser) {
        // Single user delete
        await deleteUserAndRelatedData(selectedUser._id);
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== selectedUser._id)
        );
        enqueueSnackbar(`Successfully deleted user ${selectedUser.name}`, { 
          variant: "success" 
        });
      }
  
      setOpenDialog(false);
      handleClose();
  
    } catch (error) {
      logger.error("Delete operation failed:", error);
      enqueueSnackbar(error.message || "Failed to delete user(s)", {
        variant: "error"
      });
    }
  };

  const handleClick = (event, user) => {
    setSelectedUser(user);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterRole("all");
    setFilterDepartment("all");
    setFilterSemester("all");
  };

  const filteredUsers = users.filter((user) => {
    const userName = user.name || "";
    const userEmail = user.email || "";
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.roleName === filterRole;
    const matchesDepartment = filterDepartment === "all" || user.department === filterDepartment;
    const matchesSemester = filterSemester === "all" || user.sem === filterSemester;

    return matchesSearch && matchesRole && matchesDepartment && matchesSemester;
  });

  const uniqueDepartments = ["all", ...new Set(users.map(user => user.department).filter(Boolean))];
  const uniqueSemesters = ["all", ...new Set(users.map(user => user.sem).filter(Boolean))];
  const uniqueRoles = ["all", ...new Set(users.map(user => user.roleName).filter(Boolean))];

  const selectedFilteredCount = filteredUsers.filter((filteredUser) =>
    selectedUsers.includes(filteredUser._id)
  ).length;

  const allFilteredSelected =
    filteredUsers.length > 0 && selectedFilteredCount === filteredUsers.length;
  const someFilteredSelected =
    selectedFilteredCount > 0 && selectedFilteredCount < filteredUsers.length;

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const filteredIds = filteredUsers.map((filteredUser) => filteredUser._id);
      setSelectedUsers((prev) => Array.from(new Set([...prev, ...filteredIds])));
      return;
    }

    const filteredIdSet = new Set(filteredUsers.map((filteredUser) => filteredUser._id));
    setSelectedUsers((prev) => prev.filter((id) => !filteredIdSet.has(id)));
  };

  return (
    <Card>
      <Box 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 0 },
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
          View Users
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="contained"
            color="error"
            disabled={selectedUsers.length === 0}
            onClick={() => setOpenDialog(true)}
            startIcon={<DeleteIcon />}
            size="small"
            fullWidth={isSmDown}
          >
            Delete Selected ({selectedUsers.length})
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterListIcon />}
            size="small"
            fullWidth={isSmDown}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </Stack>
      </Box>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { xs: "stretch", sm: "center" } }}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                endAdornment: searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <ClearIcon />
                  </IconButton>
                ),
              }}
            />
            {(searchQuery || filterRole !== "all" || filterDepartment !== "all" || filterSemester !== "all") && (
              <Button
                variant="text"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>

          {showFilters && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.info.main, 0.05),
              borderRadius: 1
            }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  size="small"
                  sx={{ minWidth: { xs: "100%", sm: 150 } }}
                >
                  {uniqueRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  size="small"
                  sx={{ minWidth: { xs: "100%", sm: 150 } }}
                >
                  {uniqueDepartments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  size="small"
                  sx={{ minWidth: { xs: "100%", sm: 150 } }}
                >
                  {uniqueSemesters.map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      {sem === "all" ? "All Semesters" : `Sem ${sem}`}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Box>
          )}

          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: { xs: 840, md: "100%" } }}>
              <TableHead sx={{ backgroundColor: alpha(tableHeaderColor, 0.1) }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allFilteredSelected}
                      indeterminate={someFilteredSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Email</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Department</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Semester</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No users found matching your criteria
                      </Typography>
                      <Button
                        variant="text"
                        onClick={clearFilters}
                        startIcon={<ClearIcon />}
                        sx={{ mt: 1 }}
                      >
                        Clear Filters
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => {
                      const avatarSrc = getAvatarSrc(user);

                      return (
                      <TableRow 
                        key={user._id}
                        hover
                        sx={{ 
                          '&:hover': {
                            backgroundColor: isLight 
                              ? alpha(theme.palette.primary.main, 0.05)
                              : alpha(theme.palette.info.main, 0.05)
                          }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                            }}
                          >
                            <Avatar
                              alt={user.name}
                              src={avatarSrc || undefined}
                              sx={{ width: 40, height: 40 }}
                            >
                              {!avatarSrc ? getAvatarFallbackText(user.name) : null}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {user.name || "N/A"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{user.email || "N/A"}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{user.phone || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.roleName || "N/A"}
                            size="small"
                            sx={{
                              backgroundColor: isLight 
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.info.main, 0.1),
                              color: isLight 
                                ? theme.palette.primary.main
                                : theme.palette.info.main
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{user.department || "N/A"}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{user.sem || "N/A"}</TableCell>
                        <TableCell>
                          <IconButton onClick={(event) => handleClick(event, user)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                          >
                            <MenuItem onClick={() => handleEdit(selectedUser)}>
                              <ListItemIcon>
                                <EditIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary="Edit" />
                            </MenuItem>
                            <MenuItem onClick={() => handleDelete(selectedUser)}>
                              <ListItemIcon>
                                <DeleteIcon
                                  fontSize="small"
                                  sx={{ color: "error.main" }}
                                />
                              </ListItemIcon>
                              <ListItemText primary="Delete" />
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
            <Divider />
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
                alignItems: "center",
                padding: "8px",
              }}
            >
              <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={isSmDown ? "Rows" : "Rows per page:"}
              />
            </Box>
          </TableContainer>
        </Stack>
      </CardContent>

      <ConfirmationDialog
        open={openDialog}
        title="Delete User(s)"
        message={
          selectedUsers.length > 0
            ? `Are you sure you want to delete ${selectedUsers.length} selected user(s)? This will permanently delete all their data across the platform.`
            : `Are you sure you want to delete ${selectedUser?.name}? This will permanently delete all their data across the platform.`
        }
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDialog}
      />
    </Card>
  );
}

export default React.memo(UserList);
