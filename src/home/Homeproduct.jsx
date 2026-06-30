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

const Homeproduct = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [hovered, setHovered] = useState(false);

  const getProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/product/get-product`,
      );

      setProducts(res.data.data || res.data);
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

  const filteredProducts =
    filter === "All"
      ? products
      : products.filter(
          (item) => item.category?.toLowerCase() === filter.toLowerCase(),
        );
  return (
    <Box sx={{ bgcolor: "#000", p: 3, mt: 1 }}>
      {/* GRID */}
      {/*  */}
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
      {/*  */}
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
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
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                width: "250px",
                bgcolor: "#000",
                boxShadow: "0px 4px 15px rgba(0,0,0,0.08)",
                transition: "0.3s",
                border: `1px solid ${hovered ? "#0f172a" : "#1b2846"}`,

                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "10px 20px 20px rgba(120,70,200,0.18)",
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
                    top: 10,
                    left: 10,
                    backgroundColor: " hsla(255, 92%, 76%, 0.23)",
                    color: "#c4b5fd",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "20px",
                    fontSize: 13,
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  ₹{product.category}
                </Box>
              </Box>

              {/* CONTENT */}
              <Box
                sx={{
                  p: 2,
                  background: "rgba(0, 0, 0, 0.87)",
                }}
              >
                {/* NAME */}
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#fff",
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
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {product.price}
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Homeproduct;
