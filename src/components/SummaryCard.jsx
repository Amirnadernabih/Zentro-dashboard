import { Card, CardContent, Typography } from "@mui/material"

export default function SummaryCard({ title, value }) {
  return (
    <Card sx={{ bgcolor: "#0A2342", color: "#FFCC00", borderRadius: 3, minWidth: 200 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4" fontWeight="bold">
          {value} EGP
        </Typography>
      </CardContent>
    </Card>
  )
}
