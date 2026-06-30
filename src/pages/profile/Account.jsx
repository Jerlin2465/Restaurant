import axios from "axios";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Account = () => {
  const [loginDetalis, setLoginDetalis] = useState(null);

  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const res = await axios.get(`${API_URL}/api/getdetail`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLoginDetalis(res.data.user);
    } catch (error) {
      console.log("getUser error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <Box sx={{ backgroundColor: "#0f172a", p: 5, borderRadius: 5 }}>
        <Typography variant="h4" sx={{ color: "#ccc" }}>
          Login Details
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "90vh",
            width: "100%",
          }}
        >
          <Paper
            sx={{
              width: 400,
              p: 4,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              backgroundColor: "#ccc",
            }}
          >
            {loginDetalis ? (
              <>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ textAlign: "center" }}
                >
                  Login Details
                </Typography>

                <Typography fontSize="28px">
                  <strong>Name :</strong> {loginDetalis.name}
                </Typography>

                <Typography fontSize="28px">
                  <strong>Email :</strong> {loginDetalis.email}
                </Typography>

                <Typography fontSize="28px">
                  <strong>Phone :</strong> {loginDetalis.number}
                </Typography>

                {loginDetalis.role !== "user" && (
                  <>
                    <Typography fontSize="28px">
                      <strong>Role :</strong> {loginDetalis.role}
                    </Typography>

                    <Typography fontSize="28px">
                      <strong>Designation :</strong> {loginDetalis.designation}
                    </Typography>
                  </>
                )}
              </>
            ) : (
              <>
                <Typography sx={{textAlign:"center"}} >No Login Found</Typography>

                <Button variant="contained" onClick={() => navigate("/login")}>
                  Go to Login
                </Button>
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default Account;
