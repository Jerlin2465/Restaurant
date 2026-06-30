import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { GrFormViewHide, GrFormView } from "react-icons/gr";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    success: false,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", success: false });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reset-password/${token}`,
        form,
      );
      setStatus({ loading: false, message: res.data.message, success: true });

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
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
          Reset Password
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="New Password"
              name="password"
              fullWidth
              required
              value={form.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                      >
                        {showPassword ? (
                          <GrFormView size={22} />
                        ) : (
                          <GrFormViewHide size={22} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              fullWidth
              required
              value={form.confirmPassword}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
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
              {status.loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
