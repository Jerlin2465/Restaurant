import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TableRestaurantOutlinedIcon from "@mui/icons-material/TableRestaurantOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const STATUS_COLORS = {
  Pending: { bg: "#2a2000", color: "#FBBF24" },
  Assigned: { bg: "#1a1a2e", color: "#A78BFA" },
  Confirmed: { bg: "#001a2e", color: "#38BDF8" },
  Seated: { bg: "#00200e", color: "#34D399" },
  Completed: { bg: "#0d1a2e", color: "#60A5FA" },
  Cancelled: { bg: "#2a0000", color: "#F87171" },
};

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const getToken = () => localStorage.getItem("token");

  // ─── Fetch only THIS user's bookings ────────────────────────────────────────
  // The backend /table/my-bookings reads req.user._id from the JWT token
  // and filters TableBooking by { userId: req.user._id }
  // So User A NEVER sees User B's bookings — isolation is enforced server-side
  const getBookings = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(`${API}/table/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);

      // Token expired or invalid → force re-login
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  // ─── Cancel booking ──────────────────────────────────────────────────────────
  const handleCancel = async () => {
    try {
      const token = getToken();
      await axios.put(
        `${API}/table/cancel/${selectedId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSnack({
        open: true,
        msg: "Booking cancelled successfully",
        severity: "success",
      });
      setConfirmOpen(false);
      getBookings(); // refresh list
    } catch (error) {
      setSnack({
        open: true,
        msg: error?.response?.data?.message || "Cancel failed",
        severity: "error",
      });
      setConfirmOpen(false);
    }
  };

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        p: { xs: 2, md: 4 },
        borderRadius: 8,
      }}
    >
      <Typography variant="h4" fontWeight="bold" sx={{ color: "#ccc", mb: 1 }}>
        My Table Bookings
      </Typography>
      <Typography sx={{ color: "#8a94a8", mb: 4 }}>
        View and manage your reservations
      </Typography>

      {/* ── Empty state ── */}
      {bookings.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: "24px",
            textAlign: "center",
            bgcolor: "#111827",
            border: "1px solid #1f2937",
          }}
        >
          <EventSeatIcon sx={{ fontSize: 64, color: "#374151", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#6b7280" }}>
            No bookings yet
          </Typography>
          <Button
            onClick={() => navigate("/tablebooking")}
            variant="contained"
            sx={{
              mt: 3,
              borderRadius: "12px",
              bgcolor: "#fff",
              color: "#000",
              textTransform: "none",
            }}
          >
            Book a Table
          </Button>
        </Paper>
      ) : (
        /* ── Booking cards — only THIS user's bookings are in this array ── */
        <Stack spacing={3}>
          {bookings.map((booking) => {
            const sc =
              STATUS_COLORS[booking.status] || STATUS_COLORS["Pending"];

            // Cancel allowed only for Pending / Assigned / Confirmed
            const canCancel = !["Completed", "Cancelled", "Seated"].includes(
              booking.status,
            );

            return (
              <Paper
                key={booking._id}
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  border: "1px solid #1f2937",
                  bgcolor: "#111827",
                  overflow: "hidden",
                }}
              >
                {/* Top bar */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "#0f172a",
                    borderBottom: "1px solid #1f2937",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#6b7280",
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  >
                    ID: {booking._id.slice(-10).toUpperCase()}
                  </Typography>
                  <Chip
                    label={booking.status}
                    size="small"
                    sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700 }}
                  />
                </Box>

                {/* Body */}
                <Box sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: "#f1f5f9", mb: 2 }}
                  >
                    {booking.fullName}
                  </Typography>

                  {/* Info grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr 1fr",
                        md: "1fr 1fr 1fr 1fr",
                      },
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    {[
                      {
                        icon: <PeopleAltOutlinedIcon fontSize="small" />,
                        label: "Guests",
                        val: booking.guests,
                      },
                      {
                        icon: <CalendarMonthOutlinedIcon fontSize="small" />,
                        label: "Date",
                        val: booking.date,
                      },
                      {
                        icon: <AccessTimeOutlinedIcon fontSize="small" />,
                        label: "Time",
                        val: booking.time,
                      },
                      {
                        icon: <TableRestaurantOutlinedIcon fontSize="small" />,
                        label: "Table",
                        val: booking.tableNumber || "Auto-assigned",
                      },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          p: 1.5,
                          borderRadius: "12px",
                          bgcolor: "#0f172a",
                          border: "1px solid #1e293b",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "#64748b",
                            mb: 0.5,
                          }}
                        >
                          {item.icon}
                          <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                            {item.label}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: "#e2e8f0",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {item.val}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {booking.message && (
                    <Typography sx={{ color: "#6b7280", fontSize: 13, mb: 2 }}>
                      Note: {booking.message}
                    </Typography>
                  )}

                  {booking.orderId && (
                    <Chip
                      label={`Linked Order: ${booking.orderId._id?.slice(-6).toUpperCase() || "N/A"}`}
                      size="small"
                      sx={{ bgcolor: "#001a2e", color: "#38BDF8", mb: 2 }}
                    />
                  )}

                  <Divider sx={{ borderColor: "#1e293b", mb: 2 }} />

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {canCancel && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelOutlinedIcon />}
                        sx={{ borderRadius: "10px", textTransform: "none" }}
                        onClick={() => {
                          setSelectedId(booking._id);
                          setConfirmOpen(true);
                        }}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* ── Confirm Cancel Dialog ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            bgcolor: "#111827",
            border: "1px solid #1f2937",
          },
        }}
      >
        <DialogTitle sx={{ color: "#f1f5f9" }}>Cancel Booking?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#9ca3af" }}>
            Are you sure you want to cancel this table reservation? This cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{
              color: "#6b7280",
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            Go Back
          </Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            color="error"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyBookings;
