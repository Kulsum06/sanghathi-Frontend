import { useState, useEffect, React } from "react";
import ExcelJS from 'exceljs';

import {
  Avatar,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Container,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  InputAdornment,
  Grid,
  IconButton,
  MenuItem,
  Button,
  TextField,
  Chip,
  Stack,
  Badge,
  Divider,
  Card,
  AvatarGroup
} from "@mui/material";
import { 
  Search as SearchIcon, 
  GetApp as GetAppIcon,
  FilterList as FilterListIcon,
  CalendarMonth as CalendarIcon,
  Category as CategoryIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  Chat as ChatIcon
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

import Page from "../../components/Page";
import api from "../../utils/axios"; // replace with your actual API path
import { useSnackbar } from "notistack";
import { MessageList } from "../Thread/Message/Message";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";
import useResponsive from "../../hooks/useResponsive";

const baseURL = import.meta.env.VITE_PYTHON_API;

import logger from "../../utils/logger.js";
const Report = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const isMobile = useResponsive("down", "sm");
  const [threads, setThreads] = useState([]);
  const [openDialogThreadId, setOpenDialogThreadId] = useState(null);
  const [openChatDialogThreadId, setOpenChatDialogThreadId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { enqueueSnackbar } = useSnackbar();

  // Get the color based on the current theme mode
  const activeColor = isLight ? theme.palette.primary.main : theme.palette.info.main;

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await api.get("threads", {
          params: {
            page: 1,
            limit: 300,
          },
        });
        if (response.status === 200) {
          const { data } = response.data;
          logger.info("All threads:", data.threads);
          logger.info("Thread statuses:", data.threads.map(t => t.status));
          setThreads(data.threads);
        }
      } catch (error) {
        logger.error(error);
      }
    };

    fetchThreads();
  }, []);

  const handleFromDateChange = (event) => {
    setFromDate(event.target.value);
  };

  const handleToDateChange = (event) => {
    setToDate(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const getThreadSemesters = (thread) => {
    const participants = Array.isArray(thread?.participants)
      ? thread.participants
      : [];

    return participants
      .map(
        (participant) =>
          participant?.profile?.sem ||
          participant?.sem ||
          participant?.semester ||
          participant?.studentProfile?.sem
      )
      .filter(Boolean)
      .map((semValue) => String(semValue).trim());
  };

  const semesterOptions = Array.from(
    new Set(
      threads.flatMap((thread) => getThreadSemesters(thread))
    )
  ).sort((a, b) => {
    const semA = Number(a);
    const semB = Number(b);
    if (Number.isNaN(semA) || Number.isNaN(semB)) {
      return String(a).localeCompare(String(b));
    }
    return semA - semB;
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const filteredThreads = threads.filter((thread) => {
    // Get properly normalized values for comparison
    const normalizedStatus = thread.status ? thread.status.toLowerCase().trim() : '';
    
    // Only filter out threads that are explicitly "open" or "in progress" AND have no topic/category
    if ((normalizedStatus === 'open' || normalizedStatus === 'in progress') && !thread.topic) {
      return false;
    }

    // Rest of filtering logic continues...
    const hasMatchingParticipant = thread.participants?.some((participant) =>
      participant.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasMatchingTitle = thread.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const toDateObj = toDate ? new Date(toDate) : null;

    const threadOpenDate = thread.createdAt ? new Date(thread.createdAt) : null;

    let dateMatches = true;

    if (fromDateObj && toDateObj) {
      dateMatches =
        threadOpenDate &&
        threadOpenDate >= fromDateObj &&
        threadOpenDate <= toDateObj;
    } else if (fromDateObj) {
      dateMatches =
        threadOpenDate &&
        threadOpenDate.toDateString() === fromDateObj.toDateString();
    } else if (toDateObj) {
      dateMatches = threadOpenDate && threadOpenDate <= toDateObj;
    }

    const categoryMatches =
      !selectedCategory || thread.topic === selectedCategory;

    const threadSemesters = getThreadSemesters(thread);
    const semesterMatches =
      !selectedSemester || threadSemesters.includes(String(selectedSemester));
    
    // Normalize the selected status for comparison
    const normalizedSelectedStatus = selectedStatus ? selectedStatus.toLowerCase().trim() : '';
    let statusMatches = true;
    
    if (normalizedSelectedStatus === 'open') {
      // If "Open" is selected, show both "open" and "in progress" threads
      statusMatches = normalizedStatus === 'open' || normalizedStatus === 'in progress';
    } else if (normalizedSelectedStatus === 'in progress') {
      statusMatches = normalizedStatus === 'in progress';
    } else if (normalizedSelectedStatus === 'closed') {
      statusMatches = normalizedStatus === 'closed';
    }
    
    // If no status filter is selected, show all statuses
    if (!normalizedSelectedStatus) {
      statusMatches = true;
    }

    // If search term is empty, show all matching threads
    if (!searchTerm) {
      return dateMatches && categoryMatches && semesterMatches && statusMatches;
    }

    // If search term exists, check for matches
    return (
      (hasMatchingParticipant || hasMatchingTitle) &&
      dateMatches &&
      categoryMatches &&
      semesterMatches &&
      statusMatches
    );
  });

  useEffect(() => {
    setPage(0);
  }, [searchTerm, fromDate, toDate, selectedCategory, selectedStatus, selectedSemester]);

  const paginatedThreads = filteredThreads.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = (threadId) => {
    setOpenDialogThreadId(threadId);
  };

  const handleCloseDialog = () => {
    setOpenDialogThreadId(null);
  };

  const handleOpenChatDialog = async (threadId) => {
    setOpenChatDialogThreadId(threadId);
    try {
      const response = await api.get(`/threads/${threadId}`, {
        params: {
          messagePage: 1,
          messageLimit: 150,
        },
      });
      if (response.status === 200) {
        const { data } = response.data;
        setChatMessages(data.thread.messages);
      }
    } catch (error) {
      logger.error(error);
      enqueueSnackbar("Error loading chat messages", { variant: "error" });
    }
  };

  const handleCloseChatDialog = () => {
    setOpenChatDialogThreadId(null);
    setChatMessages([]);
  };

  const statusColors = {
    open: "#4caf50",
    "In Progress": "#ff9800",
    closed: "#f44336",
  };

  const getStatusBgColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "open" || statusLower === "in progress") {
      return isLight ? alpha('#4caf50', 0.15) : alpha('#4caf50', 0.25);
    } else if (statusLower === "closed") {
      return isLight ? alpha('#f44336', 0.15) : alpha('#f44336', 0.25);
    }
    return isLight ? alpha('#9e9e9e', 0.15) : alpha('#9e9e9e', 0.25);
  };
  
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "open" || statusLower === "in progress") {
      return '#4caf50';
    } else if (statusLower === "closed") {
      return '#f44336';
    }
    return '#9e9e9e';
  };

  const handleExportToExcel = async () => {
    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Threads Report');

      // Define columns with headers and widths
      worksheet.columns = [
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Summary', key: 'summary', width: 50 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Opened Date', key: 'openedDate', width: 20 },
        { header: 'Closed Date', key: 'closedDate', width: 20 },
        { header: 'Author', key: 'author', width: 20 },
        { header: 'Members', key: 'members', width: 40 }
      ];

      // Add data rows
      filteredThreads.forEach(thread => {
        worksheet.addRow({
          title: thread.title || 'N/A',
          summary: thread.description || 'N/A',
          status: thread.status || 'N/A',
          category: thread.topic || 'Uncategorized',
          openedDate: thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : 'N/A',
          closedDate: thread.closedAt ? new Date(thread.closedAt).toLocaleDateString() : 'N/A',
          author: thread.author?.name || 'N/A',
          members: thread.participants?.map(p => p.name).join(', ') || 'N/A'
        });
      });

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Threads_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      enqueueSnackbar("Report exported successfully!", { 
        variant: "success",
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    } catch (error) {
      logger.error("Error exporting to Excel:", error);
      enqueueSnackbar("Error exporting report", { 
        variant: "error",
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSelectedSemester("");
  };

  return (
    <Page title="Thread">
      <Container
        maxWidth="xl"
        sx={{ px: { xs: 1.5, sm: 3 }, overflowX: "hidden", overflowY: "auto" }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mt: 2,
            mb: 4,
            borderRadius: 2,
            backgroundColor: isLight 
              ? 'rgba(255, 255, 255, 0.8)'
              : alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
            boxShadow: isLight
              ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
              : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box 
            sx={{ 
              textAlign: 'center',
              mb: 3
            }}
          >
            <Typography 
              variant="h4"
              sx={{
                fontSize: { xs: "1.65rem", sm: "2.125rem" },
                fontWeight: 'bold',
                background: isLight 
                  ? `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                  : `-webkit-linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Threads Report
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              View and export thread data from your system
            </Typography>
          </Box>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mb: 3 }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              placeholder="Search by title or participant..."
              fullWidth
              size="small"
              sx={{
                maxWidth: { sm: 300, md: 400 },
                backgroundColor: isLight 
                  ? alpha(theme.palette.common.white, 0.5)
                  : alpha(theme.palette.background.paper, 0.5),
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: activeColor,
                  },
                }
              }}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack 
              direction="row" 
              spacing={1}
              sx={{ 
                flexWrap: 'wrap',
                rowGap: 1,
                justifyContent: { xs: 'space-between', sm: 'flex-end' }
              }}
            >
              <Button
                variant="outlined"
                color={isLight ? "primary" : "info"}
                onClick={toggleFilters}
                startIcon={<FilterListIcon />}
                size="small"
                sx={{
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                  width: { xs: 'calc(50% - 4px)', sm: 'auto' },
                }}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>

              <Button
                variant="contained"
                color={isLight ? "primary" : "info"}
                onClick={handleExportToExcel}
                startIcon={<GetAppIcon />}
                size="small"
                sx={{
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                  width: { xs: 'calc(50% - 4px)', sm: 'auto' },
                }}
              >
                Export to Excel
              </Button>
            </Stack>
          </Stack>

          {showFilters && (
            <Card
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: isLight 
                  ? alpha(theme.palette.primary.main, 0.04)
                  : alpha(theme.palette.info.main, 0.08),
                borderRadius: 2,
              }}
            >
              <Stack 
                direction="row" 
                sx={{ 
                  mb: 2,
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Filter Options
                </Typography>
                {(selectedCategory || selectedStatus || selectedSemester || fromDate || toDate) && (
                  <Button 
                    variant="text" 
                    color="error" 
                    size="small" 
                    onClick={clearFilters}
                    startIcon={<CloseIcon fontSize="small" />}
                  >
                    Clear Filters
                  </Button>
                )}
              </Stack>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: selectedStatus 
                              ? getStatusColor(selectedStatus) 
                              : 'text.disabled' 
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon 
                            fontSize="small" 
                            sx={{ 
                              color: selectedCategory 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {[...new Set(threads.map((thread) => thread.topic).filter(Boolean))].map(
                      (topic, index) => (
                        <MenuItem key={index} value={topic}>
                          {topic || "Uncategorized"}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Semester"
                    value={selectedSemester}
                    onChange={handleSemesterChange}
                  >
                    <MenuItem value="">All Semesters</MenuItem>
                    {semesterOptions.map((semester) => (
                      <MenuItem key={semester} value={semester}>
                        Sem {semester}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon 
                            fontSize="small" 
                            sx={{ 
                              color: fromDate 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={handleToDateChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon 
                            fontSize="small" 
                            sx={{ 
                              color: toDate 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Card>
          )}

          <Box sx={{ position: 'relative' }}>
            {filteredThreads.length > 0 ? (
              <>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    maxWidth: '100%',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Table sx={{ minWidth: { xs: 980, md: 740 } }}>
                  <TableHead sx={{ 
                    backgroundColor: isLight 
                      ? alpha(theme.palette.primary.main, 0.08) 
                      : alpha(theme.palette.info.main, 0.1),
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Opened Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Closed date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Members</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedThreads.map((thread) => {
                      const authorAvatarSrc = getAvatarSrc(thread?.author);

                      return (
                      <TableRow 
                        key={thread._id}
                        hover
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: isLight 
                              ? alpha(theme.palette.primary.main, 0.04) 
                              : alpha(theme.palette.info.main, 0.08),
                          },
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {thread.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              maxHeight: "4rem",
                              maxWidth: { xs: "11rem", md: "15rem" },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                textAlign: "justify",
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {thread.description}
                            </Typography>
                          </Box>
                          <Button 
                            size="small" 
                            onClick={() => handleOpenDialog(thread._id)}
                            sx={{ 
                              textTransform: 'none', 
                              mt: 0.5,
                              color: isLight ? theme.palette.primary.main : theme.palette.info.main,
                              px: 1,
                              '&:hover': {
                                backgroundColor: isLight 
                                  ? alpha(theme.palette.primary.main, 0.08) 
                                  : alpha(theme.palette.info.main, 0.1),
                              }
                            }}
                          >
                            Read more
                          </Button>
                          <Dialog
                            open={openDialogThreadId === thread._id}
                            onClose={handleCloseDialog}
                            fullScreen={isMobile}
                            PaperProps={{
                              sx: {
                                borderRadius: 2,
                                maxWidth: 'sm',
                                width: '100%'
                              }
                            }}
                          >
                            <DialogContent>
                              <Typography variant="h6" gutterBottom>
                                {thread.title}
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              <Typography variant="body2">
                                {thread.description}
                              </Typography>
                            </DialogContent>
                            <DialogActions>
                              <Button 
                                onClick={handleCloseDialog}
                                variant="outlined"
                                color={isLight ? "primary" : "info"}
                                size="small"
                              >
                                Close
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={thread.status}
                            size="small"
                            sx={{
                              backgroundColor: getStatusBgColor(thread.status),
                              color: getStatusColor(thread.status),
                              fontWeight: 'medium',
                              borderRadius: '8px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {thread.topic ? (
                            <Chip
                              label={thread.topic}
                              size="small"
                              sx={{
                                backgroundColor: isLight 
                                  ? alpha(theme.palette.primary.main, 0.08) 
                                  : alpha(theme.palette.info.main, 0.1),
                                color: isLight 
                                  ? theme.palette.primary.main 
                                  : theme.palette.info.main,
                                borderRadius: '8px',
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No Category
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {thread.closedAt
                              ? new Date(thread.closedAt).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={authorAvatarSrc || undefined}
                              sx={{ 
                                width: 28, 
                                height: 28,
                                bgcolor: isLight 
                                  ? theme.palette.primary.main 
                                  : theme.palette.info.main,
                                fontSize: '0.875rem',
                                mr: 1
                              }}
                            >
                              {!authorAvatarSrc
                                ? getAvatarFallbackText(thread?.author?.name)
                                : null}
                            </Avatar>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                              {thread?.author?.name || "Unknown"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <AvatarGroup
                            max={3}
                            sx={{
                              '& .MuiAvatar-root': {
                                width: 28,
                                height: 28,
                                fontSize: '0.875rem',
                                backgroundColor: isLight 
                                  ? alpha(theme.palette.primary.main, 0.8) 
                                  : alpha(theme.palette.info.main, 0.8),
                              },
                            }}
                          >
                            {thread.participants.map((participant, idx) => {
                              const participantAvatarSrc = getAvatarSrc(participant);

                              return (
                              <Tooltip
                                key={idx}
                                title={participant.name}
                                placement="top"
                              >
                                <Avatar
                                  alt={participant.name}
                                  src={participantAvatarSrc || undefined}
                                >
                                  {!participantAvatarSrc
                                    ? getAvatarFallbackText(participant.name)
                                    : null}
                                </Avatar>
                              </Tooltip>
                              );
                            })}
                          </AvatarGroup>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            startIcon={!isMobile ? <ChatIcon /> : null}
                            onClick={() => handleOpenChatDialog(thread._id)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              whiteSpace: 'nowrap',
                              color: isLight ? theme.palette.primary.main : theme.palette.info.main,
                              borderColor: isLight ? theme.palette.primary.main : theme.palette.info.main,
                              '&:hover': {
                                backgroundColor: isLight 
                                  ? alpha(theme.palette.primary.main, 0.08) 
                                  : alpha(theme.palette.info.main, 0.1),
                              }
                            }}
                          >
                            View Chat
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredThreads.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={isMobile ? [10, 25] : [10, 25, 50]}
                />
              </>
            ) : (
              <Box 
                sx={{ 
                  py: 6, 
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderRadius: 2,
                  border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No threads match your search criteria
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or search terms
                </Typography>
                {(selectedCategory || selectedStatus || selectedSemester || fromDate || toDate || searchTerm) && (
                  <Button 
                    variant="outlined" 
                    color={isLight ? "primary" : "info"}
                    size="small" 
                    onClick={clearFilters}
                    sx={{ mt: 2 }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Chat Messages Dialog */}
        <Dialog
          open={Boolean(openChatDialogThreadId)}
          onClose={handleCloseChatDialog}
          fullScreen={isMobile}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              minHeight: '60vh',
              maxHeight: '80vh'
            }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="h6">
                Chat Messages
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
              {chatMessages.length > 0 ? (
                <MessageList 
                  conversation={threads.find(t => t._id === openChatDialogThreadId)} 
                  messages={chatMessages} 
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: 'text.secondary'
                }}>
                  <Typography>No messages in this thread</Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button 
              onClick={handleCloseChatDialog}
              variant="outlined"
              color={isLight ? "primary" : "info"}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
};

export default Report;
