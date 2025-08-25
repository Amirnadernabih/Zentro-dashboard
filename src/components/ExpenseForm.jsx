import { useState } from "react"
import { db } from "../firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import {
  Box,
  Button,
  TextField,
} from "@mui/material"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"

export default function ExpenseForm() {
  const [form, setForm] = useState({ date: new Date(), item: "", cost: "", notes: "" })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, "expenses"), {
      ...form,
      cost: parseFloat(form.cost),
      date: Timestamp.fromDate(new Date(form.date)),
    })
    setForm({ date: new Date(), item: "", cost: "", notes: "" })
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Date"
          value={form.date}
          onChange={(newDate) => setForm({ ...form, date: newDate })}
          slotProps={{
            textField: { required: true, sx: { flex: "1 1 150px" } },
          }}
        />
      </LocalizationProvider>

      <TextField
        label="Item"
        name="item"
        value={form.item}
        onChange={handleChange}
        required
        sx={{ flex: "1 1 150px" }}
      />

      <TextField
        label="Cost (EGP)"
        name="cost"
        value={form.cost}
        onChange={handleChange}
        required
        type="number"
        sx={{ flex: "1 1 150px" }}
      />

      <TextField
        label="Notes"
        name="notes"
        value={form.notes}
        onChange={handleChange}
        sx={{ flex: "2 1 300px" }}
      />

      <Button
        type="submit"
        variant="contained"
        color="secondary"
        sx={{ flex: "1 1 120px", color: "#0A2342" }}
      >
        Add
      </Button>
    </Box>
  )
}
