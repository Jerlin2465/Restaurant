// src/pages/Workers/Serverfoodorder.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import ReceiptIcon from "@mui/icons-material/Receipt";

const API = import.meta.env.VITE_API_URL;

const STATUS = {
  Pending: {
    color: "#f59e0b",
    bg: "#451a03",
    label: "Pending",
    icon: <AccessTimeIcon fontSize="small" />,
  },
  Cooking: {
    color: "#f97316",
    bg: "#431407",
    label: "Cooking",
    icon: <WhatshotIcon fontSize="small" />,
  },
  Ready: {
    color: "#4ade80",
    bg: "#052e16",
    label: "Ready to Serve",
    icon: <CheckCircleIcon fontSize="small" />,
  },
  Served: {
    color: "#94a3b8",
    bg: "#1e293b",
    label: "Served",
    icon: <LocalDiningIcon fontSize="small" />,
  },
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, onServe }) => {
  const [busy, setBusy] = useState(false);
  const cfg = STATUS[order.status] ?? STATUS.Pending;
  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const isReady = order.status === "Ready";

  const handleServe = async () => {
    setBusy(true);
    await onServe(order);
    setBusy(false);
  };

  return (
    <Paper
      elevation={isReady ? 6 : 1}
      sx={{
        bgcolor: "#111827",
        borderRadius: 3,
        overflow: "hidden",
        border: `1.5px solid ${isReady ? cfg.color : cfg.color + "44"}`,
        boxShadow: isReady ? `0 0 16px ${cfg.color}33` : "none",
        transition: "box-shadow 0.3s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          bgcolor: cfg.bg,
          px: 2,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TableRestaurantIcon sx={{ color: cfg.color, fontSize: 18 }} />
          <Typography sx={{ color: cfg.color, fontWeight: 700, fontSize: 15 }}>
            Table #{order.tableNumber}
          </Typography>
        </Box>
        <Chip
          icon={cfg.icon}
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: `${cfg.color}22`,
            color: cfg.color,
            fontWeight: 700,
            fontSize: 11,
            border: `1px solid ${cfg.color}44`,
          }}
        />
      </Box>

      <Divider sx={{ borderColor: "#1f2937" }} />

      {/* Items */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1, flexGrow: 1 }}>
        {order.items.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 0.5,
            }}
          >
            <Typography sx={{ color: "#e5e7eb", fontSize: 14 }}>
              {item.name}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>
                ×{item.quantity}
              </Typography>
              <Typography
                sx={{
                  color: "#d1d5db",
                  fontSize: 13,
                  minWidth: 52,
                  textAlign: "right",
                }}
              >
                ₹{(item.price * item.quantity).toFixed(0)}
              </Typography>
            </Box>
          </Box>
        ))}

        <Divider sx={{ borderColor: "#1f2937", mt: 1, mb: 0.5 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography sx={{ color: "#6b7280", fontSize: 12 }}>Total</Typography>
          <Typography sx={{ color: "#facc15", fontWeight: 700, fontSize: 15 }}>
            ₹{total.toFixed(0)}
          </Typography>
        </Box>
      </Box>

      {/* Action area */}
      <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
        {order.status === "Pending" && (
          <Chip
            label="⏳ Waiting for chef"
            size="small"
            sx={{
              width: "100%",
              bgcolor: "#451a0344",
              color: "#f59e0b",
              fontWeight: 600,
              fontSize: 12,
              borderRadius: 2,
            }}
          />
        )}
        {order.status === "Cooking" && (
          <Chip
            label="🔥 Cooking in progress"
            size="small"
            sx={{
              width: "100%",
              bgcolor: "#43140744",
              color: "#f97316",
              fontWeight: 600,
              fontSize: 12,
              borderRadius: 2,
            }}
          />
        )}
        {order.status === "Ready" && (
          <Button
            fullWidth
            variant="contained"
            disabled={busy}
            startIcon={busy ? <ReceiptIcon /> : <LocalDiningIcon />}
            onClick={handleServe}
            sx={{
              mt: 0.5,
              bgcolor: "#4ade80",
              color: "#000",
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 2,
              "&:hover": { bgcolor: "#22c55e" },
              "&:disabled": { bgcolor: "#166534", color: "#86efac" },
            }}
          >
            {busy ? "Adding to Bill…" : "Serve & Add to Bill"}
          </Button>
        )}
        {order.status === "Served" && (
          <Chip
            label="✅ Delivered — Added to bill"
            size="small"
            sx={{
              width: "100%",
              bgcolor: "#1e293b",
              color: "#94a3b8",
              fontWeight: 600,
              fontSize: 12,
              borderRadius: 2,
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

const EmptyState = ({ label }) => (
  <Box textAlign="center" py={8}>
    <Typography sx={{ color: "#4b5563", fontSize: 40, mb: 1 }}>🍽</Typography>
    <Typography sx={{ color: "#4b5563", fontSize: 16 }}>{label}</Typography>
  </Box>
);

// ─── Main Serverfoodorders 
const Serverfoodorders = ({ onServed }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/food/server-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setOrders(res.data.orders);
    } catch {
      setSnack({
        open: true,
        text: "Failed to load orders",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 15000);
    return () => clearInterval(timer);
  }, []);

  // Called when server clicks "Serve & Add to Bill"
  // Backend updateOrderStatus sets status="Served" and auto-adds items to the open bill
  const serveOrder = async (order) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/food/update-status/${order._id}`,
        { status: "Served" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.data.success)
        throw new Error(res.data.message || "Failed to update order");

      setSnack({
        open: true,
        text: `Served! Items added to Table #${order.tableNumber} bill`,
        severity: "success",
      });
      fetchOrders();
      if (onServed) onServed(); // switches parent to Bill tab
    } catch (err) {
      setSnack({
        open: true,
        text: err?.response?.data?.message || err.message || "Failed to serve",
        severity: "error",
      });
    }
  };

  if (loading)
    return (
      <Box textAlign="center" py={8}>
        <CircularProgress sx={{ color: "#4ade80" }} />
        <Typography sx={{ color: "#9ca3af", mt: 2 }}>
          Loading orders…
        </Typography>
      </Box>
    );

  const readyOrders = orders.filter((o) => o.status === "Ready");
  const activeOrders = orders.filter((o) =>
    ["Pending", "Cooking"].includes(o.status),
  );
  const servedOrders = orders.filter((o) => o.status === "Served");

  const tabData = [
    {
      label: "Ready to Serve",
      orders: readyOrders,
      count: readyOrders.length,
      color: "success",
      empty: "No orders ready right now",
    },
    {
      label: "In Progress",
      orders: activeOrders,
      count: activeOrders.length,
      color: "warning",
      empty: "No active orders",
    },
    {
      label: "Served",
      orders: servedOrders,
      count: servedOrders.length,
      color: "default",
      empty: "No served orders yet",
    },
  ];

  return (
    <Box>
      {/* Summary chips */}
      <Box display="flex" gap={1.5} flexWrap="wrap" mb={3}>
        {[
          { label: `${readyOrders.length} Ready`, color: "#4ade80" },
          { label: `${activeOrders.length} Active`, color: "#f97316" },
          { label: `${servedOrders.length} Served`, color: "#94a3b8" },
        ].map((s) => (
          <Chip
            key={s.label}
            label={s.label}
            sx={{
              bgcolor: `${s.color}22`,
              color: s.color,
              fontWeight: 700,
              border: `1px solid ${s.color}44`,
            }}
          />
        ))}
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          borderBottom: "1px solid #1f2937",
          "& .MuiTab-root": {
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "none",
            fontSize: 14,
          },
          "& .Mui-selected": { color: "#facc15 !important" },
          "& .MuiTabs-indicator": { bgcolor: "#facc15" },
        }}
      >
        {tabData.map((t, i) => (
          <Tab
            key={i}
            label={
              <Badge
                badgeContent={t.count}
                color={t.color}
                sx={{ "& .MuiBadge-badge": { right: -8, top: 2 } }}
              >
                <Box component="span" pr={t.count > 0 ? 2 : 0}>
                  {t.label}
                </Box>
              </Badge>
            }
          />
        ))}
      </Tabs>

      {tabData[tab].orders.length === 0 ? (
        <EmptyState label={tabData[tab].empty} />
      ) : (
        <Grid container spacing={2.5}>
          {tabData[tab].orders.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <OrderCard order={order} onServe={serveOrder} />
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
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

export default Serverfoodorders;
