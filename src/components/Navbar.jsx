/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { auth, logout } from "../firebase"; // centralized logout

export default function Navbar() {
  const [user, setUser] = useState(null);

  // Watch auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  // Navigation links config
  const navLinks = [
    { label: "Expenses", path: "/expenses" },
    { label: "Sales", path: "/sales" },
    { label: "Summary", path: "/summary" },
  ];

  return (
    <AppBar position="static" sx={{ bgcolor: "#0A2342" }}>
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // stacked on mobile
          alignItems: { xs: "center", md: "center" },
          justifyContent: "space-between",
          gap: { xs: 1, md: 2 },
          px: { xs: 2, md: 4 },
          py: { xs: 1, md: 2 },
        }}
      >
        {/* Navigation Links */}
   <Box
  sx={{
    display: "flex",
    flexDirection: "row", // always row
    gap: { xs: 1, md: 2 }, // smaller gap on mobile
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap", // allow wrapping on small screens if too wide
  }}
>
  {navLinks.map(({ label, path }) => (
    <Button
      key={path}
      component={Link}
      to={path}
      sx={{
        color: "#FFCC00",
        fontWeight: "bold",
        textTransform: "none",
        fontSize: { xs: "0.8rem", md: "1rem" }, // smaller text on mobile
      }}
    >
      {label}
    </Button>
  ))}
</Box>


        {/* User Info + Logout */}
        {user && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: { xs: 1, md: 0 }, // push down on mobile
            }}
          >
            <Typography sx={{ color: "#FFCC00", fontWeight: "bold" }}>
              {user.email}
            </Typography>
            <Button
              onClick={logout}
              variant="contained"
              color="secondary"
              sx={{
                color: "#0A2342",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
