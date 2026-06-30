import React, { useState } from "react";

import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Drawer,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [openDrawer, setOpenDrawer] = useState(false);

  const menuItems = [
    ...(["admin", "manager", "user"].includes(user?.role?.toLowerCase())
      ? [
          {
            name: "Orders",
            path: "/dashboard/orderdetails",
          },
          {
            name: "My Booking",
            path: "/dashboard/mybooking",
          },
        ]
      : []),
    {
      name: "Login details",
      path: "/dashboard/account",
    },
  ];

  const sidebarContent = (
    <Box
      sx={{
        width: 250,
        height: "100%",
        backgroundColor: "#0f172a",
        color: "#fff",
        p: 2,
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
          }}
        >
          My Account
        </Typography>

        {isMobile && (
          <IconButton onClick={() => setOpenDrawer(false)}>
            <CloseIcon sx={{ color: "#fff" }} />
          </IconButton>
        )}
      </Box>

      {/* MENU LIST */}
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.name}
            onClick={() => {
              navigate(item.path);

              if (isMobile) {
                setOpenDrawer(false);
              }
            }}
            sx={{
              borderRadius: "10px",
              mb: 1,
              color: "#fff",
              backgroundColor:
                location.pathname === item.path ? "#ffffff33" : "transparent",

              "&:hover": {
                backgroundColor: "#ffffff33",
              },
            }}
          >
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                fontSize: "17px",
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Box
          sx={{
            width: 260,
            backgroundColor: "#111",
            color: "#fff",
            p: 2,
            position: "fixed",
            top: 63,
            left: 0,
            height: "calc(100vh - 70px)",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 3,
            }}
          >
            My Account
          </Typography>

          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.name}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: "8px",
                  mb: 1,
                  color: "#fff",
                  backgroundColor:
                    location.pathname === item.path
                      ? "#ffffff33"
                      : "transparent",

                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: "17px",
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      {/* MOBILE MENU ICON */}
      {isMobile && (
        <IconButton
          onClick={() => setOpenDrawer(true)}
          sx={{
            position: "fixed",
            top: 20,
            left: 15,
            zIndex: 1300,
            backgroundColor: "#111",
            color: "#fff",

            "&:hover": {
              backgroundColor: "#222",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        anchor="Left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        {sidebarContent}
      </Drawer>

      {/* RIGHT CONTENT */}
      <Box
        sx={{
          marginLeft: {
            xs: 0,
            md: "260px",
          },
          marginTop: "70px",
          width: "100%",
          minHeight: "calc(100vh - 70px)",
          backgroundColor: "#f5f6fa",
          p: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
