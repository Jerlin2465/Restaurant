// DrawerAppBar.jsx
import * as React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const drawerWidth = 240;

/** Build nav items based on role + designation */
const buildNavItems = (user) => {
  const role = user?.role?.toLowerCase() || "";
  const desig = user?.designation?.toLowerCase() || "";

  const isAdmin = role === "admin" || role === "manager";
  const isChef = desig === "chef";
  const isServer = desig === "server";
  const isDelivery = desig === "delivery";
  const isWorker = role === "worker";

  const items = [];

  // Home is always shown (public)
  items.push({ name: "Home", path: "/" });

  // Chef sees: Home + Chef Dashboard only
  if (isWorker && isChef) {
    items.push({ name: "Chef Dashboard", path: "/chefdashboard" });
    return items;
  }

  // Server sees: Home + Server Dashboard only
  if (isWorker && isServer) {
    items.push({ name: "Server Dashboard", path: "/serverdashboard" });
    return items;
  }

  // Delivery sees: Home + Delivery Dashboard only
  if (isWorker && isDelivery) {
    items.push({ name: "Delivery Dashboard", path: "/deliverydashboard" });
    return items;
  }

  // Regular user
  if (role === "user") {
    items.push({ name: "Menu", path: "/menu" });
    items.push({ name: "Cart", path: "/cart" });
    items.push({ name: "Table Book", path: "/tablebooking" });
    return items;
  }

  // Admin / Manager sees everything
  if (isAdmin) {
    items.push({ name: "Menu", path: "/menu" });
    items.push({ name: "Cart", path: "/cart" });
    items.push({ name: "Table Book", path: "/tablebooking" });
    items.push({ name: "Chef Dashboard", path: "/chefdashboard" });
    items.push({ name: "Server Dashboard", path: "/serverdashboard" });
    items.push({ name: "Delivery Dashboard", path: "/deliverydashboard" });
    return items;
  }

  // Unauthenticated / unknown — minimal
  items.push({ name: "Menu", path: "/menu" });
  return items;
};

function Workerrouter(props) {
  const { window } = props;
  const navigate = useNavigate();

  // Re-read user on every render so nav updates after login
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navItems = buildNavItems(user);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleDrawerToggle = () => setMobileOpen((p) => !p);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const drawer = (
    <Box sx={{ backgroundColor: "#111", color: "#fff", height: "100%" }}>
      <Typography
        variant="h5"
        sx={{ textAlign: "center", py: 2, fontWeight: "bold" }}
      >
        Jerry
      </Typography>
      <Divider sx={{ backgroundColor: "#444" }} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                handleDrawerToggle();
              }}
            >
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                    {item.name}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar component="nav" sx={{ backgroundColor: "#111" }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Jerry
          </Typography>

          {/* Desktop nav */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.name}
                onClick={() => navigate(item.path)}
                sx={{ color: "#fff", fontWeight: "bold", fontSize: "15px" }}
              >
                {item.name}
              </Button>
            ))}

            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircleIcon fontSize="large" />
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              <MenuItem
                onClick={() => {
                  navigate("/dashboard");
                  handleMenuClose();
                }}
              >
                Profile
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate(
                    user && Object.keys(user).length ? "/logout" : "/login",
                  );
                }}
              >
                {user && Object.keys(user).length ? "Logout" : "Login"}
              </MenuItem>

              {(user?.role === "admin" || user?.role === "manager") && (
                <MenuItem
                  onClick={() => {
                    navigate("/adminpannel");
                    handleMenuClose();
                  }}
                >
                  Admin Panel
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Mobile account icon */}
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#111",
              color: "#fff",
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}

export default Workerrouter;
