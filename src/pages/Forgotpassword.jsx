import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    success: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", success: false });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/forgot-password`,
        { email },
      );
      console.log(res);
      setStatus({ loading: false, message: res.data.message, success: true });
    } catch (error) {
      console.log(error.response?.data?.message);
      setStatus({
        loading: false,
        message: error.response?.data?.message || "Something went wrong",
        success: false,
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#0f172a",
      }}
    >
      <Paper
        elevation={5}
        sx={{ width: 400, p: 4, borderRadius: 3, bgcolor: "#ddd" }}
      >
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Forgot Password
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 3, color: "#555" }}
        >
          Enter your account email and we'll send you a link to reset your
          password.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Email"
              type="email"
              name="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {status.message && (
              <Typography
                variant="body2"
                align="center"
                color={status.success ? "green" : "error"}
              >
                {status.message}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={status.loading}
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                py: 1.2,
                "&:hover": { backgroundColor: "#222" },
              }}
            >
              {status.loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Typography
              variant="body2"
              align="center"
              sx={{
                color: "blue",
                cursor: "pointer",
                fontWeight: "bold",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
