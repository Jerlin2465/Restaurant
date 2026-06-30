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

const user = JSON.parse(localStorage.getItem("user") || "{}");

const navItems = [
  {
    name: "Home",
    path: "/",
  },

  ...(["admin", "manager", "user"].includes(user?.role?.toLowerCase())
    ? [
        {
          name: "Menu",
          path: "/menu",
        },
        {
          name: "Table Book",
          path: "/tablebooking",
        },
      ]
    : []),

  ...(["chef", "admin", "manager"].includes(user?.designation?.toLowerCase()) ||
  ["admin", "manager"].includes(user?.role?.toLowerCase())
    ? [
        {
          name: "Chef Dashboard",
          path: "/chefdashboard",
        },
      ]
    : []),

  ...(["server", "admin", "manager"].includes(
    user?.designation?.toLowerCase(),
  ) || ["admin", "manager"].includes(user?.role?.toLowerCase())
    ? [
        {
          name: "Server Dashboard",
          path: "/serverdashboard",
        },
      ]
    : []),

  ...(["delivery", "admin", "manager"].includes(
    user?.designation?.toLowerCase(),
  ) || ["admin", "manager"].includes(user?.role?.toLowerCase())
    ? [
        {
          name: "Delivery Dashboard",
          path: "/deliverydashboard",
        },
      ]
    : []),
];

function DrawerAppBar(props) {
  const { window } = props;

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const open = Boolean(anchorEl);

  const token = localStorage.getItem("token");

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Drawer Content
  const drawer = (
    <Box
      sx={{
        backgroundColor: "#111",
        color: "#fff",
        height: "100%",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          py: 2,
          fontWeight: "bold",
        }}
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

      {/* Navbar */}
      <AppBar
        component="nav"
        sx={{
          backgroundColor: "#111",
        }}
      >
        <Toolbar>
          {/* Mobile Menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Jerry
          </Typography>

          {/* Desktop Menu */}
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
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                {item.name}
              </Button>
            ))}

            {/* Account Icon */}
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircleIcon fontSize="large" />
            </IconButton>

            {/* Dropdown Menu */}
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

                  if (user) {
                    navigate("/logout");
                  } else {
                    navigate("/login");
                  }
                }}
              >
                {user ? "Logout" : "Login"}
              </MenuItem>

              {(user?.role === "admin" || user?.role === "manager") && (
                <MenuItem
                  onClick={() => {
                    navigate("/adminpannel");
                    handleMenuClose();
                  }}
                >
                  Admin Pannel
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Mobile Account */}
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
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

DrawerAppBar.propTypes = {
  window: PropTypes.func,
};

export default DrawerAppBar;
