import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Avatar,
  CircularProgress,
  Divider,
  Stack,
  Paper,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";

import { useNavigate } from "react-router-dom";

const STEPS = ["Placed", "Processing", "Shipped", "Delivered"];

const STATUS_COLORS = {
  Placed: "#6366f1",
  Processing: "#f97316",
  Shipped: "#0ea5e9",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
  Returned: "#8b5cf6",
};

const STEP_THEMES = {
  Placed: {
    activeColor: "#6366f1",
    completedColor: "#4f46e5",
    inactiveColor: "#c7d2fe",
    bg: "#eef2ff",
    border: "#c7d2fe",
    titleColor: "#3730a3",
    connectorActive: "#6366f1",
    connectorInactive: "#c7d2fe",
  },
  Processing: {
    activeColor: "#f97316",
    completedColor: "#ea580c",
    inactiveColor: "#fed7aa",
    bg: "#fff7ed",
    border: "#fed7aa",
    titleColor: "#7c2d12",
    connectorActive: "#f97316",
    connectorInactive: "#fed7aa",
  },
  Shipped: {
    activeColor: "#0ea5e9",
    completedColor: "#0284c7",
    inactiveColor: "#bae6fd",
    bg: "#f0f9ff",
    border: "#bae6fd",
    titleColor: "#0c4a6e",
    connectorActive: "#0ea5e9",
    connectorInactive: "#bae6fd",
  },
  Delivered: {
    activeColor: "#10b981",
    completedColor: "#059669",
    inactiveColor: "#a7f3d0",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    titleColor: "#065f46",
    connectorActive: "#10b981",
    connectorInactive: "#a7f3d0",
  },
  Cancelled: {
    activeColor: "#ef4444",
    completedColor: "#dc2626",
    inactiveColor: "#fecaca",
    bg: "#fef2f2",
    border: "#fecaca",
    titleColor: "#7f1d1d",
    connectorActive: "#ef4444",
    connectorInactive: "#fecaca",
  },
};

const STEP_ICON_MAP = {
  1: <ShoppingBagOutlinedIcon fontSize="small" />,
  2: <AutorenewRoundedIcon fontSize="small" />,
  3: <LocalShippingRoundedIcon fontSize="small" />,
  4: <CheckCircleRoundedIcon fontSize="small" />,
};

const ColorConnector = styled(StepConnector)(
  ({ activecolor, completedcolor, inactivecolor }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 20 },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: { borderColor: activecolor },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: { borderColor: completedcolor },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: inactivecolor,
      borderTopWidth: 3,
      borderRadius: 2,
    },
  }),
);

const CustomStepIcon = ({ active, completed, icon, theme }) => {
  const color = completed
    ? theme.completedColor
    : active
      ? theme.activeColor
      : theme.inactiveColor;

  return (
    <Avatar sx={{ width: 42, height: 42, bgcolor: color }}>
      {STEP_ICON_MAP[String(icon)]}
    </Avatar>
  );
};

const DeliveredBanner = () => (
  <Fade in timeout={600}>
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: "20px",
        bgcolor: "#ccf8e3",
        border: "1px solid #5ce0ac",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Avatar sx={{ bgcolor: "#10b981" }}>
        <CheckCircleRoundedIcon />
      </Avatar>
      <Box>
        <Typography fontWeight="bold" sx={{ color: "#065f46" }}>
          Order Delivered Successfully
        </Typography>
        <Typography sx={{ color: "#047857", fontSize: "14px" }}>
          Thank you for shopping with us
        </Typography>
      </Box>
    </Box>
  </Fade>
);

const CancelledBanner = () => (
  <Fade in timeout={600}>
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: "20px",
        bgcolor: "#fef2f2",
        border: "1px solid #fecaca",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Avatar sx={{ bgcolor: "#ef4444" }}>
        <CancelOutlinedIcon />
      </Avatar>
      <Box>
        <Typography fontWeight="bold" sx={{ color: "#7f1d1d" }}>
          Order Cancelled
        </Typography>
        <Typography sx={{ color: "#b91c1c", fontSize: "14px" }}>
          This order has been cancelled
        </Typography>
      </Box>
    </Box>
  </Fade>
);

const ReturnedBanner = () => (
  <Fade in timeout={600}>
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: "20px",
        bgcolor: "#f5f3ff",
        border: "1px solid #ddd6fe",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Avatar sx={{ bgcolor: "#8b5cf6" }}>
        <AssignmentReturnOutlinedIcon />
      </Avatar>
      <Box>
        <Typography fontWeight="bold" sx={{ color: "#4c1d95" }}>
          Return Request Submitted
        </Typography>
        <Typography sx={{ color: "#6d28d9", fontSize: "14px" }}>
          We will process your return shortly
        </Typography>
      </Box>
    </Box>
  </Fade>
);

// ── ONE CARD PER ORDER (shows all products as a list inside) ──────────────────
const OrderCard = ({ order, onRefresh }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const orderStatus = order.orderStatus || "Placed";
  const activeStep = STEPS.indexOf(orderStatus);
  const theme = STEP_THEMES[orderStatus] || STEP_THEMES["Placed"];

  const isDelivered = orderStatus === "Delivered";
  const isCancelled = orderStatus === "Cancelled";
  const isReturned = orderStatus === "Returned";

  const showCancelBtn = !isDelivered && !isCancelled && !isReturned;
  const showReturnBtn = isDelivered && !isReturned;

  const handleConfirm = (type) => {
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        confirmType === "cancel"
          ? `${import.meta.env.VITE_API_URL}/order/cancel-order/${order._id}`
          : `${import.meta.env.VITE_API_URL}/order/return-order/${order._id}`;

      await axios.put(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setConfirmOpen(false);
      onRefresh();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle fontWeight="bold">
          {confirmType === "cancel" ? "Cancel Order?" : "Return Order?"}
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {confirmType === "cancel"
              ? "Are you sure you want to cancel this order? This action cannot be undone."
              : "Are you sure you want to return this order? A return request will be submitted."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "12px", textTransform: "none" }}
          >
            Go Back
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            disabled={actionLoading}
            color={confirmType === "cancel" ? "error" : "secondary"}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {actionLoading
              ? "Processing..."
              : confirmType === "cancel"
                ? "Yes, Cancel"
                : "Yes, Return"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Card */}
      <Card
        sx={{
          width: "100%",
          maxWidth: "900px",
          mx: "auto",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(64, 25, 78, 0.23)",
          backgroundColor: "#000",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* ── ORDER HEADER ── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "#8a94a8" }}>
                Order ID
              </Typography>
              <Typography
                fontWeight="bold"
                sx={{ color: "#ccc", fontSize: "13px" }}
              >
                #{order._id}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label={order.paymentStatus}
                color={order.paymentStatus === "Paid" ? "success" : "warning"}
                size="small"
              />
              <Chip
                label={orderStatus}
                sx={{
                  bgcolor: `${STATUS_COLORS[orderStatus] || "#6b7280"}20`,
                  color: STATUS_COLORS[orderStatus] || "#6b7280",
                  fontWeight: "bold",
                  border: `1px solid ${STATUS_COLORS[orderStatus] || "#6b7280"}40`,
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: "#1e293b", mb: 2 }} />

          {/* ── PRODUCT LIST TABLE ── */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ bgcolor: "#0f172a", borderRadius: "16px", mb: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: "#64748b",
                      fontWeight: "bold",
                      borderBottom: "1px solid #1e293b",
                    }}
                  >
                    Product
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#64748b",
                      fontWeight: "bold",
                      borderBottom: "1px solid #1e293b",
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: "#64748b",
                      fontWeight: "bold",
                      borderBottom: "1px solid #1e293b",
                    }}
                  >
                    Price
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: "#64748b",
                      fontWeight: "bold",
                      borderBottom: "1px solid #1e293b",
                    }}
                  >
                    Qty
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "#64748b",
                      fontWeight: "bold",
                      borderBottom: "1px solid #1e293b",
                    }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.products.map((item, index) => {
                  const product = item.productId;
                  const price = product?.price || 0;
                  const lineTotal = price * item.quantity;

                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td": { borderBottom: 0 },
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#1e293b" },
                        transition: "background 0.15s",
                      }}
                      onClick={() => navigate(`/product/${product?._id}`)}
                    >
                      {/* Image */}
                      <TableCell
                        sx={{ borderBottom: "1px solid #1e293b", py: 1.5 }}
                      >
                        <Box
                          component="img"
                          src={
                            product?.image
                              ? `${import.meta.env.VITE_API_URL}/uploads/${product.image}`
                              : "/placeholder.png"
                          }
                          alt={product?.name}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "10px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </TableCell>

                      {/* Name */}
                      <TableCell sx={{ borderBottom: "1px solid #1e293b" }}>
                        <Typography
                          fontWeight="bold"
                          sx={{ color: "#ccc", fontSize: "14px" }}
                        >
                          {product?.name || "—"}
                        </Typography>
                      </TableCell>

                      {/* Unit price */}
                      <TableCell
                        align="center"
                        sx={{ borderBottom: "1px solid #1e293b" }}
                      >
                        <Typography
                          sx={{
                            color: "#94a3b8",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.2,
                          }}
                        >
                          <CurrencyRupeeRoundedIcon sx={{ fontSize: 14 }} />
                          {price}
                        </Typography>
                      </TableCell>

                      {/* Quantity */}
                      <TableCell
                        align="center"
                        sx={{ borderBottom: "1px solid #1e293b" }}
                      >
                        <Chip
                          label={`× ${item.quantity}`}
                          size="small"
                          sx={{
                            bgcolor: "#1e293b",
                            color: "#94a3b8",
                            fontWeight: "bold",
                          }}
                        />
                      </TableCell>

                      {/* Line total */}
                      <TableCell
                        align="right"
                        sx={{ borderBottom: "1px solid #1e293b" }}
                      >
                        <Typography
                          fontWeight="bold"
                          sx={{
                            color: "#2563eb",
                            fontSize: "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 0.2,
                          }}
                        >
                          <CurrencyRupeeRoundedIcon sx={{ fontSize: 15 }} />
                          {lineTotal}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── ORDER TOTAL ── */}

          <Divider sx={{ borderColor: "#1e293b", mb: 2 }} />

          {/* ── ACTION BUTTONS ── */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: "14px",
                  bgcolor: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography sx={{ color: "#8a94a8", fontSize: "14px" }}>
                  Order Total:
                </Typography>
                <Typography
                  fontWeight="bold"
                  sx={{
                    color: "#2563eb",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CurrencyRupeeRoundedIcon />
                  {order.totalAmount}
                </Typography>
              </Paper>
            </Box>
            {showCancelBtn && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                sx={{
                  borderRadius: "14px",
                  textTransform: "none",
                  px: 3,
                  py: 1.2,
                  fontWeight: "bold",
                }}
                onClick={() => handleConfirm("cancel")}
              >
                Cancel Order
              </Button>
            )}
            {showReturnBtn && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AssignmentReturnOutlinedIcon />}
                sx={{
                  borderRadius: "14px",
                  textTransform: "none",
                  px: 3,
                  py: 1.2,
                  fontWeight: "bold",
                }}
                onClick={() => handleConfirm("return")}
              >
                Return Order
              </Button>
            )}
          </Stack>

          {/* ── TRACKING STEPPER ── */}
          {!isDelivered && !isCancelled && !isReturned && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "22px",
                bgcolor: theme.bg,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Typography
                fontWeight="bold"
                sx={{ mb: 1, color: theme.titleColor }}
              >
                Order Tracking
              </Typography>
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                connector={
                  <ColorConnector
                    activecolor={theme.connectorActive}
                    completedcolor={theme.completedColor}
                    inactivecolor={theme.connectorInactive}
                  />
                }
              >
                {STEPS.map((label, i) => (
                  <Step key={label} completed={i < activeStep}>
                    <StepLabel
                      StepIconComponent={(props) => (
                        <CustomStepIcon {...props} theme={theme} />
                      )}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {isDelivered && !isReturned && <DeliveredBanner />}
          {isCancelled && <CancelledBanner />}
          {isReturned && <ReturnedBanner />}
        </CardContent>
      </Card>
    </>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const OrderDetails = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/order/my-orders`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
    const interval = setInterval(getOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={45} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        p: { xs: 2, md: 5 },
        borderRadius: 8,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#ccc" }}>
          My Orders
        </Typography>
        <Typography sx={{ mt: 1, color: "#8a94a8" }}>
          Track your orders easily
        </Typography>
      </Box>

      {/* Empty state */}
      {orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: "24px", textAlign: "center" }}
        >
          <Inventory2RoundedIcon
            sx={{ fontSize: 60, color: "#cbd5e1", mb: 2 }}
          />
          <Typography variant="h5" fontWeight="bold">
            No Orders Found
          </Typography>
          <Button
            onClick={() => navigate("/menu")}
            sx={{ backgroundColor: "#000", color: "#fff", mt: 3, px: 4 }}
          >
            Go To Shop
          </Button>
        </Paper>
      ) : (
        // ── ONE CARD PER ORDER (not per product) ──
        <Stack spacing={4}>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onRefresh={getOrders} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default OrderDetails;
