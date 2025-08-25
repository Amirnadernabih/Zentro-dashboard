/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react"
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth"
import { auth } from "../firebase"
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login({ setUser, setDemoUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(0)

  const inCooldown = Date.now() < cooldownUntil

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch(() => {})
  }, [])

  const emailValid = useMemo(() => EMAIL_RE.test(email.trim().toLowerCase()), [email])
  const canSubmit = emailValid && password.length > 0 && !loading && !inCooldown

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    if (!canSubmit) return
    setLoading(true)

    const eSan = email.trim().toLowerCase()
    const pSan = password.normalize("NFKC")

    try {
      const userCred = await signInWithEmailAndPassword(auth, eSan, pSan)
      setUser(userCred.user)
    } catch {
      setError("Invalid email or password")
      setCooldownUntil(Date.now() + 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    setDemoUser(true)
    setUser({ email: "demo@guest.com" })
  }

  // Responsive helpers
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Container maxWidth="xs" sx={{ mt: { xs: 6, sm: 10 } }}>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          bgcolor: "#ffffff",
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        }}
        noValidate
        autoComplete="off"
      >
        <Typography
          variant={isXs ? "h5" : "h4"}
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#0A2342",
            mb: 1,
          }}
        >
          Welcome Back
        </Typography>
        <Typography
          variant="body2"
          sx={{ textAlign: "center", color: "text.secondary", mb: 2 }}
        >
          Please sign in to continue
        </Typography>

        <TextField
          label="Email"
          type="email"
          fullWidth
          size="medium"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputProps={{
            inputMode: "email",
            autoCapitalize: "none",
            autoCorrect: "off",
            spellCheck: "false",
            "aria-label": "Email address",
          }}
          error={email.length > 0 && !emailValid}
          helperText={
            email.length > 0 && !emailValid ? "Enter a valid email" : " "
          }
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          size="medium"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          inputProps={{
            minLength: 8,
            "aria-label": "Password",
          }}
        />

        {error && (
          <Typography
            variant="body2"
            sx={{ color: "red", textAlign: "center", mt: -1 }}
          >
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          sx={{
            bgcolor: "#0A2342",
            color: "#FFCC00",
            fontWeight: "bold",
            py: 1.2,
            "&:hover": { bgcolor: "#132F55" },
          }}
          disabled={!canSubmit}
        >
          {loading ? "Signing in..." : inCooldown ? "Please wait..." : "Login"}
        </Button>

        <Button
          onClick={handleGuest}
          variant="outlined"
          sx={{
            color: "#0A2342",
            borderColor: "#0A2342",
            fontWeight: "bold",
            py: 1.2,
            "&:hover": { borderColor: "#132F55", color: "#132F55" },
          }}
          disabled={loading}
        >
          Continue as Guest
        </Button>
      </Box>
    </Container>
  )
}
