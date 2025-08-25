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
import SalesForm from "../components/SalesForm"

export default function Sales() {
  const [sales, setSales] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [currentSale, setCurrentSale] = useState(null)

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("date", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ color: "#0A2342", mb: 2, fontWeight: "bold" }}>
        Sales
      </Typography>
      <SalesForm />
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
            {sales.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.date?.toDate?.().toLocaleDateString?.() || ""}</TableCell>
                <TableCell>{s.item}</TableCell>
                <TableCell>{s.revenue}</TableCell>
                <TableCell>{s.cost}</TableCell>
                <TableCell>{s.profit}</TableCell>
                <TableCell>{s.notes}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(s)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(s.id)}>
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
        <DialogTitle>Edit Sale</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
          <Button onClick={handleUpdate} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
