import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { auth, logout } from "./firebase"
import { onAuthStateChanged } from "firebase/auth"
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

import Summary from "./pages/Summary"
import Sales from "./pages/Sales"
import Expenses from "./pages/Expenses"
import Login from "./pages/Login"
import SplashScreen from "./components/SplashScreen"

export default function App() {
  const [user, setUser] = useState(null)
  const [demoUser, setDemoUser] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // 👇 controls showing splash right after auth becomes true
  const [showSplash, setShowSplash] = useState(false)
  const wasAuthedRef = useRef(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) setDemoUser(false)
    })
    return () => unsub()
  }, [])

  // detect transition: not authed -> authed (firebase or demo)
  useEffect(() => {
    const isAuthed = Boolean(user || demoUser)

    if (isAuthed && !wasAuthedRef.current) {
      // just logged in: show splash for ~3.5s
      setShowSplash(true)
      wasAuthedRef.current = true
      const t = setTimeout(() => setShowSplash(false), 3500)
      return () => clearTimeout(t)
    }

    if (!isAuthed && wasAuthedRef.current) {
      // logged out: reset flag so next login shows splash again
      wasAuthedRef.current = false
    }
  }, [user, demoUser])

  const navLinks = [
    { label: "Summary", path: "/" },
    { label: "Sales", path: "/sales" },
    { label: "Expenses", path: "/expenses" },
  ]

  const handleLogout = () => {
    if (demoUser) {
      setDemoUser(false)
      setUser(null)
    } else {
      logout()
    }
  }

  const drawer = (
    <Box
      sx={{ width: 240, bgcolor: "#0A2342", height: "100%", color: "#FFCC00" }}
      onClick={() => setMobileOpen(false)}
    >
      <Typography
        variant="h6"
        sx={{ my: 2, textAlign: "center", fontWeight: "bold" }}
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
            sx={{ "&:hover": { bgcolor: "#132F55" } }}
          >
            <ListItemText primary={label} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout} sx={{ "&:hover": { bgcolor: "#132F55" } }}>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Router>
      {/* ⛳ Show splash right after successful login (demo or real) */}
      {showSplash ? (
        <SplashScreen />
      ) : (
        <>
          {(user || demoUser) && (
            <>
              <AppBar position="static" sx={{ bgcolor: "#0A2342" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                  {/* Brand */}
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#FFCC00" }}>
                    ZENTRO Dashboard
                  </Typography>

                  {/* Desktop Links */}
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

                  {/* Mobile Hamburger */}
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
          )}

          <Routes>
            {(user || demoUser) ? (
              <>
                {/* keep both paths so SplashScreen's navigate('/summary') is valid */}
                <Route path="/" element={<Summary demoUser={demoUser} />} />
                <Route path="/summary" element={<Summary demoUser={demoUser} />} />
                <Route path="/sales" element={<Sales demoUser={demoUser} />} />
                <Route path="/expenses" element={<Expenses demoUser={demoUser} />} />
              </>
            ) : (
              <Route
                path="*"
                element={<Login setUser={setUser} setDemoUser={setDemoUser} />}
              />
            )}
          </Routes>
        </>
      )}
    </Router>
  )
}
