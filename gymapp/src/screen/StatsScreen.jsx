import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import BackButton from "../components/BackButton";
import {
  getTotalWorkoutVolumeByUserAndDateRange,
  getWeeklyMuscleVolumeByUserAndDateRange,
} from "../services/workoutSetService";

function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatVolume(value) {
  return Number(value || 0).toFixed(2);
}

function shiftDateIso(dateIso, days) {
  const d = new Date(`${dateIso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getMuscleColor(muscle) {
  const colorMap = {
    CHEST: "#ef5350",
    BACK: "#42a5f5",
    SHOULDERS: "#ffb74d",
    BICEPS: "#66bb6a",
    TRICEPS: "#26a69a",
    FOREARMS: "#8d6e63",
    QUADRICEPS: "#7e57c2",
    GLUTES: "#ab47bc",
    HAMSTRINGS: "#5c6bc0",
    CALVES: "#29b6f6",
    ABDOMINALS: "#ec407a",
  };

  return colorMap[muscle] || "#78909c";
}

export default function StatsScreen() {
  const { userId } = useParams();

  const defaultTo = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 28);
    return d;
  }, []);

  const [from, setFrom] = useState(toInputDate(defaultFrom));
  const [to, setTo] = useState(toInputDate(defaultTo));

  const [totalVolume, setTotalVolume] = useState(0);
  const [weeklyByMuscle, setWeeklyByMuscle] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enhancedRows = useMemo(() => {
    const byWeekAndMuscle = new Map(
      weeklyByMuscle.map((item) => [`${item.weekStart}|${item.muscle || "SIN_MUSCULO"}`, Number(item.volume || 0)])
    );

    const rows = weeklyByMuscle.map((item) => {
      const muscle = item.muscle || "SIN_MUSCULO";
      const previousWeekStart = shiftDateIso(item.weekStart, -7);
      const previousVolume = byWeekAndMuscle.get(`${previousWeekStart}|${muscle}`) || 0;
      const currentVolume = Number(item.volume || 0);
      const delta = currentVolume - previousVolume;
      const percent = previousVolume > 0 ? (delta / previousVolume) * 100 : null;

      return {
        ...item,
        muscle,
        previousVolume,
        currentVolume,
        delta,
        percent,
      };
    });

    const maxVolume = Math.max(...rows.map((r) => r.currentVolume), 0);

    return rows.map((row) => ({
      ...row,
      volumeRatio: maxVolume > 0 ? (row.currentVolume / maxVolume) * 100 : 0,
    }));
  }, [weeklyByMuscle]);

  const muscleOptions = useMemo(() => {
    const muscles = [...new Set(enhancedRows.map((row) => row.muscle))].sort();
    return ["ALL", ...muscles];
  }, [enhancedRows]);

  const filteredRows = useMemo(() => {
    if (selectedMuscle === "ALL") {
      return enhancedRows;
    }

    return enhancedRows.filter((row) => row.muscle === selectedMuscle);
  }, [enhancedRows, selectedMuscle]);

  const weeklyGroups = useMemo(() => {
    const groups = new Map();

    for (const row of filteredRows) {
      const key = `${row.weekStart}|${row.weekEnd}`;

      if (!groups.has(key)) {
        groups.set(key, {
          weekStart: row.weekStart,
          weekEnd: row.weekEnd,
          rows: [],
          subtotal: 0,
        });
      }

      const group = groups.get(key);
      group.rows.push(row);
      group.subtotal += row.currentVolume;
    }

    return Array.from(groups.values());
  }, [filteredRows]);

  const loadStats = async () => {
    if (!from || !to) {
      setError("Debes seleccionar fecha desde y hasta");
      return;
    }

    if (from > to) {
      setError("La fecha desde no puede ser mayor que la fecha hasta");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const [totalRes, weeklyRes] = await Promise.all([
        getTotalWorkoutVolumeByUserAndDateRange(userId, from, to),
        getWeeklyMuscleVolumeByUserAndDateRange(userId, from, to),
      ]);

      setTotalVolume(totalRes?.totalVolume || 0);
      setWeeklyByMuscle(weeklyRes || []);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ position: "relative" }}>
          <BackButton to={`/workout/${userId}`} sx={{ position: "absolute", left: 0 }} />
          <Typography variant="h4" textAlign="center" sx={{ width: "100%" }}>
            Estadísticas
          </Typography>
        </Stack>

        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="end">
              <TextField
                type="date"
                label="Desde"
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                fullWidth
              />

              <TextField
                type="date"
                label="Hasta"
                InputLabelProps={{ shrink: true }}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                fullWidth
              />

              <Button variant="contained" onClick={loadStats} disabled={loading}>
                {loading ? "Cargando..." : "Actualizar"}
              </Button>
            </Stack>

            <TextField
              select
              label="Músculo"
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              sx={{ mt: 2, maxWidth: 260 }}
            >
              {muscleOptions.map((muscle) => (
                <MenuItem key={muscle} value={muscle}>
                  {muscle === "ALL" ? "Todos" : muscle}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        <Card>
          <CardContent>
            <Typography variant="h6">Volumen total del período</Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
              {formatVolume(totalVolume)} kg
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Volumen semanal por músculo
            </Typography>

            {filteredRows.length === 0 ? (
              <Typography color="text.secondary">No hay datos para ese rango.</Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Semana</TableCell>
                      <TableCell>Músculo</TableCell>
                      <TableCell align="right">Volumen</TableCell>
                      <TableCell align="right">Δ vs semana previa</TableCell>
                      <TableCell align="right">Δ %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weeklyGroups.map((group) => (
                      <Fragment key={`${group.weekStart}-${group.weekEnd}`}>
                        {group.rows.map((row, index) => (
                          <TableRow key={`${row.weekStart}-${row.muscle}-${index}`}>
                            <TableCell>{row.weekStart} a {row.weekEnd}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.muscle}
                                sx={{
                                  color: "#fff",
                                  bgcolor: getMuscleColor(row.muscle),
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack spacing={0.6} alignItems="flex-end">
                                <Typography variant="body2">{formatVolume(row.currentVolume)} kg</Typography>
                                <Box sx={{ width: 120 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={row.volumeRatio}
                                    sx={{ height: 7, borderRadius: 10 }}
                                  />
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color: row.delta >= 0 ? "success.main" : "error.main",
                                fontWeight: 600,
                              }}
                            >
                              {row.delta >= 0 ? "+" : ""}{formatVolume(row.delta)} kg
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color: row.percent == null ? "text.secondary" : row.percent >= 0 ? "success.main" : "error.main",
                                fontWeight: 600,
                              }}
                            >
                              {row.percent == null ? "-" : `${row.percent >= 0 ? "+" : ""}${formatVolume(row.percent)}%`}
                            </TableCell>
                          </TableRow>
                        ))}

                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                            Subtotal semanal ({group.weekStart} a {group.weekEnd})
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {formatVolume(group.subtotal)} kg
                          </TableCell>
                          <TableCell colSpan={2} />
                        </TableRow>
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
