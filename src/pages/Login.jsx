import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Snackbar,
  Alert,
} from "@mui/material";

import { GrFormViewHide, GrFormView } from "react-icons/gr";

const getRedirectPath = (user) => {
  const role = user?.role?.toLowerCase() || "";
  const desig = user?.designation?.toLowerCase() || "";

  if (role === "admin" || role === "manager") return "/adminpannel";

  if (desig === "chef") return "/chefdashboard";
  if (desig === "server") return "/serverdashboard";
  if (desig === "delivery") return "/deliverydashboard";

  return "/menu";
};

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("success");
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleTogglePassword = () => setShowPassword((p) => !p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`,
        loginData,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setLoginData({ email: "", password: "" });
      setShowPassword(false);

      const path = getRedirectPath(res.data.user);
      navigate(path, { replace: true });

      setMessage("Login successfully");
      setType("success");
      setOpen(true);

      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setType("error");
      setOpen(true);
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
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              name="email"
              value={loginData.email}
              onChange={handleChange}
              required
            />

            <TextField
              label="Password"
              name="password"
              fullWidth
              required
              value={loginData.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                py: 1.2,
                "&:hover": { backgroundColor: "#222" },
              }}
            >
              Login
            </Button>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "blue",
                  cursor: "pointer",
                  fontWeight: "bold",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => navigate("/resetpassword")}
              >
                Forgot password?
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">Don't have an account?</Typography>
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color: "blue",
                  cursor: "pointer",
                  fontWeight: "bold",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => navigate("/register")}
              >
                Register
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={type} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
