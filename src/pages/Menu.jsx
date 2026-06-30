import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const getProducts = async () => {
    try {
  
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/product/get-product-all`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const available = (res.data.data || []).filter(
        (p) => p.stock === "available",
      );
      setProducts(available);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };
  useEffect(() => {
    getProducts();
  }, []);

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/add`,
        {
          productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        navigate("/cart");
      }
    } catch (error) {
      console.log(error.response?.data);
    }
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#070a11", p: 3, mt: 8 }}>
      {/* HEADER */}
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: "#ccc" }}>
        🍽 Explore Food
      </Typography>

      {/* GRID */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={product._id}
            onClick={() => addToCart(product._id)}
          >
            {/* CARD */}
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                width: "250px",
                bgcolor: "#fff",
                boxShadow: "0px 4px 15px rgba(0,0,0,0.08)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0px 10px 25px rgba(0,0,0,0.15)",
                },
              }}
            >
              {/* IMAGE */}
              <Box sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src={`${import.meta.env.VITE_API_URL}/uploads/${product.image}`}
                  alt={product.name}
                  sx={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    background: "linear-gradient(90deg,#f59e0b,#ef4444)",
                    color: "#fff",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "20px",
                    fontSize: 13,
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  ₹{product.price}
                </Box>
              </Box>

              {/* CONTENT */}
              <Box
                sx={{
                  p: 2,
                  background: "linear-gradient(135deg, #111721, #0f172a)",
                }}
              >
                {/* NAME */}
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#facc15",
                    mb: 1,
                  }}
                >
                  {product.name}
                </Typography>

                {/* DESCRIPTION */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "#cbd5e1",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    mb: 1.5,
                  }}
                >
                  {product.description}
                </Typography>

                {/* CATEGORY */}
                <Box
                  sx={{
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {product.category}
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Menu;
