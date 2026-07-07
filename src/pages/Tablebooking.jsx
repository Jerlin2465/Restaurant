import React, { useState } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

const Tablebooking = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    guests: "",
    date: "",
    time: "",
    tableNumber: "",
    message: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [alertData, setAlertData] = useState({
    message: "",
    severity: "success",
  });
  const [availableTables, setAvailableTables] = useState([]);

  const showSnackbar = (message, severity = "success") => {
    setAlertData({ message, severity });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   // Check if user is logged in first
    const token = localStorage.getItem("token");
    if (!token) {
        showSnackbar("Please login to book a table", "warning");
        navigate("/login");
        return;
    }
    
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.guests ||
      !formData.date ||
      !formData.time
    ) {
      showSnackbar("Please fill all required fields", "warning");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      showSnackbar("Enter a valid 10-digit phone number", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API}/table/book`,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          guests: Number(formData.guests),
          date: formData.date,
          time: formData.time,
          tableNumber: formData.tableNumber || undefined,
          message: formData.message,
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );

      if (res.data.success) {
        showSnackbar("Table Reserved! Booking success");
        navigate("/");
        setFormData({
          fullName: "",
          phone: "",
          guests: "",
          date: "",
          time: "",
          tableNumber: "",
          message: "",
        });
      }
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message || "Booking failed. Try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   fetchAvailableTables();
  // }, []);

  // const fetchAvailableTables = async () => {
  //   try {
  //     const res = await axios.get(`${API}/table/available-tables`);

  //     if (res.data.success) {
  //       setAvailableTables(res.data.available);
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //     console.log(error.message.data);
  //   }
  // };
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      backgroundColor: "#111827",
      color: "#ccc",
      "& input": { color: "#ccc" },
      "& textarea": { color: "#ccc" },
      "& fieldset": { borderColor: "#374151" },
      "&:hover fieldset": { borderColor: "#ffffff" },
      "&.Mui-focused fieldset": { borderColor: "#ffffff", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": { color: "#9ca3af" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#ffffff" },
    "& .MuiSvgIcon-root": { color: "#ffffff" },
    "& .MuiSelect-select": { color: "#fff" },
    "& input[type='date']::-webkit-calendar-picker-indicator": {
      filter: "invert(1)",
      cursor: "pointer",
    },
    "& input[type='time']::-webkit-calendar-picker-indicator": {
      filter: "invert(1)",
      cursor: "pointer",
    },
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          background: "#111222",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          mt: 3,
          mb: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              borderRadius: "28px",
              p: { xs: 3, sm: 4 },
              backgroundColor: "#111a2f",
              border: "1px solid #1f2937",
              boxShadow: "0px 20px 45px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Avatar
                sx={{
                  bgcolor: "#ffffff",
                  color: "#000",
                  width: 70,
                  height: 70,
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                <TableRestaurantIcon fontSize="large" />
              </Avatar>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "#ffffff" }}
              >
                Book Your Table
              </Typography>
              <Typography sx={{ color: "#9ca3af", mt: 1, fontSize: "14px" }}>
                Reserve your dining experience instantly.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: "#1f2937" }} />

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                fullWidth
                required
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                sx={inputStyle}
              />

              <TextField
                fullWidth
                required
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                inputProps={{ maxLength: 10 }}
                sx={inputStyle}
              />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  select
                  required
                  label="Guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  sx={{ ...inputStyle, width: "200px" }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                    <MenuItem key={g} value={g}>
                      {g} {g === 1 ? "Person" : "Persons"}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                  sx={{ ...inputStyle, flex: 1, minWidth: "220px" }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  required
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ ...inputStyle }}
                  // sx={{ ...inputStyle, width: "200px" }}
                />
                {/* <TextField
                  select
                  label="Select Table"
                  name="tableNumber"
                  value={formData.tableNumber}
                  onChange={handleChange}
                >
                  {availableTables.map((table) => (
                    <MenuItem key={table} value={table}>
                      Table {table}
                    </MenuItem>
                  ))}
                </TextField> */}
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Special Request"
                name="message"
                value={formData.message}
                onChange={handleChange}
                sx={inputStyle}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={<EventSeatRoundedIcon />}
                sx={{
                  py: 1.8,
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #d1d5db 100%)",
                  color: "#000",
                  fontSize: "15px",
                  fontWeight: "bold",
                  textTransform: "none",
                  boxShadow: "none",
                  mt: 1,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": { opacity: 0.6 },
                }}
              >
                {loading ? "Reserving..." : "Confirm Reservation"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alertData.severity}
          variant="filled"
          onClose={() => setOpen(false)}
        >
          {alertData.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Tablebooking;
