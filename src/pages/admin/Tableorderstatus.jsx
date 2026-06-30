import React, { useEffect, useState, useCallback } from "react";
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
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";

const API = import.meta.env.VITE_API_URL;

// ── status chip color maps
const BOOKING_STATUS_COLOR = {
  Pending: "warning",
  Assigned: "info",
  Confirmed: "info",
  Seated: "success",
  Completed: "default",
  Cancelled: "error",
};

const BILL_STATUS_CFG = {
  open: { color: "#60a5fa", bg: "#1e3a5f", label: "Open" },
  pending_payment: {
    color: "#f7d651",
    bg: "#451a03",
    label: "Awaiting Payment",
  },
  paid: { color: "#4ade80", bg: "#052e16", label: "Paid" },
  cancelled: { color: "#f87171", bg: "#3b0a0a", label: "Cancelled" },
};

const Tableorderstatus = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [snack, setSnack] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/bill/all-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setBills(res.data.bills);
      }
    } catch (error) {
      setSnack({
        open: true,
        text:
          error?.response?.data?.message || "Failed to load table order status",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => fetchData(), 20000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const filteredBills = bills.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(b.tableNumber).toLowerCase().includes(q) ||
      (b.customerName || "").toLowerCase().includes(q) ||
      (b.serverName || "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totals = {
    all: bills.length,
    open: bills.filter((b) => b.status === "open").length,
    pending_payment: bills.filter((b) => b.status === "pending_payment").length,
    paid: bills.filter((b) => b.status === "paid").length,
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <CircularProgress sx={{ color: "#facc15" }} />
        <Typography sx={{ color: "#9ca3af", mt: 2 }}>
          Loading table order status…
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#0f172a", p: 3, ml: 28 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          bgcolor: "#111827",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "#facc15", color: "#000" }}>
            <ReceiptLongIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Table Order Status
            </Typography>
            <Typography sx={{ color: "#94a3b8" }}>
              All table bookings, assigned servers &amp; bill amounts in one
              place
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" gap={1.5} flexWrap="wrap">
          {[
            { key: "all", label: `${totals.all} Total`, color: "#a78bfa" },
            { key: "open", label: `${totals.open} Open`, color: "#60a5fa" },
            {
              key: "pending_payment",
              label: `${totals.pending_payment} Awaiting Payment`,
              color: "#facc15",
            },
            { key: "paid", label: `${totals.paid} Paid`, color: "#4ade80" },
          ].map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              onClick={() => setStatusFilter(s.key)}
              variant={statusFilter === s.key ? "filled" : "outlined"}
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                color: statusFilter === s.key ? "#ccc" : s.color,
                bgcolor: statusFilter === s.key ? s.color : `${s.color}11`,
                borderColor: `${s.color}66`,
              }}
            />
          ))}
        </Box>

        <TextField
          size="small"
          placeholder="Search table, customer or server"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#6b7280", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 260,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "#111827",
              color: "#e5e7eb",
              "& fieldset": { borderColor: "#374151" },
              "&:hover fieldset": { borderColor: "#6b7280" },
              "&.Mui-focused fieldset": { borderColor: "#facc15" },
            },
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 4, overflowX: "auto", bgcolor: "#111827" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#1e293b" }}>
              {[
                "Table Number",
                "Customer Name",
                "Server Name",
                "Guests",
                "Date",
                "Time",
                "Booking Status",
                "Items",
                "Grand Total",
                "Bill Status",
                "Payment",
              ].map((col) => (
                <TableCell key={col} sx={{ color: "#fff", fontWeight: 700 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  align="center"
                  sx={{ color: "#6b7280", py: 5 }}
                >
                  No records match the current filter
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => {
                const cfg =
                  BILL_STATUS_CFG[bill.status] ?? BILL_STATUS_CFG.open;
                const itemCount = (bill.items || []).reduce(
                  (sum, it) => sum + (it.quantity || 0),
                  0,
                );

                return (
                  <TableRow
                    key={bill._id}
                    sx={{ "&:hover": { bgcolor: "#1f2937" } }}
                  >
                    <TableCell>
                      <Chip
                        icon={
                          <TableRestaurantIcon
                            sx={{ color: "#60a5fa !important", fontSize: 16 }}
                          />
                        }
                        label={`#${bill.tableNumber}`}
                        sx={{
                          bgcolor: "#1d4ed844",
                          color: "#60a5fa",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#e5e7eb" }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon sx={{ color: "#9ca3af", fontSize: 16 }} />
                        {bill.customerName || "_"}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={bill.serverName || "Not Assigned"}
                        size="small"
                        sx={{
                          bgcolor: bill.serverName ? "#0c351c" : "#1f2937",
                          color: bill.serverName ? "#4ade80" : "#6b7280",
                          fontWeight: 700,
                          border: bill.serverName
                            ? "1px solid #4ade8044"
                            : "1px solid #374151",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {bill.booking?.guests ?? "—"}
                    </TableCell>
                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {bill.booking?.date ?? "—"}
                    </TableCell>
                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {bill.booking?.time ?? "—"}
                    </TableCell>

                    <TableCell>
                      {bill.booking?.bookingStatus ? (
                        <Chip
                          label={bill.booking.bookingStatus}
                          size="small"
                          // color={
                          //   BOOKING_STATUS_COLOR[bill.booking.bookingStatus] ||
                          //   "default"
                          // }
                          sx={{ color: "#858c9a", backgroundColor: "#1f2937" }}
                        />
                      ) : (
                        <Typography sx={{ color: "#4b5563", fontSize: 12 }}>
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {itemCount > 0 ? `${itemCount} item(s)` : "—"}
                    </TableCell>

                    <TableCell>
                      <Typography
                        sx={{ color: "#facc15", fontWeight: 700, fontSize: 14 }}
                      >
                        ₹{bill.grandTotal?.toFixed(0) ?? "0"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={cfg.label}
                        size="small"
                        sx={{
                          bgcolor: `${cfg.color}22`,
                          color: cfg.color,
                          fontWeight: 700,
                          border: `1px solid ${cfg.color}44`,
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {bill.status === "paid" ? (
                        <Box>
                          <Typography sx={{ fontSize: 12, color: "#4ade80" }}>
                            {bill.paymentMethod?.toUpperCase() || "CASH"}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                            {bill.paidAt
                              ? new Date(bill.paidAt).toLocaleString()
                              : ""}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ color: "#4b5563", fontSize: 12 }}>
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tableorderstatus;
