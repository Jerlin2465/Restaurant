// src/pages/ChefDashboard.jsx

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
  Badge,
  Tab,
  Tabs,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import PersonIcon from "@mui/icons-material/Person";

import Chefdeliveryorder from "./Workers/Chefdeliveryorder";

const API = import.meta.env.VITE_API_URL;

// Status config for chef orders (server orders from Foodrder)
const statusConfig = {
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
    label: "Ready",
    icon: <CheckCircleIcon fontSize="small" />,
  },
  Served: {
    color: "#94a3b8",
    bg: "#1e293b",
    label: "Served",
    icon: <LocalDiningIcon fontSize="small" />,
  },
  Completed: {
    color: "#34d399",
    bg: "#064e3b",
    label: "Completed",
    icon: <CheckCircleIcon fontSize="small" />,
  },
};

// ── Single Order Card for Chef (Server Orders) ──
const ChefOrderCard = ({ order, onUpdate }) => {
  const [busy, setBusy] = useState(false);
  const status = order.status || "Pending";
  const cfg = statusConfig[status] || statusConfig.Pending;

  const update = async (newStatus) => {
    setBusy(true);
    await onUpdate(order._id, newStatus);
    setBusy(false);
  };

  const serverName = order.serverName || order.serverId?.name || "";

  return (
    <Paper
      sx={{
        bgcolor: "#111827",
        borderRadius: 3,
        overflow: "hidden",
        border: `1.5px solid ${cfg.color}33`,
        transition: "box-shadow 0.2s",
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
            🪑 Table #{order.tableNumber || "N/A"}
          </Typography>
          {serverName && (
            <Typography sx={{ color: `${cfg.color}99`, fontSize: 12 }}>
              Server: {serverName}
            </Typography>
          )}
        </Box>
        <Chip
          icon={cfg.icon}
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: `${cfg.color}22`,
            color: cfg.color,
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      </Box>

      <Divider sx={{ borderColor: "#1f2937", my: 1 }} />

      {/* Items */}
      <Box sx={{ px: 2.5, pb: 1 }}>
        {order.items?.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              py: 0.5,
            }}
          >
            <Typography sx={{ color: "#e5e7eb", fontSize: 14 }}>
              {item.name || item.productId?.name || "Unknown"}
            </Typography>
            <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>
              ×{item.quantity}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ borderColor: "#1f2937", mt: 1, mb: 0.5 }} />

        {/* Total Amount */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography sx={{ color: "#6b7280", fontSize: 12 }}>Total</Typography>
          <Typography sx={{ color: "#facc15", fontWeight: 700, fontSize: 14 }}>
            ₹{order.totalAmount || 0}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        {status === "Pending" && (
          <Button
            fullWidth
            variant="contained"
            disabled={busy}
            startIcon={<WhatshotIcon />}
            sx={{
              bgcolor: "#f97316",
              color: "#fff",
              fontWeight: 700,
              mt: 1,
              "&:hover": { bgcolor: "#ea580c" },
            }}
            onClick={() => update("Cooking")}
          >
            {busy ? "Updating..." : "Start Cooking"}
          </Button>
        )}
        {status === "Cooking" && (
          <Button
            fullWidth
            variant="contained"
            disabled={busy}
            startIcon={<CheckCircleIcon />}
            sx={{
              bgcolor: "#4ade80",
              color: "#000",
              fontWeight: 700,
              mt: 1,
              "&:hover": { bgcolor: "#22c55e" },
            }}
            onClick={() => update("Ready")}
          >
            {busy ? "Updating..." : "Ready to Serve"}
          </Button>
        )}
        {status === "Ready" && (
          <Typography
            sx={{
              color: "#4ade80",
              textAlign: "center",
              fontSize: 13,
              mt: 1,
              fontWeight: 600,
            }}
          >
            ✅ Waiting for server to serve
          </Typography>
        )}
        {status === "Served" && (
          <Typography
            sx={{
              color: "#94a3b8",
              textAlign: "center",
              fontSize: 13,
              mt: 1,
              fontWeight: 600,
            }}
          >
            🍽️ Order Served
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

// ── Main Chef Dashboard ──
const Chefdashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState({ open: false, text: "", severity: "info" });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // ✅ FETCH FROM FOODORDER API (Server Orders)
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/food/chef-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const allOrders = res.data.orders || res.data.data || [];
      setOrders(allOrders);
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);

      if (error.response?.status === 404) {
        setOrders([]);
      } else {
        setMsg({
          open: true,
          text: "Failed to fetch server orders",
          severity: "error",
        });
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/product/get-product-all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  // ✅ Fetch delivery orders to get count for badge
  const fetchDeliveryOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API}/order/all-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allOrders = res.data.orders || res.data.data || [];

      // Filter only delivery orders
      const deliveryOrders = allOrders.filter(
        (order) =>
          order.orderType === "delivery" ||
          order.deliveryAddress ||
          order.address,
      );
      setDeliveryOrders(deliveryOrders);
    } catch (error) {
      console.error("Fetch delivery orders error:", error.message);
    }
  };

  // Toggle stock function
  const toggleStock = async (id, stock) => {
    const newStock = stock === "available" ? "unavailable" : "available";
    try {
      const res = await axios.put(
        `${API}/product/update-stock/${id}`,
        { stock: newStock },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success !== false) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, stock: newStock } : p)),
        );
        setMsg({
          open: true,
          text: `Product marked ${newStock}`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Toggle stock error:", error);
      setMsg({ open: true, text: "Failed to update stock", severity: "error" });
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchDeliveryOrders(),
      ]);
      setLoading(false);
    };
    init();
    const interval = setInterval(() => {
      fetchOrders();
      fetchDeliveryOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // ✅ UPDATE STATUS USING FOODORDER API
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API}/food/update-status/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setMsg({
        open: true,
        text: `Order marked as ${status}`,
        severity: "success",
      });
      fetchOrders();
    } catch (error) {
      console.error("Update error:", error);
      setMsg({ open: true, text: "Failed to update order", severity: "error" });
    }
  };

  // Count pending delivery orders (Placed + Processing)
  const pendingDeliveryCount = deliveryOrders.filter(
    (o) => o.orderStatus === "Placed" || o.orderStatus === "Processing",
  ).length;

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
        <Box textAlign="center">
          <CircularProgress sx={{ color: "#facc15" }} />
          <Typography sx={{ color: "#9ca3af", mt: 2 }}>
            Loading kitchen...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Filter orders
  const activeOrders = orders.filter((o) =>
    ["Pending", "Cooking", "Ready"].includes(o.status),
  );
  const completedOrders = orders.filter((o) =>
    ["Served", "Completed"].includes(o.status),
  );

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const cookingCount = orders.filter((o) => o.status === "Cooking").length;
  const readyCount = orders.filter((o) => o.status === "Ready").length;

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        bgcolor: "#0f172a",
        minHeight: "100vh",
        mt: { xs: 6, sm: 7, md: 8 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.125rem" },
            }}
          >
            👨‍🍳 Chef Dashboard
          </Typography>
          <Typography
            sx={{
              color: "#9ca3af",
              mt: 0.5,
              fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
            }}
          >
            Manage kitchen orders from servers
          </Typography>
        </Box>
      </Box>

      {/* Tabs with Badges - Scrollable on mobile */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
        sx={{
          mb: { xs: 2, sm: 3 },
          "& .MuiTabs-scrollButtons": {
            color: "#facc15",
            "&.Mui-disabled": {
              color: "#374151",
            },
          },
          "& .MuiTab-root": {
            color: "#818a9b",
            fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.875rem" },
            padding: { xs: "6px 12px", sm: "8px 16px", md: "12px 20px" },
            minWidth: { xs: "auto", sm: "auto", md: "auto" },
            textTransform: "none",
            fontWeight: 600,
          },
          "& .Mui-selected": { color: "#facc15" },
          "& .MuiTabs-indicator": { bgcolor: "#facc15" },
          "& .MuiTabScrollButton-root": {
            width: { xs: 30, sm: 40 },
          },
          borderBottom: "1px solid #1f2937",
        }}
      >
        <Tab
          label={
            <Badge
              badgeContent={activeOrders.length}
              color="warning"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                  width: { xs: 16, sm: 20 },
                  height: { xs: 16, sm: 20 },
                  right: { xs: -6, sm: -8 },
                  top: { xs: 2, sm: 4 },
                },
              }}
            >
              <Box
                sx={{ pr: activeOrders.length > 0 ? { xs: 1, sm: 1.5 } : 0 }}
              >
                Server Orders
              </Box>
            </Badge>
          }
        />
        <Tab
          label={
            <Badge
              badgeContent={pendingDeliveryCount}
              color="warning"
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#f97316",
                  color: "#fff",
                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                  width: { xs: 16, sm: 20 },
                  height: { xs: 16, sm: 20 },
                  right: { xs: -6, sm: -8 },
                  top: { xs: 2, sm: 4 },
                },
              }}
            >
              <Box
                sx={{ pr: pendingDeliveryCount > 0 ? { xs: 1, sm: 1.5 } : 0 }}
              >
                Delivery Orders
              </Box>
            </Badge>
          }
          iconPosition="start"
        />
        <Tab
          label={
            <Badge
              badgeContent={completedOrders.length}
              color="success"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                  width: { xs: 16, sm: 20 },
                  height: { xs: 16, sm: 20 },
                  right: { xs: -6, sm: -8 },
                  top: { xs: 2, sm: 4 },
                },
              }}
            >
              <Box
                sx={{ pr: completedOrders.length > 0 ? { xs: 1, sm: 1.5 } : 0 }}
              >
                Completed
              </Box>
            </Badge>
          }
        />
        <Tab
          label=" Menu Stock"
          icon={<RestaurantMenuIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
          iconPosition="start"
        />
      </Tabs>

      {/* Tab 0: Server Orders (Active) */}
      {tab === 0 && (
        <>
          {/* Summary Chips - Responsive */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              flexWrap: "wrap",
              marginBottom: { xs: 2, sm: 3, md: 4 },
              marginLeft: { xs: 0, sm: 2 },
            }}
          >
            {[
              { label: `${pendingCount} Pending`, color: "#f59e0b" },
              { label: `${cookingCount} Cooking`, color: "#f97316" },
              { label: `${readyCount} Ready`, color: "#4ade80" },
            ].map((s) => (
              <Chip
                key={s.label}
                label={s.label}
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: `${s.color}22`,
                  color: s.color,
                  fontWeight: 700,
                  border: `1px solid ${s.color}44`,
                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                  height: { xs: 24, sm: 32 },
                }}
              />
            ))}
          </Box>

          {activeOrders.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography
                sx={{ color: "#4b5563", fontSize: { xs: 16, sm: 18 } }}
              >
                No active orders from servers 🎉
              </Typography>
              <Typography
                sx={{ color: "#374151", fontSize: { xs: 12, sm: 14 }, mt: 1 }}
              >
                When a server places an order, it will appear here.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              {activeOrders.map((o) => (
                <Grid item xs={12} sm={6} md={4} key={o._id}>
                  <ChefOrderCard order={o} onUpdate={updateStatus} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Tab 1: Delivery Orders */}
      {tab === 1 && <Chefdeliveryorder />}

      {/* Tab 2: Completed Orders */}
      {tab === 2 && (
        <>
          {completedOrders.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography
                sx={{ color: "#4b5563", fontSize: { xs: 16, sm: 18 } }}
              >
                No completed orders yet
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              {completedOrders.map((o) => (
                <Grid item xs={12} sm={6} md={4} key={o._id}>
                  <Paper
                    sx={{
                      bgcolor: "#111827",
                      borderRadius: 3,
                      p: { xs: 2, sm: 2.5 },
                      border: "1px solid #4ade8044",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#4ade80",
                        fontWeight: "bold",
                        mb: 0.5,
                        fontSize: { xs: 13, sm: 15 },
                      }}
                    >
                      🪑 Table #{o.tableNumber || "N/A"}
                    </Typography>
                    {o.serverName && (
                      <Typography
                        sx={{
                          color: "#6b7280",
                          fontSize: { xs: 11, sm: 12 },
                          mb: 1,
                        }}
                      >
                        Server: {o.serverName}
                      </Typography>
                    )}
                    {o.items?.slice(0, 3).map((item, index) => (
                      <Typography
                        key={index}
                        sx={{ color: "#d1d5db", fontSize: { xs: 12, sm: 14 } }}
                      >
                        {item.name} × {item.quantity}
                      </Typography>
                    ))}
                    {o.items?.length > 3 && (
                      <Typography sx={{ color: "#6b7280", fontSize: 12 }}>
                        +{o.items.length - 3} more items
                      </Typography>
                    )}
                    <Chip
                      label={o.status}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Tab 3: Menu Stock - Responsive Grid */}
      {tab === 3 && (
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Paper
                sx={{
                  bgcolor: "#111827",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid #1f2937",
                }}
              >
                <Box
                  component="img"
                  src={`${API}/uploads/${product.image}`}
                  alt={product.productName}
                  sx={{
                    width: "100%",
                    height: { xs: 150, sm: 180 },
                    objectFit: "cover",
                  }}
                />
                <Box p={{ xs: 1.5, sm: 2 }}>
                  <Typography
                    sx={{
                      color: "#facc15",
                      fontWeight: "bold",
                      fontSize: { xs: 14, sm: 16 },
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#facc15",
                      fontWeight: "bold",
                      fontSize: { xs: 12, sm: 14 },
                      mt: 0.5,
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#9ca3af",
                      fontSize: { xs: 11, sm: 12 },
                      mb: 1,
                    }}
                  >
                    ₹{product.price}
                  </Typography>
                  <Chip
                    label={
                      product.stock === "available"
                        ? " In Stock"
                        : " Out of Stock"
                    }
                    size="small"
                    sx={{
                      bgcolor:
                        product.stock === "available"
                          ? "#052e1644"
                          : "#450a0a44",
                      color:
                        product.stock === "available" ? "#4ade80" : "#f87171",
                      border: `1px solid ${product.stock === "available" ? "#4ade80" : "#f87171"}44`,
                      fontSize: { xs: "0.6rem", sm: "0.75rem" },
                    }}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      mt: 1,
                      fontSize: { xs: "0.65rem", sm: "0.875rem" },
                      padding: { xs: "4px 8px", sm: "6px 16px" },
                    }}
                    color={product.stock === "available" ? "error" : "success"}
                    onClick={() => toggleStock(product._id, product.stock)}
                  >
                    {product.stock === "available"
                      ? "Mark Unavailable"
                      : "Mark Available"}
                  </Button>
                </Box>
              </Paper>
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

export default Chefdashboard;
