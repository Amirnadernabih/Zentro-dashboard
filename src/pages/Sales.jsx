import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore"
import {
  Container, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Box
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import SalesForm from "../components/SalesForm"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"

export default function Sales({ demoUser = false }) {
  // shared UI state
  const [editOpen, setEditOpen] = useState(false)
  const [currentSale, setCurrentSale] = useState(null)

  // ---------------- DEMO MODE STATE & LOGIC ----------------
  const [demoSales, setDemoSales] = useState([])
  const [demoForm, setDemoForm] = useState({
    date: new Date(),
    item: "",
    revenue: "",
    cost: "",
    notes: "",
  })

  const persistDemoSales = (rows) => {
    setDemoSales(rows)
    localStorage.setItem("demo_sales", JSON.stringify(rows))
  }

  const handleDemoAdd = (e) => {
    e?.preventDefault?.()
    const revenue = parseFloat(demoForm.revenue) || 0
    const cost = parseFloat(demoForm.cost) || 0
    const profit = revenue - cost
    const row = {
      id: String(Date.now()),
      date: new Date(demoForm.date).toISOString(),
      item: demoForm.item || "",
      revenue,
      cost,
      profit,
      notes: demoForm.notes || "",
    }
    const next = [row, ...demoSales]
    persistDemoSales(next)
    setDemoForm({ date: new Date(), item: "", revenue: "", cost: "", notes: "" })
  }

  const handleDemoDelete = (id) => {
    const next = demoSales.filter((r) => r.id !== id)
    persistDemoSales(next)
  }

  const handleDemoEditOpen = (sale) => {
    setCurrentSale(sale)
    setEditOpen(true)
  }

  const handleDemoUpdate = () => {
    if (!currentSale) return
    const revenue = parseFloat(currentSale.revenue) || 0
    const cost = parseFloat(currentSale.cost) || 0
    const profit = parseFloat(currentSale.profit)
    const computedProfit = Number.isFinite(profit) ? profit : revenue - cost

    const next = demoSales.map((r) =>
      r.id === currentSale.id
        ? {
            ...r,
            item: currentSale.item || "",
            revenue,
            cost,
            profit: computedProfit,
            notes: currentSale.notes || "",
            date: currentSale.date, // already ISO in demo state
          }
        : r
    )
    persistDemoSales(next)
    setEditOpen(false)
    setCurrentSale(null)
  }

  // ---------------- REAL MODE STATE & LOGIC ----------------
  const [sales, setSales] = useState([])

  useEffect(() => {
    if (demoUser) {
      // DEMO: load localStorage once on mount/toggle
      const saved = JSON.parse(localStorage.getItem("demo_sales") || "[]")
      setDemoSales(saved)
      return
    }

    // REAL: Firestore subscription (your original)
    const q = query(collection(db, "sales"), orderBy("date", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [demoUser])

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "sales", id))
    } catch (err) {
      console.error("Failed to delete sale:", err)
    }
  }

  const handleEdit = (sale) => {
    setCurrentSale(sale)
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const { id, item, revenue, cost, profit, notes } = currentSale
      await updateDoc(doc(db, "sales", id), {
        item,
        revenue: Number(revenue),
        cost: Number(cost),
        profit: Number(profit),
        notes
      })
      setEditOpen(false)
      setCurrentSale(null)
    } catch (err) {
      console.error("Failed to update sale:", err)
    }
  }

  // ---------------- RENDER ----------------
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ color: "#0A2342", mb: 2, fontWeight: "bold" }}>
        Sales
      </Typography>

      {/* Forms */}
      {demoUser ? (
        // DEMO inline form (local-only)
        <Box
          component="form"
          onSubmit={handleDemoAdd}
          sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={demoForm.date}
              onChange={(d) => setDemoForm({ ...demoForm, date: d || new Date() })}
              slotProps={{ textField: { required: true, sx: { flex: "1 1 150px" } } }}
            />
          </LocalizationProvider>
          <TextField label="Item" value={demoForm.item} onChange={(e) => setDemoForm({ ...demoForm, item: e.target.value })} required sx={{ flex: "1 1 150px" }}/>
          <TextField label="Revenue (EGP)" type="number" value={demoForm.revenue} onChange={(e) => setDemoForm({ ...demoForm, revenue: e.target.value })} required sx={{ flex: "1 1 150px" }}/>
          <TextField label="Cost (EGP)" type="number" value={demoForm.cost} onChange={(e) => setDemoForm({ ...demoForm, cost: e.target.value })} required sx={{ flex: "1 1 150px" }}/>
          <TextField label="Notes" value={demoForm.notes} onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })} sx={{ flex: "2 1 300px" }}/>
          <Button type="submit" variant="contained" color="secondary" sx={{ flex: "1 1 120px", color: "#0A2342" }}>
            Add
          </Button>
        </Box>
      ) : (
        // REAL Firestore form (your original component)
        <SalesForm />
      )}

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#FFCC00" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Profit</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(demoUser ? demoSales : sales).map((s) => {
              const dateStr = demoUser
                ? (s.date ? new Date(s.date).toLocaleDateString() : "")
                : (s.date?.toDate?.().toLocaleDateString?.() || "")
              return (
                <TableRow key={s.id}>
                  <TableCell>{dateStr}</TableCell>
                  <TableCell>{s.item}</TableCell>
                  <TableCell>{s.revenue}</TableCell>
                  <TableCell>{s.cost}</TableCell>
                  <TableCell>{s.profit}</TableCell>
                  <TableCell>{s.notes}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => (demoUser ? handleDemoEditOpen(s) : handleEdit(s))}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => (demoUser ? handleDemoDelete(s.id) : handleDelete(s.id))}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Sale</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {demoUser ? (
            <>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={currentSale?.date ? new Date(currentSale.date) : null}
                  onChange={(d) =>
                    setCurrentSale((prev) => ({ ...prev, date: (d || new Date()).toISOString() }))
                  }
                  slotProps={{ textField: { required: true } }}
                />
              </LocalizationProvider>
            </>
          ) : null}

          <TextField
            label="Item"
            value={currentSale?.item || ""}
            onChange={(e) => setCurrentSale({ ...currentSale, item: e.target.value })}
          />
          <TextField
            label="Revenue"
            type="number"
            value={currentSale?.revenue || ""}
            onChange={(e) => setCurrentSale({ ...currentSale, revenue: e.target.value })}
          />
          <TextField
            label="Cost"
            type="number"
            value={currentSale?.cost || ""}
            onChange={(e) => setCurrentSale({ ...currentSale, cost: e.target.value })}
          />
          <TextField
            label="Profit"
            type="number"
            value={currentSale?.profit || ""}
            onChange={(e) => setCurrentSale({ ...currentSale, profit: e.target.value })}
          />
          <TextField
            label="Notes"
            value={currentSale?.notes || ""}
            onChange={(e) => setCurrentSale({ ...currentSale, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={demoUser ? handleDemoUpdate : handleUpdate} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
