import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../firebase";

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("demoUser"); // ✅ clear demo
    logout(); // ✅ firebase logout
    navigate("/login");
  };

  const navLinks = [
    { label: "Summary", path: "/summary" },
    { label: "Sales", path: "/sales" },
    { label: "Expenses", path: "/expenses" },
  ];

  const drawer = (
    <Box
      sx={{ width: 240, bgcolor: "#0A2342", height: "100%", color: "#FFCC00" }}
      onClick={() => setMobileOpen(false)}
    >
      <Typography
        variant="h6"
        sx={{ my: 2, textAlign: "center", fontWeight: "bold", color: "#FFCC00" }}
      >
        ZENTRO
      </Typography>
      <Divider sx={{ bgcolor: "#FFCC00" }} />
      <List>
        {navLinks.map(({ label, path }) => (
          <ListItem
            button
            key={path}
            component={Link}
            to={path}
            sx={{
              "&:hover": { bgcolor: "#132F55" },
            }}
          >
            <ListItemText primary={label} />
          </ListItem>
        ))}
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            "&:hover": { bgcolor: "#132F55" },
          }}
        >
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#0A2342" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Brand */}
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#FFCC00" }}
          >
            ZENTRO Dashboard
          </Typography>

          {/* Desktop links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {navLinks.map(({ label, path }) => (
              <Button
                key={path}
                component={Link}
                to={path}
                sx={{
                  color: "#FFCC00",
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                {label}
              </Button>
            ))}
            <Button
              onClick={handleLogout}
              sx={{
                color: "#fff",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Logout
            </Button>
          </Box>

          {/* Mobile menu button */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: "flex", md: "none" }, color: "#FFCC00" }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
