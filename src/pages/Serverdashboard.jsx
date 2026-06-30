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
} from "@mui/material";
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
    // Support both _id and id field in JWT payload
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

  // Current logged-in server's ID (decoded from JWT once)
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

  useEffect(() => {
    fetchBookings();
  }, []);

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
          message: "Table assigned successfully",
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

  // ─── Check if current server is the assigned server for this booking ────────
  const isMyTable = (item) => {
    if (!item.assignedServer) return false;
    // assignedServer may be a populated object or a plain ID string
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
        sx={{ borderRadius: 4, overflowX: "auto", bgcolor: "#111827" }}
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
                <TableCell key={col} sx={{ color: "#fff", fontWeight: 700 }}>
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
                // True only when THIS server is the one assigned to this table
                const mine = isMyTable(item);

                return (
                  <TableRow
                    key={item._id}
                    sx={{
                      "&:hover": { bgcolor: "#1f2937" },
                      // Subtle dim for rows that belong to another server
                      opacity: item.assignedServer && !mine ? 0.65 : 1,
                    }}
                  >
                    <TableCell sx={{ color: "#e5e7eb" }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon sx={{ color: "#60a5fa", fontSize: 18 }} />
                        {item.fullName}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {item.phone}
                    </TableCell>
                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {item.guests}
                    </TableCell>
                    <TableCell sx={{ color: "#e5e7eb" }}>{item.date}</TableCell>
                    <TableCell sx={{ color: "#e5e7eb" }}>{item.time}</TableCell>
                    <TableCell>
                      <Chip
                        label={`#${item.tableNumber}`}
                        sx={{
                          bgcolor: "#1d4ed844",
                          color: "#60a5fa",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={
                          item.status === "Pending"
                            ? "warning"
                            : item.status === "Assigned"
                              ? "info"
                              : item.status === "Seated"
                                ? "success"
                                : "default"
                        }
                        size="small"
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
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {!item.assignedServer && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => takeTable(item._id)}
                          sx={{
                            bgcolor: "#2563eb",
                            fontWeight: 700,
                            "&:hover": { bgcolor: "#1d4ed8" },
                          }}
                        >
                          Take Table
                        </Button>
                      )}

                      {item.assignedServer && !mine && (
                        <Tooltip title="This table belongs to another server">
                          <Chip
                            label="All Ready Assign"
                            size="small"
                            sx={{
                              bgcolor: "#1f2937",
                              color: "#6b7280",
                              border: "1px solid #374151",
                              fontWeight: 600,
                              cursor: "not-allowed",
                            }}
                          />
                        </Tooltip>
                      )}

                      {item.assignedServer && mine && (
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {item.status === "Assigned" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="info"
                              onClick={() =>
                                updateStatus(item._id, "Confirmed")
                              }
                            >
                              Confirm
                            </Button>
                          )}
                          {item.status === "Confirmed" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              onClick={() => updateStatus(item._id, "Seated")}
                            >
                              Seat Customer
                            </Button>
                          )}
                          {item.status === "Seated" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() =>
                                updateStatus(item._id, "Completed")
                              }
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
          <Typography sx={{ color: "#4b5563", fontSize: 13 }}>
            ✓ {completedBookings.length} completed booking(s) — table(s) now
            available
          </Typography>
        </Box>
      )}

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

//  Main ServerDashboard
const ServerDashboard = () => {
  const [tab, setTab] = useState(0);
  const [readyCount, setReadyCount] = useState(0);

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
    <Box sx={{ minHeight: "100vh", background: "#0f172a", p: 3, mt: 8 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: "#111827", color: "#fff" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "#2563eb" }}>
            <TableRestaurantIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Server Dashboard
            </Typography>
            <Typography sx={{ color: "#94a3b8" }}>
              Manage table reservations, food orders &amp; bills
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          "& .MuiTab-root": {
            color: "#9ca3af",
            fontWeight: "bold",
            textTransform: "none",
          },
          "& .Mui-selected": { color: "#facc15 !important" },
          "& .MuiTabs-indicator": { backgroundColor: "#facc15" },
        }}
      >
        <Tab label="Table Reservations" />
        <Tab label="Available Menu" />
        <Tab
          label={
            <Badge
              badgeContent={readyCount}
              color="success"
              sx={{ "& .MuiBadge-badge": { right: -6, top: 4 } }}
            >
              <Box component="span" pr={readyCount > 0 ? 1.5 : 0}>
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
