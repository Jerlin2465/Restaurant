import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Notfound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        background: "#fff8f0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "80px", md: "150px" },
          fontWeight: "bold",
          color: "#ff6b35",
        }}
      >
        404
      </Typography>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Oops! Food Not Found 🍔
      </Typography>

      <Typography
        variant="body1"
        sx={{ maxWidth: "500px", mb: 4, color: "gray" }}
      >
        The page you're looking for seems to have disappeared from our menu.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/")}
        sx={{
          bgcolor: "#ff6b35",
          "&:hover": { bgcolor: "#e85d2a" },
        }}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default Notfound;