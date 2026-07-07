// src/pages/DeliveryDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  DoneAll as DoneAllIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Whatshot as WhatshotIcon,
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL;

// ── Status style map ──
const statusStyle = {
  Pending: {
    color: "#f59e0b",
    bg: "#451a0344",
    label: "Pending",
    icon: <AccessTimeIcon fontSize="small" />,
  },
  Placed: {
    color: "#f59e0b",
    bg: "#451a0344",
    label: "Placed",
    icon: <AccessTimeIcon fontSize="small" />,
  },
  Processing: {
    color: "#f97316",
    bg: "#43140744",
    label: "Cooking",
    icon: <WhatshotIcon fontSize="small" />,
  },
  Cooking: {
    color: "#f97316",
    bg: "#43140744",
    label: "Cooking",
    icon: <WhatshotIcon fontSize="small" />,
  },
  Ready: {
    color: "#4ade80",
    bg: "#052e1644",
    label: "Ready for Pickup",
    icon: <CheckCircleIcon fontSize="small" />,
  },
  Out_for_Delivery: {
    color: "#fb923c",
    bg: "#451a0344",
    label: "Out for Delivery",
    icon: <LocalShippingIcon fontSize="small" />,
  },
  Delivered: {
    color: "#34d399",
    bg: "#064e3b44",
    label: "Delivered",
    icon: <DoneAllIcon fontSize="small" />,
  },
  Cancelled: {
    color: "#ef4444",
    bg: "#450a0a44",
    label: "Cancelled",
    icon: <CancelIcon fontSize="small" />,
  },
};

// ── Extract items from populated products ──
const extractItems = (order) =>
  (order.products || []).map((p) => ({
    name:
      p.productId?.productName || p.productId?.name || p.name || "Unknown Item",
    quantity: p.quantity || 1,
    price: p.productId?.price || 0,
  }));

// ── Order Card for Delivery Person ──
const DeliveryOrderCard = ({
  order,
  onTakeJob,
  onUpdateStatus,
  onViewDetails,
  currentDeliveryPersonId,
  hasActiveJob,
}) => {
  const [busy, setBusy] = useState(false);
  const status = order.orderStatus || order.status || "Pending";
  const sStyle = statusStyle[status] || statusStyle.Pending;
  const items = extractItems(order);

  // ✅ FIXED: Get customer data from userId (which references "Register" model)
  const customerData = order.userId || {};
  const customerName =
    customerData?.fullname ||
    customerData?.name ||
    customerData?.username ||
    "Customer";
  const customerPhone =
    customerData?.phone ||
    customerData?.number ||
    customerData?.contactNumber ||
    "";

  // ✅ FIXED: Get delivery person data from deliveryPersonId (which references "Register" model)
  const deliveryPersonData = order.deliveryPersonId || {};
  const deliveryPersonName =
    deliveryPersonData?.fullname ||
    deliveryPersonData?.name ||
    deliveryPersonData?.username ||
    "Assigned";
  const deliveryPersonPhone =
    deliveryPersonData?.phone ||
    deliveryPersonData?.number ||
    deliveryPersonData?.contactNumber ||
    "N/A";

  const address =
    order.deliveryAddress || order.address || "Address not provided";

  // Check if delivery person is assigned
  const isAssignedToMe =
    order.deliveryPersonId?._id === currentDeliveryPersonId ||
    order.deliveryPersonId === currentDeliveryPersonId;

  const isTakenByOther =
    order.deliveryPersonId &&
    order.deliveryPersonId !== currentDeliveryPersonId &&
    order.deliveryPersonId?._id !== currentDeliveryPersonId;

  // Check if this is an active job (not delivered or cancelled)
  const isActiveJob =
    isAssignedToMe && !["Delivered", "Cancelled"].includes(status);

  const handleTakeJob = async () => {
    if (!currentDeliveryPersonId) {
      alert("Please login as delivery person");
      return;
    }
    if (hasActiveJob) {
      // We'll use snackbar but need to pass setMsg from parent
      // For now using alert as fallback
      alert("⚠️ Complete your current delivery before taking a new job!");
      return;
    }
    setBusy(true);
    await onTakeJob(order._id);
    setBusy(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    setBusy(true);
    await onUpdateStatus(order._id, newStatus);
    setBusy(false);
  };

  return (
    <Paper
      sx={{
        p: 0,
        bgcolor: "#111827",
        borderRadius: 3,
        border: isTakenByOther
          ? `1px solid #ef444433`
          : isAssignedToMe
            ? `2px solid ${sStyle.color}66`
            : `1px solid ${sStyle.color}33`,
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 25px ${sStyle.color}22`,
        },
        opacity: isTakenByOther ? 0.7 : 1,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: sStyle.bg,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{ color: sStyle.color, fontWeight: 700, fontSize: 15 }}
          >
            Order #{order._id.slice(-6).toUpperCase()}
          </Typography>
          <Typography sx={{ color: `${sStyle.color}99`, fontSize: 11 }}>
            {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
            ml:1
          }}
        >
          <Chip
            icon={sStyle.icon}
            label={sStyle.label}
            size="small"
            sx={{
              bgcolor: `${sStyle.color}22`,
              color: sStyle.color,
              fontWeight: 600,
              fontSize: 10,
              border: `1px solid ${sStyle.color}44`,
            }}
          />
          {isTakenByOther && (
            <Chip
              label="Taken"
              size="small"
              sx={{
                bgcolor: "#ef444422",
                color: "#ef4444",
                fontWeight: 600,
                fontSize: 10,
              }}
            />
          )}
          {isAssignedToMe && isActiveJob && (
            <Chip
              label="My Active Job"
              size="small"
              sx={{
                bgcolor: "#facc1522",
                color: "#facc15",
                fontWeight: 600,
                fontSize: 10,
                border: "1px solid #facc1544",
              }}
            />
          )}
          {isAssignedToMe && status === "Delivered" && (
            <Chip
              label="Completed "
              size="small"
              sx={{
                bgcolor: "#34d39922",
                color: "#34d399",
                fontWeight: 600,
                fontSize: 10,
              }}
            />
          )}
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* ✅ FIXED: Customer Info with proper data */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ color: "#facc15", fontWeight: "bold" }}>
            Customer
          </Typography>
          <Typography sx={{ color: "#fff" }}>{customerName}</Typography>
          <Typography sx={{ color: "#94a3b8" }}>
            {customerPhone || "N/A"}
          </Typography>

          {/* Delivery Address */}
          {address && address !== "Address not provided" && (
            <Box sx={{ display: "flex", gap: 1, mb: 1.5, mt: 1 }}>
              <LocationOnIcon sx={{ color: "#64748b", fontSize: 16 }} />
              <Typography sx={{ color: "#94a3b8", fontSize: 12 }}>
                {address}
              </Typography>
            </Box>
          )}
        </Box>

        {/* ✅ FIXED: Delivery Partner with proper data */}
        {order.deliveryPersonId && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: "#22c55e", fontWeight: "bold" }}>
              Delivery Partner
            </Typography>
            <Typography sx={{ color: "#fff" }}>{deliveryPersonName}</Typography>
            <Typography sx={{ color: "#94a3b8" }}>
              {deliveryPersonPhone}
            </Typography>
          </Box>
        )}

        <Divider sx={{ borderColor: "#1f2937", mb: 1.5 }} />

        {/* Order Items */}
        <Typography
          sx={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, mb: 1 }}
        >
          Items ({items.length})
        </Typography>
        <Box sx={{ maxHeight: 120, overflow: "auto" }}>
          {items.slice(0, 4).map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.5,
                borderBottom:
                  idx < Math.min(items.length, 4) - 1
                    ? "1px solid #1f2937"
                    : "none",
              }}
            >
              <Typography sx={{ color: "#e5e7eb", fontSize: 13 }}>
                {item.name}
              </Typography>
              <Chip
                label={`×${item.quantity}`}
                size="small"
                sx={{
                  bgcolor: "#0f172a",
                  color: "#facc15",
                  fontWeight: 700,
                  fontSize: 11,
                  height: 20,
                }}
              />
            </Box>
          ))}
          {items.length > 4 && (
            <Typography sx={{ color: "#64748b", fontSize: 12, mt: 0.5 }}>
              +{items.length - 4} more items
            </Typography>
          )}
        </Box>

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
          <Box>
            <Typography sx={{ color: "#64748b", fontSize: 11 }}>
              Total Amount
            </Typography>
            <Typography
              sx={{ color: "#facc15", fontWeight: 700, fontSize: 16 }}
            >
              ₹{order.totalAmount || 0}
            </Typography>
          </Box>

          {/* Action Buttons - Delivery Person Flow */}
          {status === "Pending" && !isTakenByOther && (
            <Button
              variant="contained"
              disabled={busy || hasActiveJob}
              startIcon={<AssignmentIcon />}
              sx={{
                bgcolor: hasActiveJob ? "#6b7280" : "#facc15",
                color: hasActiveJob ? "#fff" : "#000",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: hasActiveJob ? "#6b7280" : "#eab308",
                },
              }}
              onClick={handleTakeJob}
            >
              {busy
                ? "Taking..."
                : hasActiveJob
                  ? "Complete Current Job First"
                  : "Take Job"}
            </Button>
          )}

          {status === "Pending" && isTakenByOther && !isAssignedToMe && (
            <Chip
              label="Already Taken"
              sx={{ bgcolor: "#ef444422", color: "#ef4444", fontWeight: 600 }}
            />
          )}

          {status === "Pending" && isAssignedToMe && (
            <Button
              variant="contained"
              disabled={busy}
              sx={{
                bgcolor: "#f97316",
                color: "#fff",
                fontWeight: 700,
                "&:hover": { bgcolor: "#ea580c" },
              }}
              onClick={() => handleUpdateStatus("Out_for_Delivery")}
            >
              {busy ? "Updating..." : "Start Delivery"}
            </Button>
          )}

          {status === "Ready" && !isAssignedToMe && !isTakenByOther && (
            <Button
              variant="contained"
              disabled={busy || hasActiveJob}
              startIcon={<AssignmentIcon />}
              sx={{
                bgcolor: hasActiveJob ? "#6b7280" : "#facc15",
                color: hasActiveJob ? "#fff" : "#000",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: hasActiveJob ? "#6b7280" : "#eab308",
                },
              }}
              onClick={handleTakeJob}
            >
              {busy
                ? "Taking..."
                : hasActiveJob
                  ? "Complete Current Job First"
                  : "Take Job"}
            </Button>
          )}

          {status === "Ready" && isAssignedToMe && (
            <Button
              variant="contained"
              disabled={busy}
              sx={{
                bgcolor: "#f97316",
                color: "#fff",
                fontWeight: 700,
                "&:hover": { bgcolor: "#ea580c" },
              }}
              onClick={() => handleUpdateStatus("Out_for_Delivery")}
            >
              {busy ? "Updating..." : "Start Delivery"}
            </Button>
          )}

          {status === "Ready" && isTakenByOther && !isAssignedToMe && (
            <Chip
              label="Taken by Another"
              sx={{ bgcolor: "#ef444422", color: "#ef4444", fontWeight: 600 }}
            />
          )}

          {status === "Out_for_Delivery" && isAssignedToMe && (
            <Button
              variant="contained"
              disabled={busy}
              startIcon={<CheckCircleIcon />}
              sx={{
                bgcolor: "#4ade80",
                color: "#000",
                fontWeight: 700,
                "&:hover": { bgcolor: "#22c55e" },
              }}
              onClick={() => handleUpdateStatus("Delivered")}
            >
              {busy ? "Updating..." : "Mark Delivered"}
            </Button>
          )}

          {status === "Out_for_Delivery" && !isAssignedToMe && (
            <Chip
              label="In Transit"
              sx={{ bgcolor: "#fb923c22", color: "#fb923c", fontWeight: 600 }}
            />
          )}

          {status === "Delivered" && (
            <Chip
              label="Delivered"
              sx={{ bgcolor: "#34d39922", color: "#34d399", fontWeight: 600 }}
            />
          )}

          {status === "Cancelled" && (
            <Chip
              label=" Cancelled"
              sx={{ bgcolor: "#ef444422", color: "#ef4444", fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// ── Main Delivery Dashboard ──
const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ open: false, text: "", severity: "info" });
  const [filter, setFilter] = useState("all");
  const [currentDeliveryPersonId, setCurrentDeliveryPersonId] = useState(null);

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentDeliveryPersonId(payload.userId || payload.id);
      } catch (error) {
        console.error("Error parsing token:", error.message);
      }
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API}/order/all-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allOrders = res.data.orders || res.data.data || [];
      if (allOrders.length > 0) {
        const sample = allOrders[0];

        // ✅ Check if data is populated
        if (!sample.userId?.name) {
          console.warn(
            "⚠️ WARNING: User name is missing! Backend population failed.",
          );
          console.warn("User data received:", sample.userId);
        }
        if (sample.deliveryPersonId && !sample.deliveryPersonId?.name) {
          console.warn(
            "⚠️ WARNING: Delivery person name is missing! Backend population failed.",
          );
          console.warn(
            "Delivery person data received:",
            sample.deliveryPersonId,
          );
        }
      }

      // Filter only delivery orders
      const deliveryOrders = allOrders.filter(
        (order) =>
          order.orderType === "delivery" ||
          order.deliveryAddress ||
          order.address,
      );

      setOrders(deliveryOrders);
    } catch (error) {
      console.error("Fetch delivery orders error:", error.message);
      setMsg({
        open: true,
        text: "Failed to fetch orders",
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

  // Take Job - Assign delivery person to order
  const takeJob = async (orderId) => {
    try {
      // Check if already has an active job before making API call
      const hasActive = orders.some((o) => {
        const isMine =
          o.deliveryPersonId?._id === currentDeliveryPersonId ||
          o.deliveryPersonId === currentDeliveryPersonId;
        const status = o.orderStatus || o.status || "";
        return isMine && !["Delivered", "Cancelled"].includes(status);
      });

      if (hasActive) {
        setMsg({
          open: true,
          text: "⚠️ Complete your current delivery before taking a new job!",
          severity: "warning",
        });
        return;
      }

      await axios.put(
        `${API}/order/assign-delivery/${orderId}`,
        { deliveryPersonId: currentDeliveryPersonId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setMsg({
        open: true,
        text: "Job taken successfully! 🏍️",
        severity: "success",
      });
      fetchOrders();
    } catch (error) {
      console.error("Take job error:", error.message);
      setMsg({
        open: true,
        text: error.response?.data?.message || "Failed to take job",
        severity: "error",
      });
    }
  };

  // Update order status
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `${API}/order/update-order/${id}`,
        { orderStatus: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setMsg({
        open: true,
        text: `Order marked as ${newStatus.replace(/_/g, " ")} 🎉`,
        severity: "success",
      });
      fetchOrders();
    } catch (error) {
      console.error("Update error:", error.message);
      setMsg({
        open: true,
        text: error.response?.data?.message || "Failed to update order",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#0f172a",
        }}
      >
        <CircularProgress sx={{ color: "#facc15" }} />
      </Box>
    );
  }

  // Check if delivery person has an active job
  const hasActiveJob = orders.some((o) => {
    const isMine =
      o.deliveryPersonId?._id === currentDeliveryPersonId ||
      o.deliveryPersonId === currentDeliveryPersonId;
    const status = o.orderStatus || o.status || "";
    return isMine && !["Delivered", "Cancelled"].includes(status);
  });

  // Filter orders
  const getFilteredOrders = () => {
    let filtered = orders;

    if (filter === "available") {
      filtered = orders.filter((o) => {
        const status = o.orderStatus || o.status || "";
        const hasDeliveryPerson = !!o.deliveryPersonId;
        const isReady = status === "Ready";
        return isReady && !hasDeliveryPerson;
      });
    } else if (filter === "my-jobs") {
      filtered = orders.filter((o) => {
        const isMine =
          o.deliveryPersonId?._id === currentDeliveryPersonId ||
          o.deliveryPersonId === currentDeliveryPersonId;
        return isMine;
      });
    } else if (filter === "completed") {
      filtered = orders.filter((o) => {
        const isMine =
          o.deliveryPersonId?._id === currentDeliveryPersonId ||
          o.deliveryPersonId === currentDeliveryPersonId;
        const status = o.orderStatus || o.status || "";
        return isMine && status === "Delivered";
      });
    }
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Count statistics
  const availableOrders = orders.filter((o) => {
    const status = o.orderStatus || o.status || "";
    const hasDeliveryPerson = !!o.deliveryPersonId;
    return status === "Ready" && !hasDeliveryPerson;
  }).length;

  const myActiveJobs = orders.filter((o) => {
    const isMine =
      o.deliveryPersonId?._id === currentDeliveryPersonId ||
      o.deliveryPersonId === currentDeliveryPersonId;
    const status = o.orderStatus || o.status || "";
    return isMine && !["Delivered", "Cancelled"].includes(status);
  }).length;

  const completedCount = orders.filter((o) => {
    const isMine =
      o.deliveryPersonId?._id === currentDeliveryPersonId ||
      o.deliveryPersonId === currentDeliveryPersonId;
    const status = o.orderStatus || o.status || "";
    return isMine && status === "Delivered";
  }).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", p: 3, mt: 8 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#fff" }}>
            🏍️ Delivery Dashboard
          </Typography>
          <Typography sx={{ color: "#9ca3af", mt: 0.5 }}>
            Manage your delivery jobs
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Chip
            label={`${availableOrders} Available`}
            sx={{
              bgcolor: "#4ade8022",
              color: "#4ade80",
              fontWeight: 700,
              border: "1px solid #4ade8044",
            }}
          />
          <Chip
            label={`${myActiveJobs} My Jobs`}
            sx={{
              bgcolor: myActiveJobs > 0 ? "#facc1522" : "#6b728022",
              color: myActiveJobs > 0 ? "#facc15" : "#6b7280",
              fontWeight: 700,
              border: `1px solid ${myActiveJobs > 0 ? "#facc1544" : "#6b728044"}`,
            }}
          />
          <Chip
            label={`${completedCount} Completed`}
            sx={{
              bgcolor: "#34d39922",
              color: "#34d399",
              fontWeight: 700,
              border: "1px solid #34d39944",
            }}
          />
        </Box>
      </Box>

      {/* Filter Buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {[
          { value: "all", label: "All Orders" },
          { value: "available", label: `Available (${availableOrders})` },
          { value: "my-jobs", label: `My Jobs (${myActiveJobs})` },
          { value: "completed", label: `Completed (${completedCount})` },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "contained" : "outlined"}
            size="small"
            sx={{
              bgcolor: filter === f.value ? "#facc15" : "transparent",
              color: filter === f.value ? "#000" : "#94a3b8",
              borderColor: filter === f.value ? "#facc15" : "#334155",
              "&:hover": {
                bgcolor: filter === f.value ? "#facc15" : "#1e293b",
                borderColor: "#facc15",
              },
            }}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </Box>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "#111827",
            borderRadius: 3,
            border: "1px dashed #1f2937",
          }}
        >
          <LocalShippingIcon sx={{ color: "#1f2937", fontSize: 60, mb: 2 }} />
          <Typography sx={{ color: "#4b5563", fontSize: 18, fontWeight: 600 }}>
            No delivery orders found
          </Typography>
          <Typography sx={{ color: "#374151", fontSize: 14, mt: 1 }}>
            {filter === "all"
              ? "Orders will appear here when they are ready for delivery"
              : filter === "available"
                ? "No available orders right now. Check back later!"
                : filter === "my-jobs"
                  ? "You haven't taken any jobs yet"
                  : "No completed deliveries yet"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredOrders.map((order) => (
            <Grid item xs={12} sm={6} md={6} lg={4} key={order._id}>
              <DeliveryOrderCard
                order={order}
                onTakeJob={takeJob}
                onUpdateStatus={updateStatus}
                onViewDetails={(id) => navigate(`/delivery/order/${id}`)}
                currentDeliveryPersonId={currentDeliveryPersonId}
                hasActiveJob={hasActiveJob}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={msg.open}
        autoHideDuration={3000}
        onClose={() => setMsg((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={msg.severity} variant="filled">
          {msg.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeliveryDashboard;
