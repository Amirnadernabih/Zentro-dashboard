import { useEffect, useState, useMemo } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { Container, Typography, Grid, Box, useMediaQuery, useTheme } from "@mui/material"
import SummaryCard from "../components/SummaryCard"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"

export default function Summary({ demoUser = false }) {
  const [totals, setTotals] = useState({ expenses: 0, revenue: 0, cost: 0, profit: 0 })

  useEffect(() => {
    if (demoUser) {
      // ---- DEMO MODE: read from localStorage only ----
      const readNumber = (v) => {
        const n = typeof v === "string" ? parseFloat(v) : v
        return Number.isFinite(n) ? n : 0
      }

      const demoSales = JSON.parse(localStorage.getItem("demo_sales") || "[]")
      const demoExpenses = JSON.parse(localStorage.getItem("demo_expenses") || "[]")

      const totalExpenses = demoExpenses.reduce((sum, d) => sum + readNumber(d.cost), 0)
      const totalRevenue = demoSales.reduce((sum, d) => sum + readNumber(d.revenue), 0)
      const totalCost = demoSales.reduce((sum, d) => sum + readNumber(d.cost), 0)
      const totalProfit = demoSales.reduce((sum, d) => sum + readNumber(d.profit), 0)

      setTotals({ expenses: totalExpenses, revenue: totalRevenue, cost: totalCost, profit: totalProfit })
      return
    }

    // ---- REAL MODE: Firestore listeners ----
    const unsubExp = onSnapshot(collection(db, "expenses"), (snap) => {
      const totalExpenses = snap.docs.reduce((sum, d) => sum + (d.data().cost || 0), 0)
      setTotals((prev) => ({ ...prev, expenses: totalExpenses }))
    })

    const unsubSales = onSnapshot(collection(db, "sales"), (snap) => {
      const totalRevenue = snap.docs.reduce((sum, d) => sum + (d.data().revenue || 0), 0)
      const totalCost = snap.docs.reduce((sum, d) => sum + (d.data().cost || 0), 0)
      const totalProfit = snap.docs.reduce((sum, d) => sum + (d.data().profit || 0), 0)
      setTotals((prev) => ({ ...prev, revenue: totalRevenue, cost: totalCost, profit: totalProfit }))
    })

    return () => {
      unsubExp()
      unsubSales()
    }
  }, [demoUser])

  // --- Responsive tuning ---
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down("sm"))
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"))

  // Chart height and radii adapt by breakpoint for true responsiveness
  const chartHeight = isXs ? 260 : isMdUp ? 420 : 340
  const outerRadius = isXs ? 90 : isMdUp ? 160 : 130
  const innerRadius = Math.round(outerRadius * 0.55) // donut look for clarity

  // Navy + Yellow palette (shades only in those families)
  const COLORS = ["#0A2342", "#FFCC00", "#334F70", "#FFD633"]

  // Safe values for pie (no negatives in slices)
  const chartData = useMemo(() => {
    const safe = (v) => (Number.isFinite(v) && v > 0 ? v : 0)
    return [
      { name: "Expenses", value: safe(totals.expenses) },
      { name: "Revenue", value: safe(totals.revenue) },
      { name: "Cost",     value: safe(totals.cost) },
      { name: "Profit",   value: safe(totals.profit) },
    ]
  }, [totals])

  const allZero = chartData.every((d) => d.value === 0)

  // Currency formatter for tooltip/labels
  const fmt = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 })

  return (
    <Container sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        sx={{ color: "#0A2342", mb: 4, fontWeight: "bold", textAlign: "center" }}
      >
        Summary
      </Typography>

      {/* Summary Cards remain as in your original */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={3}>
          <SummaryCard title="Total Expenses" value={totals.expenses} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SummaryCard title="Total Revenue" value={totals.revenue} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SummaryCard title="Total Cost" value={totals.cost} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SummaryCard title="Net Profit" value={totals.profit} />
        </Grid>
      </Grid>

      {/* Responsive Pie Chart (no decorative boxes) */}
      <Box sx={{ mt: 5, width: "100%", height: chartHeight }}>
        {allZero ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A2342",
              fontWeight: "bold",
              opacity: 0.7,
            }}
          >
            No data to display
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                // Labels on medium+ screens; hidden on phones for readability
                label={isXs ? false : ({ name, value }) => `${name}: ${fmt.format(value)}`}
                isAnimationActive
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => fmt.format(value)} />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  fontSize: isXs ? 12 : 14,
                  marginTop: isXs ? -12 : 0,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Container>
  )
}
