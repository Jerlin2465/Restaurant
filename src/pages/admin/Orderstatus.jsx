import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Select,
  MenuItem,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  useMediaQuery,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrash } from "react-icons/fa";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";

// ─── API URL ─────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL;

// ─── DARK THEME TOKENS ───────────────────────────────────────────────────────
const dark = {
  pageBg: "#0d0d0d",
  surfacePrimary: "#111111",
  surfaceSecondary: "#181818",
  surfaceHover: "#1e1e1e",
  border: "#2a2a2a",
  borderSubtle: "#1e1e1e",
  textPrimary: "#f0f0f0",
  textSecondary: "#aaaaaa",
  textMuted: "#666666",
};

// ─── REUSABLE DARK INPUT SX ──────────────────────────────────────────────────
const darkInputSx = {
  "& .MuiOutlinedInput-root": {
    background: "#1a1a1a",
    color: dark.textPrimary,
    "& fieldset": { borderColor: dark.border },
    "&:hover fieldset": { borderColor: "#444" },
    "&.Mui-focused fieldset": { borderColor: "#555" },
  },
  "& .MuiInputBase-input::placeholder": {
    color: dark.textMuted,
    opacity: 1,
  },
};

// ─── REUSABLE DARK SELECT SX ─────────────────────────────────────────────────
const darkSelectSx = {
  background: "#1a1a1a",
  color: dark.textPrimary,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: dark.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
  "& .MuiSvgIcon-root": { color: dark.textMuted },
};

// ─── REUSABLE DARK SELECT MENU PROPS ─────────────────────────────────────────
const darkSelectMenuProps = {
  PaperProps: {
    sx: {
      bgcolor: "#1a1a1a",
      border: `1px solid ${dark.border}`,
      "& .MuiMenuItem-root": {
        color: dark.textPrimary,
        "&:hover": { bgcolor: "#2a2a2a" },
        "&.Mui-selected": { bgcolor: "#2a2a2a" },
      },
    },
  },
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "", label: "All", bg: "#1e1e1e", color: "#aaaaaa", dot: null },
  {
    value: "Placed",
    label: "Placed",
    bg: "#1e1e3a",
    color: "#818CF8",
    dot: "#818CF8",
  },
  {
    value: "Processing",
    label: "Processing",
    bg: "#2a2000",
    color: "#FBBF24",
    dot: "#FBBF24",
  },
  {
    value: "Shipped",
    label: "Shipped",
    bg: "#001a2e",
    color: "#38BDF8",
    dot: "#38BDF8",
  },
  {
    value: "Delivered",
    label: "Delivered",
    bg: "#00200e",
    color: "#34D399",
    dot: "#34D399",
  },
  {
    value: "Cancelled",
    label: "Cancelled",
    bg: "#2a0000",
    color: "#F87171",
    dot: "#F87171",
  },
  {
    value: "Returned",
    label: "Returned",
    bg: "#1e0030",
    color: "#C084FC",
    dot: "#C084FC",
  },
];

const statusChipStyle = (status) => {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  return found
    ? { bg: found.bg, color: found.color }
    : { bg: "#1e1e1e", color: "#aaaaaa" };
};

// ─── SAFE INITIALS ───────────────────────────────────────────────────────────
const initials = (name) => {
  if (!name || name === "-") return "?";
  return name
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// ─── FLATTEN ORDERS (one row per ORDER, products grouped inside) ──────────────
const flattenOrders = (orders) => {
  return orders.map((order) => {
    const products = (order.products || []).map((item) => ({
      productId: item.productId?._id || "",
      productName: item.productId?.productName || "-",
      price: item.productId?.price || item.price || 0,
      quantity: item.quantity,
      lineTotal: (item.productId?.price || item.price || 0) * item.quantity,
    }));

    return {
      orderId: order._id,
      userId: order.userId?._id || "-",
      userName:
        order.userId?.name ||
        order.userId?.fullname ||
        order.userId?.username ||
        "-",
      products,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus || "Placed",
      date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
    };
  });
};

// ─── PRODUCT LIST CELL ────────────────────────────────────────────────────────
// Renders all products in a single order as a compact list inside the table cell
const ProductListCell = ({ products, navigate }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
    {products.map((p, idx) => (
      <Box
        key={idx}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          background: "#161616",
          border: `1px solid ${dark.border}`,
          borderRadius: 1.5,
          px: 1.2,
          py: 0.6,
          minWidth: 320,
        }}
      >
        {/* Product Name */}
        <Typography
          sx={{
            fontSize: 12,
            color: dark.textPrimary,
            fontWeight: 500,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {p.productName}
        </Typography>

        {/* Qty badge */}
        <Chip
          label={`×${p.quantity}`}
          size="small"
          sx={{
            fontSize: 11,
            height: 20,
            bgcolor: "#0d1a2e",
            color: "#60A5FA",
            fontWeight: 700,
            "& .MuiChip-label": { px: 1 },
          }}
        />

        {/* Unit price */}
        <Typography
          sx={{
            fontSize: 11,
            color: dark.textMuted,
            minWidth: 52,
            textAlign: "right",
          }}
        >
          ₹{p.price.toLocaleString("en-IN")}
        </Typography>

        {/* Line total */}
        <Typography
          sx={{
            fontSize: 12,
            color: "#4ADE80",
            fontWeight: 700,
            minWidth: 62,
            textAlign: "right",
          }}
        >
          ₹{p.lineTotal.toLocaleString("en-IN")}
        </Typography>

        {/* View button */}
        <Tooltip title={p.productId ? "View product" : "Product not found"}>
          <span>
            <Button
              size="small"
              variant="outlined"
              disabled={!p.productId}
              onClick={() => navigate(`/menu/${p.productId}`)}
              sx={{
                minWidth: 28,
                width: 28,
                height: 24,
                p: 0,
                border: `1px solid ${dark.border}`,
                color: dark.textMuted,
                "&:hover": {
                  borderColor: "#60A5FA",
                  color: "#60A5FA",
                  bgcolor: "#0d1a2e",
                },
                "&.Mui-disabled": {
                  color: dark.textMuted,
                  borderColor: dark.borderSubtle,
                },
              }}
            >
              <FaEye style={{ fontSize: 10 }} />
            </Button>
          </span>
        </Tooltip>
      </Box>
    ))}
  </Box>
);

// ─── COMPONENT
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // ─── FETCH
  const getOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/order/all-orders`);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("ORDER FETCH ERROR:", error);
      setSnack({ open: true, msg: "Failed to load orders", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  //  DERIVED: one row per order
  const rows = useMemo(() => flattenOrders(orders), [orders]);

  //  FILTER
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !q ||
        r.orderId.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.products.some((p) => p.productName.toLowerCase().includes(q));
      const matchP = !payFilter || r.paymentStatus === payFilter;
      const matchS = !statusFilter || r.orderStatus === statusFilter;
      return matchQ && matchP && matchS;
    });
  }, [rows, search, payFilter, statusFilter]);

  //  STATS
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [orders],
  );
  const countByStatus = useCallback(
    (s) => orders.filter((o) => o.orderStatus === s).length,
    [orders],
  );

  //  DELETE
  const askDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    setConfirmOpen(false);
    try {
      await axios.delete(`${API_URL}/order/delete-order/${pendingDeleteId}`);
      setSnack({
        open: true,
        msg: "Order deleted successfully",
        severity: "success",
      });
      getOrders();
    } catch (error) {
      setSnack({
        open: true,
        msg:
          "Delete failed: " + (error?.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setPendingDeleteId(null);
    }
  };

  //  STATUS UPDATE
  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`${API_URL}/order/update-order/${id}`, {
        orderStatus: status,
      });
      getOrders();
    } catch (error) {
      setSnack({
        open: true,
        msg:
          "Status update failed: " +
          (error?.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  //  STAT CARDS
  const statCards = [
    {
      label: "Total Orders",
      value: orders.length,
      bg: "#0d1a2e",
      color: "#60A5FA",
    },
    {
      label: "Revenue",
      value: `₹ ${totalRevenue.toLocaleString("en-IN")}`,
      bg: "#0d2318",
      color: "#4ADE80",
    },
    {
      label: "Placed",
      value: countByStatus("Placed"),
      bg: "#1e1e3a",
      color: "#818CF8",
    },
    {
      label: "Processing",
      value: countByStatus("Processing"),
      bg: "#2a2000",
      color: "#FBBF24",
    },
    {
      label: "Ready",
      value: countByStatus("Ready"),
      bg: "#001a2e",
      color: "#38BDF8",
    },
    {
      label: "Delivered",
      value: countByStatus("Delivered"),
      bg: "#00200e",
      color: "#34D399",
    },
    {
      label: "Cancelled",
      value: countByStatus("Cancelled"),
      bg: "#2a0000",
      color: "#F87171",
    },
    {
      label: "Returned",
      value: countByStatus("Returned"),
      bg: "#1e0030",
      color: "#C084FC",
    },
  ];

  return (
    <Box
      sx={{
        p: isMobile ? 1.5 : 4,
        boxSizing: "border-box",
        overflow: "hidden",
        ml: { xs: 0, md: 28 },
        bgcolor: dark.pageBg,
        minHeight: "100vh",
      }}
    >
      {/* ── HEADER ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: dark.textPrimary }}
        >
          Orders
        </Typography>
        <Chip
          label={`${orders.length} Orders`}
          sx={{ background: "#0d1a2e", color: "#60A5FA", fontWeight: 600 }}
        />
      </Box>

      {/* ── STAT CARDS ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((item) => (
          <Grid xs={6} sm={4} md={3} lg={1.5} key={item.label}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${dark.border}`,
                background: item.bg,
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: item.color, fontWeight: 600 }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                mt={1}
                sx={{ color: item.color }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── SEARCH + PAYMENT FILTER ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, product, order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={darkInputSx}
        />
        <Select
          value={payFilter}
          onChange={(e) => setPayFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: isMobile ? "100%" : 180, ...darkSelectSx }}
          MenuProps={darkSelectMenuProps}
        >
          <MenuItem value="">All Payments</MenuItem>
          <MenuItem value="Paid">Paid</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Failed">Failed</MenuItem>
        </Select>
      </Box>

      {/* ── STATUS FILTER PILLS ── */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, gap: 1 }}>
        {STATUS_OPTIONS.map((s) => {
          const isActive = statusFilter === s.value;
          return (
            <Chip
              key={s.value}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                  {s.dot && (
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: isActive ? s.color : dark.textMuted,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {s.label}
                </Box>
              }
              onClick={() => setStatusFilter(s.value)}
              size="small"
              variant={isActive ? "filled" : "outlined"}
              sx={{
                cursor: "pointer",
                fontWeight: isActive ? 700 : 400,
                background: isActive ? s.bg : "transparent",
                color: isActive ? s.color : dark.textMuted,
                borderColor: isActive ? s.color : dark.border,
                borderRadius: "999px",
                "& .MuiChip-label": { px: 1.2 },
                "&:hover": {
                  background: s.bg,
                  color: s.color,
                  borderColor: s.color,
                },
              }}
            />
          );
        })}
      </Stack>

      {/* ── TABLE ── */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 3,
          border: `1px solid ${dark.border}`,
          bgcolor: dark.surfacePrimary,
        }}
      >
        <TableContainer
          sx={{
            overflowX: "auto",
            maxWidth: "100%",
            "&::-webkit-scrollbar": { width: 6, height: 6 },
            "&::-webkit-scrollbar-track": { background: "#111" },
            "&::-webkit-scrollbar-thumb": {
              background: "#333",
              borderRadius: 4,
              "&:hover": { background: "#444" },
            },
          }}
        >
          <Table sx={{ minWidth: 1200, whiteSpace: "nowrap" }}>
            <TableHead>
              <TableRow sx={{ background: dark.surfaceSecondary }}>
                {[
                  "Order ID",
                  "User ID",
                  "User Name",
                  "Products  (Name · ×Qty · Unit Price · Total)",
                  "Order Total",
                  "Payment",
                  "Order Status",
                  "Date",
                  "Actions",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontWeight: 700,
                      fontSize: "12px",
                      color: dark.textMuted,
                      borderColor: dark.border,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 6, borderColor: dark.border }}
                  >
                    <CircularProgress size={28} sx={{ color: "#60A5FA" }} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      py: 6,
                      color: dark.textMuted,
                      borderColor: dark.border,
                    }}
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const isReturned = r.orderStatus === "Returned";

                  return (
                    <TableRow
                      key={r.orderId}
                      hover
                      sx={{
                        "&:hover": { bgcolor: dark.surfaceHover },
                        "& td": {
                          borderColor: dark.borderSubtle,
                          verticalAlign: "middle",
                        },
                      }}
                    >
                      {/* ORDER ID */}
                      <TableCell
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "15px",
                          color: dark.textMuted,
                        }}
                      >
                        {r.orderId}
                      </TableCell>
                      {/* userID */}
                      <TableCell
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "15px",
                          color: dark.textMuted,
                        }}
                      >
                        {r.userId}
                      </TableCell>
                      {/* USER */}
                      <TableCell sx={{ color: dark.textPrimary }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 3 }}
                        >
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              fontSize: 12,
                              bgcolor: isReturned ? "#1e0030" : "#0d1a2e",
                              color: isReturned ? "#C084FC" : "#60A5FA",
                              fontWeight: 700,
                            }}
                          >
                            {initials(r.userName)}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: dark.textPrimary,
                              fontWeight: 500,
                            }}
                          >
                            {r.userName}
                          </Typography>
                          {isReturned && (
                            <Tooltip title="Return requested by user">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "#1e0030",
                                  borderRadius: "50%",
                                  width: 24,
                                  height: 24,
                                  ml: 0.5,
                                }}
                              >
                                <AssignmentReturnOutlinedIcon
                                  sx={{ fontSize: 15, color: "#C084FC" }}
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      {/* PRODUCTS — grouped list */}
                      <TableCell sx={{ py: 1.2 }}>
                        <ProductListCell
                          products={r.products}
                          navigate={navigate}
                        />
                      </TableCell>

                      {/* ORDER TOTAL */}
                      <TableCell
                        sx={{ fontWeight: 700, color: "#4ADE80", fontSize: 14 }}
                      >
                        ₹{r.totalAmount.toLocaleString("en-IN")}
                      </TableCell>

                      {/* PAYMENT */}
                      <TableCell>
                        <Chip
                          label={r.paymentStatus}
                          size="small"
                          sx={{
                            background:
                              r.paymentStatus === "Paid"
                                ? "#00200e"
                                : r.paymentStatus === "Failed"
                                  ? "#2a0000"
                                  : "#2a2000",
                            color:
                              r.paymentStatus === "Paid"
                                ? "#4ADE80"
                                : r.paymentStatus === "Failed"
                                  ? "#F87171"
                                  : "#FBBF24",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>

                      {/* ORDER STATUS */}
                      <TableCell>
                        <Select
                          size="small"
                          value={r.orderStatus}
                          onChange={(e) =>
                            handleStatusUpdate(r.orderId, e.target.value)
                          }
                          sx={{
                            minWidth: 140,
                            borderRadius: 2,
                            color: "#fff",
                            backgroundColor: "#222",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: dark.border,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#444",
                            },
                            "& .MuiSvgIcon-root": { color: dark.textMuted },
                          }}
                          MenuProps={darkSelectMenuProps}
                        >
                          <MenuItem value="Placed">Placed</MenuItem>
                          <MenuItem value="Processing">Processing</MenuItem>
                          <MenuItem value="Shipped">Shipped</MenuItem>
                          <MenuItem value="Delivered">Delivered</MenuItem>
                          <MenuItem value="Cancelled">Cancelled</MenuItem>
                          <MenuItem value="Returned">Returned</MenuItem>
                        </Select>
                      </TableCell>

                      {/* DATE */}
                      <TableCell sx={{ color: dark.textSecondary }}>
                        {r.date}
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => askDelete(r.orderId)}
                          sx={{
                            minWidth: "36px",
                            borderRadius: 2,
                            bgcolor: "#2a0000",
                            color: "#F87171",
                            boxShadow: "none",
                            "&:hover": {
                              bgcolor: "#3d0000",
                              boxShadow: "none",
                            },
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── CONFIRM DELETE DIALOG ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: dark.surfaceSecondary,
            border: `1px solid ${dark.border}`,
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: dark.textPrimary }}>Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: dark.textSecondary }}>
            Are you sure you want to delete this order? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{
              color: dark.textSecondary,
              "&:hover": { bgcolor: dark.surfaceHover },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            variant="contained"
            sx={{
              bgcolor: "#2a0000",
              color: "#F87171",
              boxShadow: "none",
              "&:hover": { bgcolor: "#3d0000", boxShadow: "none" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{
            bgcolor: snack.severity === "success" ? "#00200e" : "#2a0000",
            color: snack.severity === "success" ? "#4ADE80" : "#F87171",
            "& .MuiAlert-icon": {
              color: snack.severity === "success" ? "#4ADE80" : "#F87171",
            },
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderList;
