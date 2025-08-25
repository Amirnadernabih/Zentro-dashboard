import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore"
import {
  Container, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, IconButton
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import SalesForm from "../components/SalesForm"

export default function Sales() {
  const [sales, setSales] = useState([])

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
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(s.id)}
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
