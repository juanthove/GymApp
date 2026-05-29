import React from "react";
import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { RED_GRADIENT } from "../utils/colorUtils";

dayjs.locale("es");

function formatVolume(value) {
  return Number(value || 0).toLocaleString("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatLabel(label, granularity) {
  const date = dayjs(Number(label));

  switch (granularity) {
    case "MONTH":
      const formatted = date.format("MMMM YYYY");
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    case "WEEK":
    case "DAY":
    default:
      return date.format("DD/MM/YYYY");
  }
}

export default function CustomLineTooltip({ active, payload, label, granularity = "DAY" }) {
  console.log(granularity);
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const value = payload[0]?.value;

  return (
    <Box
      sx={{
        minWidth: 140,
        bgcolor: "rgba(20,20,20,0.96)",
        color: "#fff",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* HEADER */}
      <Box sx={{ px: 2, py: 1, background: RED_GRADIENT }}>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
          {formatLabel(label, granularity)}
        </Typography>
      </Box>

      {/* BODY */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatVolume(value)}</Typography>

        <Typography sx={{ mt: 0.5, fontSize: "0.85rem", opacity: 0.7 }}>kg de volumen</Typography>
      </Box>
    </Box>
  );
}
