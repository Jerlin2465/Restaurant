import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { GrFormView, GrFormViewHide } from "react-icons/gr";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirmPassword, setShowconfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    confirmpassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/register`,
        formData,
      );

      console.log(res.data);

      alert("Register Successfully");
      setFormData({
        name: "",
        email: "",
        number: "",
        password: "",
        confirmpassword: "",
      });
    } catch (error) {
      console.log(error.message);
      console.log("Server Error:", error.response.data);
      console.log("Status:", error.response.status);
    }
  };
  const handleTogglePassword = () => setShowPassword((p) => !p);
  const handleTogglePass = () => setShowconfirmPassword((p) => !p);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#141f38",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: 400,
          p: 4,
          borderRadius: 3,
          bgcolor: "#ddd",
        }}
      >
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Register
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Name"
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              label="Phone Number"
              type="    number,
"
              fullWidth
              name="number"
              value={formData.number}
              onChange={handleChange}
            />

            <TextField
              label="Password"
              name="password"
              fullWidth
              required
              value={formData.password}
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
            <TextField
              label="confirmpassword"
              type="confirmpassword"
              fullWidth
              name="confirmpassword"
              value={formData.confirmpassword}
              onChange={handleChange}
              type={showconfirmPassword ? "text" : "password"}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePass}
                        edge="end"
                        aria-label={
                          showconfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showconfirmPassword ? (
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
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                py: 1.2,
              }}
            >
              Register
            </Button>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mt: 1,
              }}
            >
              <Typography variant="body2">Already have an account </Typography>

              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color: "blue",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => navigate("/login")}
              >
                Login
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
