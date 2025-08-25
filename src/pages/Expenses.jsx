import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore"
import {
  Container, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, IconButton
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import ExpenseForm from "../components/ExpenseForm"

export default function Expenses() {
  const [expenses, setExpenses] = useState([])

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
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(exp.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
