import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { Container, Typography, Grid } from "@mui/material"
import SummaryCard from "../components/SummaryCard"

export default function Summary() {
  const [totals, setTotals] = useState({ expenses: 0, revenue: 0, cost: 0, profit: 0 })

  useEffect(() => {
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
  }, [])

  return (
    <Container sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        sx={{ color: "#0A2342", mb: 4, fontWeight: "bold", textAlign: "center" }}
      >
        Summary
      </Typography>
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
    </Container>
  )
}
