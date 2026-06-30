// src/pages/Workers/Deliveryfooddetails.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
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
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL;

const Deliveryfooddetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ open: false, text: "", severity: "info" });

  // FIXED: Check if id exists before fetching
  const fetchOrder = async () => {
    if (!id) {
      setLoading(false);
      setMsg({ open: true, text: "Invalid order ID", severity: "error" });
      return;
    }

    try {
      const res = await axios.get(`${API}/order/order/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrder(res.data.order);
    } catch (error) {
      console.error("Fetch error:", error);
      setMsg({
        open: true,
        text: "Failed to fetch order details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await axios.put(
        `${API}/order/update-order/${id}`,
        { orderStatus: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      setMsg({
        open: true,
        text: `Order marked as ${newStatus.replace(/_/g, " ")}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Update error:", error);
      setMsg({ open: true, text: "Failed to update order", severity: "error" });
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

  if (!order) {
    return (
      <Box sx={{ p: 3, bgcolor: "#0f172a", minHeight: "100vh", mt: 8 }}>
        <Paper
          sx={{
            bgcolor: "#111827",
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#ef4444", fontSize: 18, mb: 2 }}>
            ❌ Order Not Found
          </Typography>
          <Button
            variant="contained"
            sx={{ bgcolor: "#facc15", color: "#000", fontWeight: 700 }}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Paper>
      </Box>
    );
  }

  const status = order.orderStatus || order.status || "Pending";
  const customerName =
    order.userId?.fullname || order.userId?.name || "Customer";
  const customerPhone = order.userId?.phone || order.phone || "Not provided";
  const address =
    order.deliveryAddress || order.address || "Address not provided";
  const items = order.products || order.items || [];

  return (
    <Box sx={{ bgcolor: "#0f172a", minHeight: "100vh", p: 3, mt: 8 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        sx={{ color: "#93c5fd", mb: 3 }}
        onClick={() => navigate(-1)}
      >
        Back to Dashboard
      </Button>

      <Paper
        sx={{
          bgcolor: "#111827",
          p: 3,
          borderRadius: 3,
          maxWidth: 800,
          mx: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
              Order #{order._id?.slice(-6).toUpperCase() || "N/A"}
            </Typography>
            <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Chip
            label={status.replace(/_/g, " ")}
            sx={{
              bgcolor: status === "Delivered" ? "#4ade8022" : "#f59e0b22",
              color: status === "Delivered" ? "#4ade80" : "#f59e0b",
              fontWeight: 700,
            }}
          />
        </Box>

        <Divider sx={{ borderColor: "#1f2937", mb: 3 }} />

        {/* Customer Info */}
        <Typography
          sx={{ color: "#94a3b8", fontSize: 14, fontWeight: 600, mb: 2 }}
        >
          👤 Customer Information
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            bgcolor: "#1e293b",
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#facc1544",
              color: "#facc15",
              width: 48,
              height: 48,
            }}
          >
            {customerName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
              {customerName}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon sx={{ color: "#64748b", fontSize: 14 }} />
                <Typography sx={{ color: "#94a3b8", fontSize: 13 }}>
                  {customerPhone}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Delivery Address */}
        <Typography
          sx={{ color: "#94a3b8", fontSize: 14, fontWeight: 600, mb: 2 }}
        >
          📍 Delivery Address
        </Typography>
        <Paper
          sx={{
            bgcolor: "#1e293b",
            p: 2,
            borderRadius: 2,
            mb: 3,
            border: "1px solid #334155",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <LocationOnIcon sx={{ color: "#facc15", mt: 0.3 }} />
            <Typography sx={{ color: "#e2e8f0" }}>{address}</Typography>
          </Box>
        </Paper>

        {/* Order Items */}
        <Typography
          sx={{ color: "#94a3b8", fontSize: 14, fontWeight: 600, mb: 2 }}
        >
          🛒 Order Items
        </Typography>
        <Paper sx={{ bgcolor: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
          {items.length > 0 ? (
            items.map((item, index) => {
              const itemName =
                item.productId?.productName ||
                item.productId?.name ||
                item.name ||
                "Unknown";
              const itemPrice = item.productId?.price || item.price || 0;
              const quantity = item.quantity || 1;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderBottom:
                      index < items.length - 1 ? "1px solid #334155" : "none",
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#e2e8f0", fontWeight: 500 }}>
                      {itemName}
                    </Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 13 }}>
                      ₹{itemPrice} × {quantity}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ color: "#facc15", fontWeight: 700, fontSize: 16 }}
                  >
                    ₹{itemPrice * quantity}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Typography sx={{ color: "#6b7280", p: 2, textAlign: "center" }}>
              No items found
            </Typography>
          )}

          <Divider sx={{ borderColor: "#334155" }} />

          {/* Total */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              bgcolor: "#0f172a",
            }}
          >
            <Typography
              sx={{ color: "#e2e8f0", fontWeight: 600, fontSize: 16 }}
            >
              Total Amount
            </Typography>
            <Typography
              sx={{ color: "#facc15", fontWeight: 700, fontSize: 22 }}
            >
              ₹{order.totalAmount || 0}
            </Typography>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ mt: 3 }}>
          {status === "Pending" && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<LocalShippingIcon />}
              sx={{
                bgcolor: "#f97316",
                color: "#fff",
                fontWeight: 700,
                "&:hover": { bgcolor: "#ea580c" },
              }}
              onClick={() => updateStatus("Out_for_Delivery")}
            >
              Start Delivery
            </Button>
          )}
          {status === "Ready" && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<LocalShippingIcon />}
              sx={{
                bgcolor: "#f97316",
                color: "#fff",
                fontWeight: 700,
                "&:hover": { bgcolor: "#ea580c" },
              }}
              onClick={() => updateStatus("Out_for_Delivery")}
            >
              Pick Up & Start Delivery
            </Button>
          )}
          {status === "Out_for_Delivery" && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircleIcon />}
              sx={{
                bgcolor: "#4ade80",
                color: "#000",
                fontWeight: 700,
                "&:hover": { bgcolor: "#22c55e" },
              }}
              onClick={() => updateStatus("Delivered")}
            >
              Mark as Delivered
            </Button>
          )}
          {status === "Delivered" && (
            <Button
              fullWidth
              variant="contained"
              disabled
              sx={{ bgcolor: "#4ade8022", color: "#4ade80", fontWeight: 700 }}
            >
              ✅ Order Delivered
            </Button>
          )}
          {status === "Cancelled" && (
            <Button
              fullWidth
              variant="contained"
              disabled
              sx={{ bgcolor: "#ef444422", color: "#ef4444", fontWeight: 700 }}
            >
              ❌ Order Cancelled
            </Button>
          )}
        </Box>
      </Paper>

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

export default Deliveryfooddetails;
