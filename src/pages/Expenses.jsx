import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore"
import {
  Container, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import ExpenseForm from "../components/ExpenseForm"

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState(null)

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ color: "#0A2342", mb: 2, fontWeight: "bold" }}>
        Expenses
      </Typography>
      <ExpenseForm />
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
            {expenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>{exp.date?.toDate?.().toLocaleDateString?.() || ""}</TableCell>
                <TableCell>{exp.item}</TableCell>
                <TableCell>{exp.cost}</TableCell>
                <TableCell>{exp.notes}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(exp)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(exp.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
          <Button onClick={handleUpdate} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
