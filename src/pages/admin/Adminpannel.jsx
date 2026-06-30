import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

const Adminpannel = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "AddProduct",
      path: "/adminpannel/addproduct",
      roles: ["admin", "manager"],
    },
    {
      name: "Manager Account",
      path: "/adminpannel/manageracc",
      roles: ["admin"],
    },
    {
      name: "Worker Account",
      path: "/adminpannel/workeracc",
      roles: ["manager"],
    },
    {
      name: "Product List",
      path: "/adminpannel/productlist",
      roles: ["admin", "manager"],
    },
    {
      name: "Order Status",
      path: "/adminpannel/orderstatus",
      roles: ["admin", "manager"],
    },
    {
      name: "Table Order Status",
      path: "/adminpannel/tableorderstatus",
      role: ["admin", "manager"],
    },
  ];
  const filteredMenu = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role),
  );
  return (
    <Box sx={{ minHeight: "100vh", mt: 8, width: "100%" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: "230px",
          backgroundColor: "#000",
          color: "white",
          p: 2.5,
          position: "fixed",
          top: "60px",
          left: 0,
          height: "calc(100vh - 70px)",
          overflowY: "auto",
          overflowX: "hidden",
          transition: "all 0.3s ease",
          zIndex: 1000,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
          Admin Panel
        </Typography>

        <List>
          {filteredMenu.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mb: 1,
                color: "#fff",
                "&.Mui-selected": {
                  bgcolor: "#444",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "#555",
                },
              }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Adminpannel;
