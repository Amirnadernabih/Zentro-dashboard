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
import ExpenseForm from "../components/ExpenseForm"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"

export default function Expenses({ demoUser = false }) {
  // shared UI state
  const [editOpen, setEditOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState(null)

  // ---------------- DEMO MODE STATE & LOGIC ----------------
  const [demoExpenses, setDemoExpenses] = useState([])
  const [demoForm, setDemoForm] = useState({
    date: new Date(),
    item: "",
    cost: "",
    notes: "",
  })

  const persistDemoExpenses = (rows) => {
    setDemoExpenses(rows)
    localStorage.setItem("demo_expenses", JSON.stringify(rows))
  }

  const handleDemoAdd = (e) => {
    e?.preventDefault?.()
    const row = {
      id: String(Date.now()),
      date: new Date(demoForm.date).toISOString(),
      item: demoForm.item || "",
      cost: parseFloat(demoForm.cost) || 0,
      notes: demoForm.notes || "",
    }
    const next = [row, ...demoExpenses]
    persistDemoExpenses(next)
    setDemoForm({ date: new Date(), item: "", cost: "", notes: "" })
  }

  const handleDemoDelete = (id) => {
    const next = demoExpenses.filter((r) => r.id !== id)
    persistDemoExpenses(next)
  }

  const handleDemoEditOpen = (exp) => {
    setCurrentExpense(exp)
    setEditOpen(true)
  }

  const handleDemoUpdate = () => {
    if (!currentExpense) return
    const next = demoExpenses.map((r) =>
      r.id === currentExpense.id
        ? {
            ...r,
            item: currentExpense.item || "",
            cost: parseFloat(currentExpense.cost) || 0,
            notes: currentExpense.notes || "",
            date: currentExpense.date, // ISO string
          }
        : r
    )
    persistDemoExpenses(next)
    setEditOpen(false)
    setCurrentExpense(null)
  }

  // ---------------- REAL MODE STATE & LOGIC ----------------
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    if (demoUser) {
      // DEMO: load localStorage once on mount/toggle
      const saved = JSON.parse(localStorage.getItem("demo_expenses") || "[]")
      setDemoExpenses(saved)
      return
    }

    // REAL: Firestore subscription (your original)
    const q = query(collection(db, "expenses"), orderBy("date", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [demoUser])

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "expenses", id))
    } catch (err) {
      console.error("Failed to delete expense:", err)
    }
  }

  const handleEdit = (expense) => {
    setCurrentExpense(expense)
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const { id, item, cost, notes } = currentExpense
      await updateDoc(doc(db, "expenses", id), { item, cost: Number(cost), notes })
      setEditOpen(false)
      setCurrentExpense(null)
    } catch (err) {
      console.error("Failed to update expense:", err)
    }
  }

  // ---------------- RENDER ----------------
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ color: "#0A2342", mb: 2, fontWeight: "bold" }}>
        Expenses
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
          <TextField label="Cost (EGP)" type="number" value={demoForm.cost} onChange={(e) => setDemoForm({ ...demoForm, cost: e.target.value })} required sx={{ flex: "1 1 150px" }}/>
          <TextField label="Notes" value={demoForm.notes} onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })} sx={{ flex: "2 1 300px" }}/>
          <Button type="submit" variant="contained" color="secondary" sx={{ flex: "1 1 120px", color: "#0A2342" }}>
            Add
          </Button>
        </Box>
      ) : (
        // REAL Firestore form (your original component)
        <ExpenseForm />
      )}

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#FFCC00" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(demoUser ? demoExpenses : expenses).map((exp) => {
              const dateStr = demoUser
                ? (exp.date ? new Date(exp.date).toLocaleDateString() : "")
                : (exp.date?.toDate?.().toLocaleDateString?.() || "")
              return (
                <TableRow key={exp.id}>
                  <TableCell>{dateStr}</TableCell>
                  <TableCell>{exp.item}</TableCell>
                  <TableCell>{exp.cost}</TableCell>
                  <TableCell>{exp.notes}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => (demoUser ? handleDemoEditOpen(exp) : handleEdit(exp))}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => (demoUser ? handleDemoDelete(exp.id) : handleDelete(exp.id))}
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
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {demoUser ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={currentExpense?.date ? new Date(currentExpense.date) : null}
                onChange={(d) =>
                  setCurrentExpense((prev) => ({ ...prev, date: (d || new Date()).toISOString() }))
                }
                slotProps={{ textField: { required: true } }}
              />
            </LocalizationProvider>
          ) : null}

          <TextField
            label="Item"
            value={currentExpense?.item || ""}
            onChange={(e) => setCurrentExpense({ ...currentExpense, item: e.target.value })}
          />
          <TextField
            label="Cost"
            type="number"
            value={currentExpense?.cost || ""}
            onChange={(e) => setCurrentExpense({ ...currentExpense, cost: e.target.value })}
          />
          <TextField
            label="Notes"
            value={currentExpense?.notes || ""}
            onChange={(e) => setCurrentExpense({ ...currentExpense, notes: e.target.value })}
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
