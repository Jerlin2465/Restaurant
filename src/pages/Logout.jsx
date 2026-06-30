import axios from "axios";
import { Alert, Box, Button, Paper, Snackbar, Typography } from "@mui/material";
import { red } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const [loginDetalis, setLoginDetalis] = useState(null);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("success");
  const [message, setMessage] = useState("");

  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/getdetail`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setLoginDetalis(res.data.user);
    } catch (error) {
      console.log("getUser error:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();

    setMessage("Logged out successfully");
    setType("success");
    setOpen(true);

    setTimeout(() => {
      navigate("/login");
      window.location.reload();
    }, 1000);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
        backgroundColor: "#0f172a",
      }}
    >
      <Paper
        sx={{
          width: 350,
          p: 4,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
          backgroundColor: "#bbb",
        }}
      >
        {loginDetalis ? (
          <>
            <Typography variant="h4" fontWeight="bold">
              My Account
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                fontSize: "20px",
              }}
            >
              <Typography>Name : {loginDetalis?.name}</Typography>
              <Typography>Email : {loginDetalis?.email}</Typography>
              <Typography>Phone : {loginDetalis?.number}</Typography>
            </Box>
            <Button
              fullWidth
              sx={{ mt: 2, backgroundColor: "#000", color: "white" }}
              onClick={handleLogout}
            >
              LogOut
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4">No Login Found</Typography>
            <Button
              onClick={() => navigate("/login")}
              sx={{ backgroundColor: "#000", color: "#fff", py:1,px:8}}
            >
              Go to Login
            </Button>
          </>
        )}
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

export default Logout;
