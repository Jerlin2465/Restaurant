// frontend/src/pages/ServerDashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PersonIcon from "@mui/icons-material/Person";
import Serverfoodmenu from "./Workers/Serverfoodmenu";
import Serverfoodorders from "./Workers/Serverfoodorder";
import Serverbill from "./Workers/Serverbill";
import { jwtDecode } from "jwt-decode";

const API = import.meta.env.VITE_API_URL;

const TabPanel = ({ value, index, children }) =>
  value === index ? <Box sx={{ mt: 3 }}>{children}</Box> : null;

// ─── Helper: get current logged-in server ID from JWT ────────────────────────
const getCurrentServerId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded?._id || decoded?.id || null;
  } catch {
    return null;
  }
};

// ─── ServerBookings Component ─────────────────────────────────────────────────
const ServerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialog states for table modification
  const [modifyTableDialogOpen, setModifyTableDialogOpen] = useState(false);
  const [selectedBookingForModify, setSelectedBookingForModify] =
    useState(null);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [availableTables, setAvailableTables] = useState([]);

  // Current logged-in server's ID
  const currentServerId = getCurrentServerId();

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/table`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setBookings(res.data.bookings);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/table/available-tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setAvailableTables(res.data.availableTables);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Check if server already has an active table
  const hasActiveTable = () => {
    return bookings.some(
      (b) =>
        b.assignedServer &&
        isMyTable(b) &&
        b.status !== "Completed" &&
        b.status !== "Cancelled",
    );
  };

  // Default Take Table (Auto-assign)
  const takeTable = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/table/take-table/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setSnack({
          open: true,
          message: res.data.message || "Table assigned successfully",
          severity: "success",
        });
        fetchBookings();
      }
    } catch (error) {
      setSnack({
        open: true,
        message: error?.response?.data?.message || "Unable to assign table",
        severity: "error",
      });
    }
  };

  // Open dialog to modify table number
  const openModifyTableDialog = (booking) => {
    setSelectedBookingForModify(booking);
    setNewTableNumber(booking.tableNumber || "");
    fetchAvailableTables();
    setModifyTableDialogOpen(true);
  };

  // Save modified table number
  const saveModifiedTable = async () => {
    if (!newTableNumber) {
      setSnack({
        open: true,
        message: "Please select a table number",
        severity: "warning",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/table/modify-table/${selectedBookingForModify._id}`,
        { tableNumber: newTableNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setSnack({
          open: true,
          message: "Table number updated successfully",
          severity: "success",
        });
        setModifyTableDialogOpen(false);
        fetchBookings();
      }
    } catch (error) {
      setSnack({
        open: true,
        message:
          error?.response?.data?.message || "Failed to update table number",
        severity: "error",
      });
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/table/status/${bookingId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setSnack({
          open: true,
          message: `Status updated to ${status}`,
          severity: "success",
        });
        fetchBookings();
      }
    } catch (error) {
      setSnack({
        open: true,
        message: error?.response?.data?.message || "Failed to update status",
        severity: "error",
      });
    }
  };

  // ─── Complete Table with Automatic Payment ─────────────────────────────────
  const completeTable = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");

      // First, get the booking details to find the bill
      const bookingRes = await axios.get(`${API}/table/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!bookingRes.data.success) {
        throw new Error("Failed to get booking details");
      }

      const booking = bookingRes.data.booking;

      // Find the open bill for this booking
      const billRes = await axios.get(`${API}/bill/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (billRes.data.success && billRes.data.bill) {
        // Close/pay the bill
        await axios.put(
          `${API}/bill/pay/${billRes.data.bill._id}`,
          {
            paymentMethod: "cash",
            paidAmount: billRes.data.bill.total,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      // Update booking status to Completed
      await axios.put(
        `${API}/table/status/${bookingId}`,
        { status: "Completed" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSnack({
        open: true,
        message: "Table completed and bill paid successfully!",
        severity: "success",
      });
      fetchBookings();
    } catch (error) {
      console.error("Complete table error:", error);
      setSnack({
        open: true,
        message: error?.response?.data?.message || "Failed to complete table",
        severity: "error",
      });
    }
  };

  const isMyTable = (item) => {
    if (!item.assignedServer) return false;
    const assignedId =
      item.assignedServer?._id ||
      item.assignedServer?.id ||
      item.assignedServer;
    return String(assignedId) === String(currentServerId);
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center" }} mt={5}>
        <CircularProgress sx={{ color: "#facc15" }} />
      </Box>
    );

  const activeBookings = bookings.filter(
    (b) => b.status !== "Completed" && b.status !== "Cancelled",
  );
  const completedBookings = bookings.filter((b) => b.status === "Completed");

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          overflowX: "auto",
          bgcolor: "#111827",
          "& .MuiTable-root": {
            minWidth: { xs: 800, sm: 900, md: "100%" },
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#1e293b" }}>
              {[
                "Name",
                "Phone",
                "Guests",
                "Date",
                "Time",
                "Table",
                "Status",
                "Assigned Server",
                "Action",
              ].map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    padding: { xs: "8px 12px", sm: "12px 16px" },
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {activeBookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ color: "#6b7280", py: 4 }}
                >
                  No active table reservations
                </TableCell>
              </TableRow>
            ) : (
              activeBookings.map((item) => {
                const mine = isMyTable(item);
                const serverHasActiveTable = hasActiveTable();

                return (
                  <TableRow
                    key={item._id}
                    sx={{
                      "&:hover": { bgcolor: "#1f2937" },
                      opacity: item.assignedServer && !mine ? 0.65 : 1,
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#e5e7eb",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon
                          sx={{
                            color: "#60a5fa",
                            fontSize: { xs: 16, sm: 18 },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                        >
                          {item.fullName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#e5e7eb",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      }}
                    >
                      {item.phone}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#e5e7eb",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      }}
                    >
                      {item.guests}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#e5e7eb",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      }}
                    >
                      {item.date}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#e5e7eb",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      }}
                    >
                      {item.time}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Chip
                          label={`#${item.tableNumber}`}
                          size="small"
                          sx={{
                            bgcolor: "#1d4ed844",
                            color: "#60a5fa",
                            fontWeight: 700,
                            fontSize: { xs: "0.6rem", sm: "0.75rem" },
                            height: { xs: 20, sm: 24 },
                          }}
                        />
                        {mine && item.status === "Assigned" && (
                          <Tooltip title="Modify Table Number">
                            <IconButton
                              size="small"
                              onClick={() => openModifyTableDialog(item)}
                              sx={{ color: "#60a5fa", padding: "2px" }}
                            >
                              <EditIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        color={
                          item.status === "Pending"
                            ? "warning"
                            : item.status === "Assigned"
                              ? "info"
                              : item.status === "Seated"
                                ? "success"
                                : "default"
                        }
                        sx={{
                          fontSize: { xs: "0.6rem", sm: "0.75rem" },
                          height: { xs: 20, sm: 24 },
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.assignedServer?.name || "Not Assigned"}
                        size="small"
                        sx={{
                          bgcolor: item.assignedServer
                            ? mine
                              ? "#14532d"
                              : "#166534"
                            : "#1f2937",
                          color: item.assignedServer ? "#4ade80" : "#6b7280",
                          fontWeight: 700,
                          border: item.assignedServer
                            ? "1px solid #4ade8044"
                            : "1px solid #374151",
                          fontSize: { xs: "0.6rem", sm: "0.75rem" },
                          height: { xs: 20, sm: 24 },
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {/* Not Assigned - Show Take/Manual buttons */}
                      {!item.assignedServer && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => takeTable(item._id)}
                            disabled={serverHasActiveTable}
                            sx={{
                              bgcolor: serverHasActiveTable
                                ? "#4a5568"
                                : "#2563eb",
                              fontWeight: 700,
                              fontSize: { xs: "0.6rem", sm: "0.7rem" },
                              padding: { xs: "4px 8px", sm: "6px 12px" },
                              minWidth: { xs: "60px", sm: "80px" },
                              "&:hover": {
                                bgcolor: serverHasActiveTable
                                  ? "#4a5568"
                                  : "#1d4ed8",
                              },
                            }}
                          >
                            {serverHasActiveTable ? "Already" : "Take"}
                          </Button>
                        </Box>
                      )}

                      {/* Assigned to Other Server */}
                      {item.assignedServer && !mine && (
                        <Tooltip title="This table belongs to another server">
                          <Chip
                            label="Other"
                            size="small"
                            sx={{
                              bgcolor: "#1f2937",
                              color: "#6b7280",
                              border: "1px solid #374151",
                              fontWeight: 600,
                              cursor: "not-allowed",
                              fontSize: { xs: "0.6rem", sm: "0.75rem" },
                              height: { xs: 20, sm: 24 },
                            }}
                          />
                        </Tooltip>
                      )}

                      {/* My Table - Show action buttons based on status */}
                      {item.assignedServer && mine && (
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {/* Step 1: Assigned → Modify + Confirm */}
                          {item.status === "Assigned" && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openModifyTableDialog(item)}
                                sx={{
                                  borderColor: "#60a5fa",
                                  color: "#60a5fa",
                                  fontWeight: 600,
                                  fontSize: { xs: "0.6rem", sm: "0.7rem" },
                                  padding: { xs: "4px 8px", sm: "6px 12px" },
                                  minWidth: { xs: "50px", sm: "70px" },
                                  "&:hover": { borderColor: "#2563eb" },
                                }}
                              >
                                Modify
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="info"
                                onClick={() =>
                                  updateStatus(item._id, "Confirmed")
                                }
                                sx={{
                                  fontSize: { xs: "0.6rem", sm: "0.7rem" },
                                  padding: { xs: "4px 8px", sm: "6px 12px" },
                                  minWidth: { xs: "50px", sm: "70px" },
                                }}
                              >
                                Confirm
                              </Button>
                            </>
                          )}

                          {/* Step 2: Confirmed → Seat Customer */}
                          {item.status === "Confirmed" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              onClick={() => updateStatus(item._id, "Seated")}
                              sx={{
                                fontSize: { xs: "0.6rem", sm: "0.7rem" },
                                padding: { xs: "4px 8px", sm: "6px 12px" },
                                minWidth: { xs: "50px", sm: "70px" },
                              }}
                            >
                              Seat
                            </Button>
                          )}

                          {/* Step 3: Seated → Complete (with auto payment) */}
                          {item.status === "Seated" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => completeTable(item._id)}
                              sx={{
                                fontSize: { xs: "0.6rem", sm: "0.7rem" },
                                padding: { xs: "4px 8px", sm: "6px 12px" },
                                minWidth: { xs: "60px", sm: "80px" },
                                fontWeight: 700,
                                "&:hover": {
                                  bgcolor: "#16a34a",
                                },
                              }}
                            >
                              Complete
                            </Button>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {completedBookings.length > 0 && (
        <Box mt={2}>
          <Typography sx={{ color: "#4b5563", fontSize: { xs: 11, sm: 13 } }}>
            ✓ {completedBookings.length} completed booking(s) — table(s) now
            available
          </Typography>
        </Box>
      )}

      {/* Modify Table Dialog */}
      <Dialog
        open={modifyTableDialogOpen}
        onClose={() => {
          setModifyTableDialogOpen(false);
        }}
        PaperProps={{
          sx: {
            bgcolor: "#000000",
            color: "#ffffff",
            borderRadius: 3,
            border: "1px solid #1a1a1a",
            minWidth: { xs: "300px", sm: "400px" },
            maxWidth: { xs: "95%", sm: "100%" },
            boxShadow: "0 8px 32px rgba(0,0,0,0.9)",
            margin: { xs: "10px", sm: "0" },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            borderBottom: "1px solid #1a1a1a",
            pb: 2,
            fontSize: { xs: "1rem", sm: "1.25rem" },
            letterSpacing: "0.5px",
          }}
        >
          {selectedBookingForModify?.assignedServer
            ? " Modify Table Number"
            : " Manual Table Assignment"}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText
            sx={{
              mb: 2,
              color: "#9ca3af",
              fontSize: { xs: "0.8rem", sm: "0.95rem" },
            }}
          >
            {selectedBookingForModify?.assignedServer
              ? `Current table: #${selectedBookingForModify?.tableNumber}`
              : `Select a table number for ${selectedBookingForModify?.fullName}.`}
          </DialogContentText>

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Available Tables</InputLabel>
            <Select
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              label="Available Tables"
              sx={{
                borderRadius: 2,
                color: "#ffffff",
                "& .MuiSelect-select": {
                  padding: { xs: "8px 14px", sm: "14px 14px" },
                },
              }}
            >
              {availableTables.length === 0 ? (
                <MenuItem value="" disabled sx={{ color: "#6b7280" }}>
                  No tables available
                </MenuItem>
              ) : (
                availableTables.map((table) => (
                  <MenuItem key={table} value={table}>
                    Table #{table}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid #1a1a1a",
            pt: 2,
            pb: 2,
            pr: { xs: 2, sm: 3 },
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={() => {
              setModifyTableDialogOpen(false);
            }}
            sx={{
              color: "#9ca3af",
              fontWeight: 600,
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              "&:hover": {
                color: "#ef4444",
                bgcolor: "transparent",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveModifiedTable}
            variant="contained"
            disabled={!newTableNumber}
            sx={{
              bgcolor: "#facc15",
              color: "#000000",
              fontWeight: 700,
              px: { xs: 2, sm: 3 },
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              "&:hover": {
                bgcolor: "#fbbf24",
              },
              "&:disabled": {
                bgcolor: "#1a1a1a",
                color: "#6b7280",
              },
            }}
          >
            {selectedBookingForModify?.assignedServer
              ? "Update Table"
              : "Assign Table"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </>
  );
};

// ─── Main ServerDashboard Component ──────────────────────────────────────────
const ServerDashboard = () => {
  const [tab, setTab] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const fetchReadyCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/food/server-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const count = res.data.orders.filter(
          (o) => o.status === "Ready",
        ).length;
        setReadyCount(count);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchReadyCount();
    const timer = setInterval(fetchReadyCount, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleOrderServed = () => {
    setTab(3);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0f172a",
        p: { xs: 1.5, sm: 2, md: 3 },
        mt: { xs: 6, sm: 7, md: 8 },
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 4,
          bgcolor: "#111827",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#2563eb",
              width: { xs: 40, sm: 48, md: 56 },
              height: { xs: 40, sm: 48, md: 56 },
            }}
          >
            <TableRestaurantIcon
              sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }}
            />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.125rem" },
              }}
            >
              Server Dashboard
            </Typography>
            <Typography
              sx={{
                color: "#94a3b8",
                fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
              }}
            >
              Manage table reservations, food orders &amp; bills
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs - Scrollable on mobile */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
        sx={{
          "& .MuiTabs-scrollButtons": {
            color: "#facc15",
            "&.Mui-disabled": {
              color: "#374151",
            },
          },
          "& .MuiTab-root": {
            color: "#9ca3af",
            fontWeight: "bold",
            textTransform: "none",
            fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
            padding: { xs: "6px 12px", sm: "8px 16px", md: "12px 20px" },
            minWidth: { xs: "auto", sm: "auto", md: "auto" },
          },
          "& .Mui-selected": { color: "#facc15 !important" },
          "& .MuiTabs-indicator": { backgroundColor: "#facc15" },
          "& .MuiTabScrollButton-root": {
            width: { xs: 30, sm: 40 },
          },
          borderBottom: "1px solid #1f2937",
          mb: 1,
        }}
      >
        <Tab
          label="Table Reservations"
          sx={{
            "& .MuiTab-label": {
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
            },
          }}
        />
        <Tab label="Available Menu" />
        <Tab
          label={
            <Badge
              badgeContent={readyCount}
              color="success"
              sx={{
                "& .MuiBadge-badge": {
                  right: { xs: -4, sm: -6 },
                  top: { xs: 2, sm: 4 },
                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                  width: { xs: 16, sm: 20 },
                  height: { xs: 16, sm: 20 },
                },
              }}
            >
              <Box
                component="span"
                pr={readyCount > 0 ? { xs: 0.5, sm: 1.5 } : 0}
              >
                Food Orders
              </Box>
            </Badge>
          }
        />
        <Tab label="Bill" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <ServerBookings />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Serverfoodmenu />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Serverfoodorders onServed={handleOrderServed} />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <Serverbill />
      </TabPanel>
    </Box>
  );
};

export default ServerDashboard;
