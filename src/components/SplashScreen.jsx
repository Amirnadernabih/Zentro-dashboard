/* eslint-disable no-unused-vars */
import { useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"

export default function SplashScreen() {
  const navigate = useNavigate()
  const word = "ZENTRO"

  // After animation ends → navigate to Summary
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/summary")
    }, 4000) // 4 seconds total
    return () => clearTimeout(timer)
  }, [navigate])

  const letterAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
    exit: { opacity: 0, transition: { duration: 1 } },
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFCC00", // Yellow background
      }}
    >
      {word.split("").map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={letterAnimation}
          style={{
            fontSize: "4rem",
            fontWeight: "bold",
            color: "#0A2342", // Navy
            marginRight: "5px",
          }}
        >
          {letter}
        </motion.span>
      ))}
    </Box>
  )
}
