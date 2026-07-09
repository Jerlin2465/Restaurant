// frontend/src/pages/Workers/Serverfoodmenu.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import SendIcon from "@mui/icons-material/Send";
import { jwtDecode } from "jwt-decode";

const API = import.meta.env.VITE_API_URL;

// ─── Helper: get current logged-in server ID from JWT ────────────────────────
const getCurrentServerId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded?._id || decoded?.id || null;
  } catch {
    return null;
  }
};

const Serverfoodmenu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingOrder, setSendingOrder] = useState(false);
  const [filter, setFilter] = useState("All");
  const [currentTable, setCurrentTable] = useState(null);
  const [tableLoading, setTableLoading] = useState(true);

  const [cart, setCart] = useState({});

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // ─── Fetch current server's active table ────────────────────────────────────
  const fetchCurrentTable = async () => {
    try {
      const token = localStorage.getItem("token");
      const serverId = getCurrentServerId();

      if (!serverId) {
        setTableLoading(false);
        return;
      }

      const res = await axios.get(`${API}/table`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        // Find the active table assigned to this server
        const activeTable = res.data.bookings.find(
          (b) =>
            b.assignedServer &&
            String(b.assignedServer._id || b.assignedServer) ===
              String(serverId) &&
            b.status !== "Completed" &&
            b.status !== "Cancelled",
        );

        if (activeTable) {
          setCurrentTable(activeTable);
          // Store table number in localStorage for other components
          localStorage.setItem("tableNumber", activeTable.tableNumber);
        } else {
          setCurrentTable(null);
          localStorage.removeItem("tableNumber");
        }
      }
    } catch (error) {
      console.error("Error fetching table:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/product/get-product-all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const available = (res.data.data || []).filter(
        (p) => p.stock === "available",
      );
      setProducts(available);
    } catch {
      setSnack({
        open: true,
        message: "Failed to fetch menu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCurrentTable();
  }, []);

  // ─── Add to Cart ─────────────────────────────────────────────────────────────
  const addToCart = (product) => {
    if (!currentTable) {
      setSnack({
        open: true,
        message: "You don't have an active table. Please take a table first.",
        severity: "warning",
      });
      return;
    }

    setCart((prev) => {
      const existing = prev[product._id];
      return {
        ...prev,
        [product._id]: {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
    setSnack({
      open: true,
      message: `${product.name} added to order`,
      severity: "success",
    });
  };

  const changeCartQty = (productId, delta) => {
    setCart((prev) => {
      const item = prev[productId];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return {
        ...prev,
        [productId]: { ...item, quantity: newQty },
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ─── Send Order to Chef ─────────────────────────────────────────────────────
  const sendOrderToChef = async () => {
    if (cartItems.length === 0) {
      setSnack({
        open: true,
        message: "Your order is empty",
        severity: "warning",
      });
      return;
    }

    if (!currentTable) {
      setSnack({
        open: true,
        message: "You don't have an active table. Please take a table first.",
        severity: "warning",
      });
      return;
    }

    setSendingOrder(true);
    try {
      // Use the current table's table number
      const tableNumber = String(currentTable.tableNumber);

      // Get the booking ID to link the order
      const bookingId = currentTable._id;

      const orderPayload = {
        tableNumber,
        bookingId,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cartTotal,
      };

      const res = await axios.post(`${API}/food/create-order`, orderPayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        setSnack({
          open: true,
          message: `Order sent to chef! (${cartCount} item${cartCount > 1 ? "s" : ""}) for Table #${tableNumber}`,
          severity: "success",
        });
        setCart({});
        // Refresh table data to update order count
        fetchCurrentTable();
      }
    } catch (error) {
      setSnack({
        open: true,
        message: error?.response?.data?.message || "Order failed",
        severity: "error",
      });
    } finally {
      setSendingOrder(false);
    }
  };

  const filteredProducts =
    filter === "All"
      ? products
      : products.filter(
          (item) => item.category?.toLowerCase() === filter.toLowerCase(),
        );

  // ─── Loading States ──────────────────────────────────────────────────────────
  if (loading || tableLoading)
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress sx={{ color: "#facc15" }} />
        <Typography sx={{ color: "#9ca3af", mt: 2 }}>
          {loading ? "Loading menu..." : "Loading table info..."}
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        bgcolor: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* ---------- LEFT: MENU ---------- */}
      <Box sx={{ flex: 1, p: 3, minWidth: 0 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
            🍽️ Food Menu
          </Typography>

          {currentTable ? (
            <Chip
              icon={
                <TableRestaurantIcon
                  sx={{ color: "#4ade80 !important", fontSize: 16 }}
                />
              }
              label={`Table #${currentTable.tableNumber} - ${currentTable.fullName}`}
              sx={{
                bgcolor: "#14532d",
                color: "#4ade80",
                fontWeight: 700,
                border: "1px solid #4ade8044",
              }}
            />
          ) : (
            <Chip
              icon={
                <TableRestaurantIcon
                  sx={{ color: "#f87171 !important", fontSize: 16 }}
                />
              }
              label="No Active Table"
              sx={{
                bgcolor: "#451a1a",
                color: "#f87171",
                fontWeight: 700,
                border: "1px solid #f8717144",
              }}
            />
          )}
        </Box>

        {/* Show warning if no active table */}
        {!currentTable && (
          <Alert
            severity="warning"
            sx={{ mb: 3, bgcolor: "#451a1a", color: "#f87171" }}
          >
            You don't have an active table. Please go to "Table Reservations"
            and take a table first.
          </Alert>
        )}

        {/* ---------- FILTER BUTTONS ---------- */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 3,
            justifyContent: "center",
          }}
        >
          <Typography
            onClick={() => setFilter("All")}
            sx={{
              cursor: "pointer",
              color: filter === "All" ? "#facc15" : "#fff",
              fontWeight: "bold",
            }}
          >
            All
          </Typography>

          <Typography
            onClick={() => setFilter("Veg")}
            sx={{
              cursor: "pointer",
              color: filter === "Veg" ? "#22c55e" : "#fff",
              fontWeight: "bold",
            }}
          >
            Veg
          </Typography>

          <Typography
            onClick={() => setFilter("Non-veg")}
            sx={{
              cursor: "pointer",
              color: filter === "Non-veg" ? "#ef4444" : "#fff",
              fontWeight: "bold",
            }}
          >
            Non-veg
          </Typography>
        </Box>

        {filteredProducts.length === 0 ? (
          <Typography sx={{ color: "#9ca3af", mt: 2 }}>
            No dishes match this filter.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={product._id}>
                <Card
                  sx={{
                    bgcolor: "#111827",
                    color: "#fff",
                    borderRadius: 3,
                    border: "1px solid #1f2937",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "#facc15",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={`${API}/uploads/${product.image}`}
                    alt={product.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography
                      sx={{
                        color: "#facc15",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      sx={{ color: "#9ca3af", fontSize: 12, mt: 0.5, mb: 1 }}
                    >
                      {product.description}
                    </Typography>
                    <Typography
                      sx={{ color: "#4ade80", fontWeight: 700, fontSize: 15 }}
                    >
                      ₹{product.price}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {product.category}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      disabled={!currentTable}
                      sx={{
                        mt: 2,
                        bgcolor: currentTable ? "#facc15" : "#374151",
                        color: currentTable ? "#000" : "#6b7280",
                        fontWeight: 700,
                        "&:hover": {
                          bgcolor: currentTable ? "#fbbf24" : "#374151",
                        },
                      }}
                      onClick={() => addToCart(product)}
                    >
                      {currentTable ? "Add to Order" : "No Active Table"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ---------- RIGHT: YOUR ORDER (fixed sidebar) ---------- */}
      <Box
        sx={{
          width: { xs: "100%", md: 340 },
          flexShrink: 0,
          bgcolor: "#111827",
          borderLeft: { md: "1px solid #1f2937" },
          borderTop: { xs: "1px solid #1f2937", md: "none" },
          p: 3,
          position: { md: "sticky" },
          top: { md: 0 },
          height: { md: "100vh" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ShoppingCartIcon sx={{ color: "#facc15" }} />
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
            Your Order
          </Typography>
          {cartCount > 0 && (
            <Chip
              label={cartCount}
              size="small"
              sx={{
                bgcolor: "#facc15",
                color: "#000",
                fontWeight: 700,
                height: 22,
              }}
            />
          )}
        </Box>

        <Divider sx={{ borderColor: "#1f2937", mb: 2 }} />

        {/* Show table info in order sidebar */}
        {currentTable && (
          <Box sx={{ mb: 2, bgcolor: "#1f2937", p: 1.5, borderRadius: 2 }}>
            <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>
              Table #{currentTable.tableNumber}
            </Typography>
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
              {currentTable.fullName}
            </Typography>
          </Box>
        )}

        {/* Scrollable cart items list */}
        <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
          {cartItems.length === 0 ? (
            <Typography sx={{ color: "#6b7280", fontSize: 13, mt: 2 }}>
              No items added yet. Tap "Add to Order" on a dish to start.
            </Typography>
          ) : (
            cartItems.map((item) => (
              <Box
                key={item.productId}
                sx={{
                  bgcolor: "#1f2937",
                  borderRadius: 2,
                  p: 1.5,
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      pr: 1,
                    }}
                  >
                    {item.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item.productId)}
                    sx={{ color: "#f87171", p: 0.3 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "#0f172a",
                      borderRadius: 2,
                      px: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => changeCartQty(item.productId, -1)}
                      sx={{ color: "#f87171" }}
                    >
                      <RemoveIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        minWidth: 22,
                        textAlign: "center",
                        fontSize: 13,
                      }}
                    >
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => changeCartQty(item.productId, 1)}
                      sx={{ color: "#4ade80" }}
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>

                  <Typography
                    sx={{ color: "#4ade80", fontWeight: 700, fontSize: 13 }}
                  >
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Total + send button, pinned to bottom of sidebar */}
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ borderColor: "#1f2937", mb: 2 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography sx={{ color: "#9ca3af", fontWeight: 600 }}>
              Total
            </Typography>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
              ₹{cartTotal.toFixed(2)}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            disabled={cartItems.length === 0 || sendingOrder || !currentTable}
            startIcon={<SendIcon />}
            sx={{
              bgcolor: currentTable ? "#facc15" : "#374151",
              color: currentTable ? "#000" : "#6b7280",
              fontWeight: 700,
              py: 1.2,
              "&:hover": {
                bgcolor: currentTable ? "#fbbf24" : "#374151",
              },
              "&.Mui-disabled": {
                bgcolor: "#374151",
                color: "#6b7280",
              },
            }}
            onClick={sendOrderToChef}
          >
            {!currentTable
              ? "No Active Table"
              : sendingOrder
                ? "Sending..."
                : "Send Order to Chef"}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Serverfoodmenu;
