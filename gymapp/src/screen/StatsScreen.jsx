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

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";

import {
  getTotalWorkoutVolumeByUserAndDateRange,
  getWeeklyMuscleVolumeByUserAndDateRange,
  getVolumeByUserAndDateRange,
} from "../services/workoutSetService";

import {
  getWorkoutFrequency,
} from "../services/workoutDayService";

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

const muscleLabels = {
  CHEST: "Pecho",
  BACK: "Espalda",
  SHOULDERS: "Hombros",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  FOREARMS: "Antebrazos",
  QUADRICEPS: "Cuádriceps",
  GLUTES: "Glúteos",
  HAMSTRINGS: "Femorales",
  CALVES: "Gemelos",
  ABDOMINALS: "Abdominales"
};

export default function StatsScreen() {
  const { userId } = useParams();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [totalVolume, setTotalVolume] = useState(0);
  const [weeklyByMuscle, setWeeklyByMuscle] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState("ALL");
  const [chartData, setChartData] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);
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
    if (from && to && from > to) {
      setError("La fecha desde no puede ser mayor que la fecha hasta");
      return;
    }

    setError("");

    try {
      const [totalRes, weeklyRes] = await Promise.all([
        getTotalWorkoutVolumeByUserAndDateRange(userId, from, to),
        getWeeklyMuscleVolumeByUserAndDateRange(userId, from, to),
      ]);

      setTotalVolume(totalRes?.totalVolume || 0);
      setWeeklyByMuscle(weeklyRes || []);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las estadísticas");
    }
  };

  useEffect(() => {
    loadStats();
  }, [from, to]);

  useEffect(() => {
    if (!muscleOptions.includes(selectedMuscle)) {
      setSelectedMuscle("ALL");
    }
  }, [muscleOptions, selectedMuscle]);


  function getGranularity(from, to) {
    if (!from || !to) return "WEEK"; // default

    const days = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);

    if (days <= 30) return "DAY";
    if (days <= 180) return "WEEK";
    return "MONTH";
  }

  const loadChartData = async () => {
    try {
      const granularity = getGranularity(from, to);

      const res = await getVolumeByUserAndDateRange(
        userId,
        from,
        to,
        granularity
      );

      // ya viene listo del backend
      const formatted = (res || []).map((item) => ({
        date: item.date,
        volume: Number(item.volume || 0),
      }));

      setChartData(formatted);

    } catch (e) {
      console.error("Error cargando gráfica", e);
    }
  };

  const loadFrequency = async () => {
    try {
      const granularity = getGranularity(from, to);

      const res = await getWorkoutFrequency(
        userId,
        from,
        to,
        granularity
      );

      const formatted = (res || []).map((item) => ({
        date: item.date,
        count: item.count,
      }));

      setFrequencyData(formatted);

    } catch (e) {
      console.error("Error frecuencia", e);
    }
  };

  const formatXAxis = (value) => {
    const granularity = getGranularity(from, to);

    if (granularity === "DAY") return value.slice(5); // MM-DD
    if (granularity === "WEEK") return value.slice(5); // semana inicio
    if (granularity === "MONTH") return value.slice(0, 7); // YYYY-MM

    return value;
  };

  useEffect(() => {
    loadChartData();
    loadFrequency();
  }, [from, to]);

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
                id="from-date"
                name="from"
                type="date"
                label="Desde"
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                fullWidth
              />

              <TextField
                id="to-date"
                name="to"
                type="date"
                label="Hasta"
                InputLabelProps={{ shrink: true }}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                fullWidth
              />

              <Button
                variant="contained"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setSelectedMuscle("ALL");
                }}
              >
              Resetear filtros
              </Button>
            </Stack>

            <TextField
              id="muscle-select"
              name="muscle"
              select
              label="Músculo"
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              sx={{ mt: 2, maxWidth: 260 }}
            >
              {muscleOptions.map((muscle) => (
                <MenuItem key={muscle} value={muscle}>
                  {muscle === "ALL" ? "Todos" : muscleLabels[muscle] || muscle}
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
                              <MuscleChips muscles={[row.muscle]} 
                                chipSx={{
                                  fontSize: "1rem",
                                  fontWeight: 700,
                                  height: 30,
                                  px: 1.5
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



        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Evolución del volumen
            </Typography>

            {chartData.length === 0 ? (
              <Typography color="text.secondary">
                No hay datos para graficar.
              </Typography>
            ) : (
              <Box sx={{ width: "100%", height: 300}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxis} // muestra MM-DD
                    />

                    <YAxis />

                    <Tooltip
                      trigger="click"
                      content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) return null;

                        const value = payload[0].value;

                        return (
                          <Box
                            sx={{
                              bgcolor: "background.paper",
                              p: 1.5,
                              borderRadius: 2,
                              boxShadow: 3,
                            }}
                          >
                            <Typography variant="body2">
                              Fecha: {label}
                            </Typography>

                            <Typography variant="body2" fontWeight={600}>
                              {formatVolume(value)} kg
                            </Typography>
                          </Box>
                        );
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="#1976d2"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>


        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Frecuencia de entrenamiento
            </Typography>

            {frequencyData.length === 0 ? (
              <Typography color="text.secondary">
                No hay datos para mostrar.
              </Typography>
            ) : (
              <Box sx={{ width: "100%", height: 300}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxis}
                    />

                    <YAxis allowDecimals={false} domain={[0, 7]}/>

                    <Tooltip
                      trigger="click"
                      content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) return null;

                        const value = payload[0].value;

                        return (
                          <Box
                            sx={{
                              bgcolor: "background.paper",
                              p: 1.5,
                              borderRadius: 2,
                              boxShadow: 3,
                            }}
                          >
                            <Typography variant="body2">
                              Fecha: {label}
                            </Typography>

                            <Typography variant="body2" fontWeight={600}>
                              {value} {value === 1? "día" : "días"}
                            </Typography>
                          </Box>
                        );
                      }}
                    />

                    <Bar
                      dataKey="count"
                      fill="#2e7d32"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>


      </Stack>
    </Container>
  );
}
