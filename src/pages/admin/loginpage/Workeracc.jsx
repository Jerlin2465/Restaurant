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

const Workeracc = () => {
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

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.number ||
      !formData.password ||
      !formData.designation
    ) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/create-worker`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(res.data);

      alert("Worker Account Created Successfully");

      setFormData({
        name: "",
        email: "",
        number: "",
        password: "",
        designation: "",
      });
    } catch (error) {
      console.log(error.response?.data || error.message);

      alert(error.response?.data?.message || "Error creating worker account");
    } finally {
      setLoading(false);
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
          Create Worker Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            label="Phone Number"
            name="number"
            type="tel"
            fullWidth
            margin="normal"
            value={formData.number}
            onChange={handleChange}
          />

          <TextField
            label="Password"
            name="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword}>
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
            select
            label="Designation"
            name="designation"
            fullWidth
            margin="normal"
            value={formData.designation}
            onChange={handleChange}
          >
            <MenuItem value="chef">Chef</MenuItem>
            <MenuItem value="server">Server</MenuItem>
            <MenuItem value="delivery">Delivery</MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              backgroundColor: "#000",
              color: "#fff",
            }}
          >
            {loading ? "Creating..." : "Create Worker"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Workeracc;
