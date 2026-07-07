import React, { useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const totalAmount = Number(location.state?.totalAmount || 0);
  const cartItem = location.state?.cartItem || [];
  const deliveryAddress = location.state?.address || "";

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const [loading, setLoading] = useState(false);

  const showSnackbar = (msg, severity = "success") => {
    setMessage(msg);
    setType(severity);
    setOpen(true);
  };

  // Check if payment data is valid
  if (!location.state || totalAmount <= 0 || cartItem.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#ddd",
        }}
      >
        <Paper
          elevation={5}
          sx={{
            width: "350px",
            padding: "30px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ color: "#ff0000", mb: 2 }}>
            ⚠️ Invalid Order
          </Typography>
          <Typography sx={{ color: "#666", mb: 2 }}>
            No items in your cart or invalid amount.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              backgroundColor: "#0000ff",
              "&:hover": { backgroundColor: "#000" },
            }}
          >
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  const handlePayment = async () => {
    setLoading(true);

    try {
      if (!window.Razorpay) {
        setLoading(false);
        showSnackbar("Razorpay SDK not loaded", "error");
        return;
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payment/order`,
        {
          amount: totalAmount,
        },
      );

      const options = {
        key: import.meta.env.VITE_RAZOR_PAYMENT_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Shop",
        description: "Order Payment",
        order_id: data.id,
        handler: async function (response) {
          // Don't set loading false here, let the outer try-catch handle it
          try {
            // 1. Verify payment
            const verify = await axios.post(
              `${import.meta.env.VITE_API_URL}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                totalAmount,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (!verify.data.success) {
              showSnackbar("Payment verification failed", "error");
              setLoading(false);
              return;
            }

            // 2. Prepare order data
            const orderData = {
              userId: user?._id || user?.id || user?.userId,
              email: user?.email || "",
              name: user?.fullname || user?.name || "",
              products: cartItem.map((item) => ({
                productId: item.productId?._id || item.productId,
                size: item.size || "Regular",
                quantity: item.quantity,
              })),
              totalAmount,
              paymentStatus: "Paid",
              deliveryAddress: deliveryAddress || "Dine-in",
            };

            // 3. Place order
            const orderRes = await axios.post(
              `${import.meta.env.VITE_API_URL}/order/place-order`,
              orderData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            console.log("ORDER RESPONSE:", orderRes.data);

            if (orderRes.data.success) {
              // 4. Clear cart
              try {
                const clearRes = await axios.delete(
                  `${import.meta.env.VITE_API_URL}/cart/clear`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );
                console.log("Cart cleared successfully:", clearRes.data);
              } catch (err) {
                console.log("Cart clear error:", err.response?.data || err.message);
                // Continue even if cart clear fails
              }

              // 5. Show success message
              showSnackbar("✅ Order placed successfully! 🎉", "success");

              // 6. Navigate to home after 2 seconds
              setTimeout(() => {
                setLoading(false);
                navigate("/", { 
                  state: { 
                    paymentSuccess: true, 
                    orderId: orderRes.data.order?._id || orderRes.data._id 
                  } 
                });
              }, 2000);
            } else {
              showSnackbar(orderRes.data.message || "Order failed", "warning");
              setLoading(false);
            }
          } catch (err) {
            console.log("PAYMENT HANDLER ERROR:", err.response?.data || err.message);
            showSnackbar("Something went wrong", "error");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            showSnackbar("Payment cancelled", "warning");
            setLoading(false);
          },
        },
        theme: {
          color: "#0000ff",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();

      razor.on("payment.failed", function (response) {
        console.log(response.error);
        showSnackbar("Payment failed", "error");
        setLoading(false);
      });
    } catch (err) {
      console.log("PAYMENT ERROR:", err.response?.data || err.message);
      showSnackbar("Payment failed", "error");
      setLoading(false);
    }
    // Don't set loading false here - it will be set in the handlers
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#ddd",
        }}
      >
        <Paper
          elevation={5}
          sx={{
            width: "350px",
            padding: "30px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: "bold",
            }}
          >
            💳 Payment
          </Typography>

          <Typography
            sx={{
              fontSize: "20px",
              mb: 2,
              color: "#666",
            }}
          >
            Total Amount
          </Typography>

          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#0000ff",
            }}
          >
            ₹ {totalAmount.toLocaleString("en-IN")}
          </Typography>

          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              {cartItem.length} item{cartItem.length > 1 ? "s" : ""} in your order
            </Typography>
            {deliveryAddress && deliveryAddress !== "Dine-in" && (
              <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.5 }}>
                📦 Delivery to: {deliveryAddress}
              </Typography>
            )}
          </Box>

          <Button
            onClick={handlePayment}
            disabled={loading}
            sx={{
              mt: 2,
              width: "100%",
              padding: "12px",
              backgroundColor: "#0000ff",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "#000",
              },
            }}
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>

          <Button
            onClick={() => navigate("/")}
            sx={{
              mt: 1,
              width: "100%",
              padding: "10px",
              color: "#666",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            Cancel
          </Button>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          severity={type}
          variant="filled"
          onClose={() => setOpen(false)}
          sx={{
            width: "100%",
            fontSize: "15px",
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Payment;