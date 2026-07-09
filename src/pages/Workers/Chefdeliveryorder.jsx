// src/pages/Workers/Chefdeliveryorder.jsx
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
  Avatar,
  Stack,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import WhatshotIcon from "@mui/icons-material/Whatshot";

const API = import.meta.env.VITE_API_URL;

// Status config for delivery orders - Only Pending, Cooking, Ready
const deliveryStatusConfig = {
  Placed: {
    color: "#f59e0b",
    bg: "#451a03",
    label: "Placed",
    icon: <AccessTimeIcon fontSize="small" />,
  },

  Processing: {
    color: "#f97316",
    bg: "#431407",
    label: "Cooking",
    icon: <WhatshotIcon fontSize="small" />,
  },

  Ready: {
    color: "#4ade80",
    bg: "#052e16",
    label: "Ready for Pickup",
    icon: <CheckCircleIcon fontSize="small" />,
  },
};

// ── Delivery Order Card ──
const DeliveryOrderCard = ({ order, onUpdateStatus }) => {
  const [busy, setBusy] = useState(false);
  const status = order.orderStatus || order.status || "Pending";
  const cfg = deliveryStatusConfig[status] || deliveryStatusConfig.Pending;

  const customerName =
    order.userId?.fullname || order.userId?.name || "Customer";
  const customerPhone = order.userId?.phone || order.phone || "";
  const items = order.products || order.items || [];
  const address =
    order.deliveryAddress || order.address || "Address not provided";

  const handleUpdateStatus = async (newStatus) => {
    setBusy(true);
    await onUpdateStatus(order._id, newStatus);
    setBusy(false);
  };

  return (
    <Paper
      sx={{
        bgcolor: "#111827",
        borderRadius: 3,
        overflow: "hidden",
        border: `1.5px solid ${cfg.color}33`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 25px ${cfg.color}22`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: cfg.bg,
          px: 2.5,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography sx={{ color: cfg.color, fontWeight: 700, fontSize: 15 }}>
            Order #{order._id?.slice(-6).toUpperCase() || "N/A"}
          </Typography>
          <Typography sx={{ color: `${cfg.color}99`, fontSize: 11 }}>
            {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <Chip
          icon={cfg.icon}
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: `${cfg.color}22`,
            color: cfg.color,
            fontWeight: 600,
            fontSize: 10,
          }}
        />
      </Box>

      <Divider sx={{ borderColor: "#1f2937", my: 1 }} />

      {/* Customer Info */}
      <Box sx={{ px: 2.5, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 1.5,
            p: 1.5,
            bgcolor: "#1e293b",
            borderRadius: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#facc1544",
              color: "#facc15",
              width: 36,
              height: 36,
            }}
          >
            {customerName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}
            >
              {customerName}
            </Typography>
            {customerPhone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon sx={{ color: "#64748b", fontSize: 12 }} />
                <Typography sx={{ color: "#94a3b8", fontSize: 12 }}>
                  {customerPhone}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Delivery Address */}
        {/* {address && address !== "Address not provided" ? (
          <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
            <LocationOnIcon sx={{ color: "#64748b", fontSize: 16 }} />
            <Typography sx={{ color: "#94a3b8", fontSize: 12 }}>
              {address}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
            <RestaurantIcon sx={{ color: "#64748b", fontSize: 16 }} />
            <Typography
              sx={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic" }}
            >
              Dine-in / Pickup Order (No delivery address)
            </Typography>
          </Box>
        )} */}

        <Divider sx={{ borderColor: "#1f2937", mb: 1.5 }} />

        {/* Order Items */}
        <Typography
          sx={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, mb: 1 }}
        >
          Items ({items.length})
        </Typography>
        {items.slice(0, 3).map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              py: 0.5,
              borderBottom:
                idx < Math.min(items.length, 3) - 1
                  ? "1px solid #1f2937"
                  : "none",
            }}
          >
            <Typography sx={{ color: "#e5e7eb", fontSize: 15 }}>
              {item.productId?.productname ||
                item.productId?.name ||
                item.name ||
                "Unknown"}
            </Typography>
            <Chip
              label={`×${item.quantity}`}
              size="small"
              sx={{
                bgcolor: "#0f172a",
                color: "#facc15",
                fontWeight: 700,
                fontSize: 13,
                height: 20,
              }}
            />
          </Box>
        ))}
        {items.length > 3 && (
          <Typography sx={{ color: "#64748b", fontSize: 12, mt: 0.5 }}>
            +{items.length - 3} more items
          </Typography>
        )}

        <Divider sx={{ borderColor: "#1f2937", my: 1.5 }} />

        {/* Total and Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {/* 1. Placed */}
          {status === "Placed" && (
            <Button
              variant="contained"
              disabled={busy}
              sx={{
                bgcolor: "#f97316",
                color: "#fff",
                fontWeight: 700,
                "&:hover": { bgcolor: "#ea580c" },
              }}
              onClick={() => handleUpdateStatus("Processing")}
            >
              {busy ? "Starting..." : "Start Cooking"}
            </Button>
          )}

          {/* 2. Processing */}
          {status === "Processing" && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label="Cooking"
                sx={{
                  bgcolor: "#f9731622",
                  color: "#f97316",
                  fontWeight: 700,
                }}
              />

              <Button
                variant="contained"
                disabled={busy}
                sx={{
                  bgcolor: "#22c55e",
                  color: "#fff",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#16a34a" },
                }}
                onClick={() => handleUpdateStatus("Ready")}
              >
                {busy ? "Updating..." : "Ready"}
              </Button>
            </Stack>
          )}

          {/* 3. Ready */}
          {status === "Ready" && (
            <Chip
              label="Waiting for Pickup"
              sx={{
                bgcolor: "#3b82f622",
                color: "#3b82f6",
                fontWeight: 700,
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// ── Main Chef Delivery Orders Tab ──
const Chefdeliveryorder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // ✅ FIXED: Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchOrders = async () => {
    try {
      const token = getToken();

      if (!token) {
        console.error("No token found in localStorage");
        setSnackbar({
          open: true,
          message: "Please login to view orders",
          severity: "error",
        });
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API}/order/all-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allOrders = res.data.orders || res.data.data || [];
      console.log(
        "First order's first product item:",
        JSON.stringify(
          allOrders[0]?.products?.[0] || allOrders[0]?.items?.[0],
          null,
          2,
        ),
      );

      // Filter only delivery orders (orders with delivery address)
      const deliveryOrders = allOrders.filter(
        (order) =>
          order.orderType === "delivery" ||
          order.deliveryAddress ||
          order.address,
      );

      setOrders(deliveryOrders);
    } catch (error) {
      console.error("Fetch delivery orders error:", error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to fetch orders",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const token = getToken();

      if (!token) {
        setSnackbar({
          open: true,
          message: "Please login to update orders",
          severity: "error",
        });
        return;
      }

      await axios.put(
        `${API}/order/update-order/${id}`,
        { orderStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSnackbar({
        open: true,
        message: `Order status updated to ${newStatus}`,
        severity: "success",
      });

      fetchOrders();
    } catch (error) {
      console.error("Update error:", error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update order",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#facc15" }} />
      </Box>
    );
  }

  // Group orders by status - Only Pending, Cooking, Ready
  const pendingOrders = orders.filter((o) => o.orderStatus === "Placed");

  const cookingOrders = orders.filter((o) => o.orderStatus === "Processing");

  const readyOrders = orders.filter((o) => o.orderStatus === "Ready");

  // Counts for chips
  const pendingCount = pendingOrders.length;
  const cookingCount = cookingOrders.length;
  const readyCount = readyOrders.length;

  return (
    <Box sx={{ mt: 2 }}>
      {/* Summary Chips */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          marginBottom: 4,
        }}
      >
        {[
          { label: `${pendingCount} Pending`, color: "#f59e0b" },
          { label: `${cookingCount} Cooking`, color: "#f97316" },
          { label: `${readyCount} Ready for Pickup`, color: "#4ade80" },
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

      {/* 1. PENDING ORDERS - Waiting for chef */}
      {pendingOrders.length > 0 && (
        <>
          <Typography
            sx={{ color: "#f59e0b", fontWeight: 700, fontSize: 16, mb: 2 }}
          >
            📋 Pending Orders ({pendingOrders.length})
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {pendingOrders.map((o) => (
              <Grid item xs={12} sm={6} md={4} key={o._id}>
                <DeliveryOrderCard
                  order={o}
                  onUpdateStatus={updateOrderStatus}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* 2. COOKING ORDERS - Being cooked */}
      {cookingOrders.length > 0 && (
        <>
          <Typography
            sx={{ color: "#f97316", fontWeight: 700, fontSize: 16, mb: 2 }}
          >
            👨‍🍳 Cooking Orders ({cookingOrders.length})
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {cookingOrders.map((o) => (
              <Grid item xs={12} sm={6} md={4} key={o._id}>
                <DeliveryOrderCard
                  order={o}
                  onUpdateStatus={updateOrderStatus}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* 3. READY ORDERS - Ready for pickup */}
      {readyOrders.length > 0 && (
        <>
          <Typography
            sx={{ color: "#4ade80", fontWeight: 700, fontSize: 16, mb: 2 }}
          >
            ✅ Ready for Pickup ({readyOrders.length})
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {readyOrders.map((o) => (
              <Grid item xs={12} sm={6} md={4} key={o._id}>
                <DeliveryOrderCard
                  order={o}
                  onUpdateStatus={updateOrderStatus}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {orders.length === 0 && (
        <Box textAlign="center" py={8}>
          <LocalShippingIcon sx={{ color: "#4b5563", fontSize: 48 }} />
          <Typography sx={{ color: "#4b5563", fontSize: 18, mt: 2 }}>
            No delivery orders
          </Typography>
          <Typography sx={{ color: "#374151", fontSize: 14, mt: 1 }}>
            When customers place delivery orders, they will appear here.
          </Typography>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chefdeliveryorder;
