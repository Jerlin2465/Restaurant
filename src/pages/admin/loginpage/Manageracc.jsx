import React, { useState } from "react";
import axios from "axios";
import { GrFormViewHide, GrFormView } from "react-icons/gr";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

const Manageracc = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    designation: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.number ||
      !formData.password
    ) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { name, email, number, password } = formData;

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/create-manager`,
        { name, email, number, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(res.data);
      alert(" Account Created Successfully");

      setFormData({
        name: "",
        email: "",
        number: "",
        password: "",
        designation: "",
      });
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || "Error creating manager account");
    } finally {
      setLoading(false);
    }
  };
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#0f172a",
        p: 2,
        ml: 28,
      }}
    >
      <Paper
        elevation={5}
        sx={{
          width: 400,
          p: 4,
          borderRadius: 3,
          backgroundColor: "#ddd",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: "center" }}
        >
          Create Manager Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Name */}
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Email */}
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Phone */}
          <TextField
            label="Phone Number"
            name="number"
            type="tel"
            fullWidth
            margin="normal"
            value={formData.number}
            onChange={handleChange}
          />

          {/* Password */}
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

          {/* <TextField
            label="confirmpassword "
            name="confirmpassword"
            fullWidth
            required
            value={formData.confirmpassword}
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
            sx={{ mt: 1 }}
          /> */}

          {/* Designation */}
          <TextField
            select
            label="Designation"
            name="designation"
            fullWidth
            margin="normal"
            value={formData.designation}
            onChange={handleChange}
          >
            <MenuItem value="manager">manager</MenuItem>
            <MenuItem value="Chef">Chef</MenuItem>
            <MenuItem value="server">server</MenuItem>
            <MenuItem value="Delivery">Delivery </MenuItem>
          </TextField>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              backgroundColor: "#000",
              color: "#fff",
              py: 1.2,
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Manageracc;
