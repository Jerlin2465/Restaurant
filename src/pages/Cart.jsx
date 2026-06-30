import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Divider,
  Grid,
  Paper,
  TextField,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const getCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/cart/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(res.data.items || []);
      setTotalPrice(res.data.total || 0);
    } catch (error) {
      console.log("Cart Fetch Error:", error);
    }
  };

  const getUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/register/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAddress(res.data.user.address || "");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCart();
    getUserDetails();
  }, []);

  const increaseQty = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/increase`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      getCart();
    } catch (error) {
      console.log(error);
    }
  };

  const decreaseQty = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/decrease`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      getCart();
    } catch (error) {
      console.log(error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/remove`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          productId,
        },
      });

      getCart();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/clear`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Payment Successful");
      getCart();
    } catch (error) {
      console.log(error);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const updateAddress = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/register/update-address`,
        {
          address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        mt: 8,
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        sx={{ mb: 4, color: "#bbb" }}
      >
        🛒 My Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Box sx={{ textAlign: "center" }}>
          <Typography textAlign="center" variant="h6" sx={{ color: "#fff" }}>
            Cart is Empty
          </Typography>
          <Button
            sx={{ backgroundColor: "#fff", color: "#000", px: 2, py: 1, mt: 2 }}
            onClick={() => navigate("/menu")}
          >
            Go To Shop 🛒
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Cart Items */}
          <Box
            sx={{
              width: "100%",
              maxWidth: "700px",
            }}
          >
            {cartItems.map((item) => (
              <Card
                key={item.productId}
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              >
                <CardMedia
                  component="img"
                  image={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                  alt={item.name}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: 150,
                    },
                    height: {
                      xs: 220,
                      sm: 150,
                    },
                  }}
                />

                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: {
                      xs: "column",
                      md: "row",
                      backgroundColor: "#ccc",
                    },
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {item.name}
                  </Typography>

                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ₹{item.price}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      color="error"
                      onClick={() => decreaseQty(item.productId)}
                    >
                      <RemoveIcon />
                    </IconButton>

                    <Typography fontWeight="bold">{item.quantity}</Typography>

                    <IconButton
                      color="success"
                      onClick={() => increaseQty(item.productId)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </CardContent>

                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: {
                      xs: "row",
                      sm: "column",
                    },
                    justifyContent: "space-between",
                    alignItems: "center",
                    minWidth: {
                      xs: "100%",
                      sm: 120,
                    },
                    backgroundColor: "#ccc",
                  }}
                >
                  <Typography variant="h6" color="secondary" fontWeight="bold">
                    ₹{item.subtotal}
                  </Typography>

                  <IconButton
                    color="error"
                    onClick={() => removeItem(item.productId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>

          {/* Order Summary */}
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 3,
              width: {
                xs: "100%",
                sm: "400px",
              },
              backgroundColor: "#ccc",
              mt: 4,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              mb={2}
              textAlign="center"
            >
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography mb={1}>Items: {cartItems.length}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight="bold">
              Total: ₹{totalPrice + 50}
            </Typography>
            <Typography
              sx={{
                mt: 2,
                mb: 2,
              }}
            >
              <strong>Delivery Address:</strong>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {address.trim() !== "" ? (
              <Button
                onClick={async () => {
                  await updateAddress();

                  navigate("/payment", {
                    state: {
                      totalAmount: totalPrice + 50,
                      cartItem: cartItems,
                      address,
                    },
                  });
                }}
                sx={{
                  width: "250px",
                  marginTop: "20px",
                  padding: "10px",
                  backgroundColor: "#000",
                  color: "#fff",
                  borderRadius: "10px",

                  "&:hover": {
                    backgroundColor: "#000",
                  },
                }}
              >
                Proceed To Pay
              </Button>
            ) : (
              <Typography
                color="error"
                sx={{
                  mt: 2,
                  fontWeight: "bold",
                }}
              >
                Please enter your delivery address.
              </Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Cart;
