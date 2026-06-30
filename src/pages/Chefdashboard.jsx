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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState({ open: false, text: "", severity: "info" });

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
      await Promise.all([fetchOrders(), fetchProducts()]);
      setLoading(false);
    };
    init();
    const interval = setInterval(fetchOrders, 15000);
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
    <Box sx={{ p: 3, bgcolor: "#0f172a", minHeight: "100vh", mt: 8 }}>
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
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
            👨‍🍳 Chef Dashboard
          </Typography>
          <Typography sx={{ color: "#9ca3af", mt: 0.5 }}>
            Manage kitchen orders from servers
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          "& .MuiTab-root": { color: "#818a9b" },
          "& .Mui-selected": { color: "#facc15" },
          "& .MuiTabs-indicator": { bgcolor: "#facc15" },
        }}
      >
        <Tab
          label={
            <Badge badgeContent={activeOrders.length} color="warning">
              <Box sx={{ pr: activeOrders.length > 0 ? 1.5 : 0 }}>
                Server Orders
              </Box>
            </Badge>
          }
        />
        <Tab label=" Delivery Orders" iconPosition="start" />
        <Tab
          label={
            <Badge badgeContent={completedOrders.length} color="success">
              <Box sx={{ pr: completedOrders.length > 0 ? 1.5 : 0 }}>
                Completed
              </Box>
            </Badge>
          }
        />
        <Tab
          label=" Menu Stock"
          icon={<RestaurantMenuIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* Tab 0: Server Orders (Active) */}
      {tab === 0 && (
        <>
          {/* Summary Chips */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              marginBottom:4,
              marginLeft:2,
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
                sx={{
                  bgcolor: `${s.color}22`,
                  color: s.color,
                  fontWeight: 700,
                  border: `1px solid ${s.color}44`,
                }}
              />
            ))}
          </Box>
          {activeOrders.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography sx={{ color: "#4b5563", fontSize: 18 }}>
                No active orders from servers 🎉
              </Typography>
              <Typography sx={{ color: "#374151", fontSize: 14, mt: 1 }}>
                When a server places an order, it will appear here.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
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
              <Typography sx={{ color: "#4b5563", fontSize: 18 }}>
                No completed orders yet
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {completedOrders.map((o) => (
                <Grid item xs={12} sm={6} md={4} key={o._id}>
                  <Paper
                    sx={{
                      bgcolor: "#111827",
                      borderRadius: 3,
                      p: 2.5,
                      border: "1px solid #4ade8044",
                    }}
                  >
                    <Typography
                      sx={{ color: "#4ade80", fontWeight: "bold", mb: 0.5 }}
                    >
                      🪑 Table #{o.tableNumber || "N/A"}
                    </Typography>
                    {o.serverName && (
                      <Typography
                        sx={{ color: "#6b7280", fontSize: 12, mb: 1 }}
                      >
                        Server: {o.serverName}
                      </Typography>
                    )}
                    {o.items?.slice(0, 3).map((item, index) => (
                      <Typography
                        key={index}
                        sx={{ color: "#d1d5db", fontSize: 14 }}
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

      {/* Tab 3: Menu Stock */}
      {tab === 3 && (
        <Grid container spacing={3}>
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
                  sx={{ width: "100%", height: 180, objectFit: "cover" }}
                />
                <Box p={2}>
                  <Typography sx={{ color: "#facc15", fontWeight: "bold" }}>
                    {product.name}
                  </Typography>
                  <Typography sx={{ color: "#facc15", fontWeight: "bold" }}>
                    {product.description}
                  </Typography>
                  <Typography sx={{ color: "#9ca3af", fontSize: 12, mb: 1 }}>
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
                    }}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
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
