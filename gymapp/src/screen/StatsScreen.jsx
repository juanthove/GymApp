import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";

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

import { keyframes } from "@mui/system";

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


function formatVolume(value) {
  return Number(value || 0).toFixed(0);
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
  ADDUCTORS: "Aductores",
  ABDUCTORS: "Abductores",
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
  const [volumeGranularity, setVolumeGranularity] = useState(null);
  const [frequencyGranularity, setFrequencyGranularity] = useState(null);
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

    const result = Array.from(groups.values());

    for (const group of result) {
      const total = group.subtotal; // 👈 ESTE es el total semanal

      for (const row of group.rows) {
        row.volumeRatio = total > 0
          ? (row.currentVolume / total) * 100
          : 0;
      }
    }

    return result;

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
    if (!from || !to) return null; // default

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
        granularity // podés mandar null también
      );

      // 🔥 IMPORTANTE
      setVolumeGranularity(res.granularity);

      const formatted = (res.data || []).map((item) => ({
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

      // 🔥 IMPORTANTE
      setFrequencyGranularity(res.granularity);

      const formatted = (res.data || []).map((item) => ({
        date: item.date,
        count: item.count,
      }));

      setFrequencyData(formatted);

    } catch (e) {
      console.error("Error frecuencia", e);
    }
  };

  const formatXAxis = (value, granularity) => {
    if (!granularity) return value;

    const date = new Date(value);

    if (granularity === "DAY") {
      return value.slice(5); // ej: 04-06
    }

    if (granularity === "WEEK") {
      return value.slice(5); // podés mejorar esto después
    }

    if (granularity === "MONTH") {
      const formatted = new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short"
      }).format(new Date(value)); // "abr 2026"

      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    return value;
  };

  useEffect(() => {
    loadChartData();
    loadFrequency();
  }, [from, to]);


  const glow = keyframes`
    0% {
      text-shadow:
        0 0 6px rgba(255, 80, 60, 0.25),
        0 0 10px rgba(255, 80, 60, 0.2);
    }
    100% {
      text-shadow:
        0 0 8px rgba(255, 80, 60, 0.5),
        0 0 10px rgba(255, 80, 60, 0.8);
    }
  `;



  return (

    <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden"
        }}
      >
      
        {/* 🖼️ BACKGROUND */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${backgroundImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            zIndex: 0
          }}
        />
      
        {/* 🌑 OVERLAY */}
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(44, 44, 44, 0.4)",
            backdropFilter: "blur(6px)",
            zIndex: 1
          }}
        />

    <Container maxWidth="md" sx={{ mt: 4, mb: 6, zIndex: 2, position: "relative" }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 3
          }}
        >

          {/* ⬅️ IZQUIERDA */}
          <Box sx={{ width: 48 }}>
            <BackButton to={`/workout/${userId}`} />
          </Box>

          {/* 🎯 CENTRO */}
          <Box textAlign="center">
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "1px",
                textShadow: `
                  0 0 10px rgba(255,255,255,0.3),
                  0 4px 20px rgba(0,0,0,0.6)
                `
              }}
            >
              Estadísticas
            </Typography>

            <Box
              sx={{
                mt: 1,
                mx: "auto",
                width: 80,
                height: 4,
                borderRadius: 10,
                background: "linear-gradient(90deg, #ff2020, #f16744)"
              }}
            />
          </Box>

          {/* 👉 DERECHA (espaciador) */}
          <Box sx={{ width: 48 }} />

        </Box>

        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3
          }}
        >
          <CardContent>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >

              {/* 📅 Desde */}
              <TextField
                type="date"
                label="Desde"
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                sx={{ width: 150 }}
              />

              {/* 📅 Hasta */}
              <TextField
                type="date"
                label="Hasta"
                InputLabelProps={{ shrink: true }}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                sx={{ width: 150 }}
              />

              {/* 💪 Músculo */}
              <TextField
                select
                label="Músculo"
                value={selectedMuscle}
                onChange={(e) => setSelectedMuscle(e.target.value)}
                sx={{
                  minWidth: 180,
                  maxWidth: 260,
                  flexGrow: 1
                }}
              >
                {muscleOptions.map((muscle) => (
                  <MenuItem key={muscle} value={muscle}>
                    {muscle === "ALL" ? "Todos" : muscleLabels[muscle] || muscle}
                  </MenuItem>
                ))}
              </TextField>

              {/* 🔄 Reset */}
              <Button
                //variant="contained"
                variant="outlined"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setSelectedMuscle("ALL");
                }}
                sx={{
                  height: 40,
                  whiteSpace: "nowrap"
                }}
              >
                Resetear filtros
              </Button>

            </Stack>

          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3
          }}
        >
          <CardContent>
            <Stack alignItems="center" spacing={1.5}>

              <Typography
                variant="body1"
                sx={{ opacity: 0.7, letterSpacing: 1 }}
              >
                VOLUMEN TOTAL
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #ff2020, #f16744)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: `
                    ${glow} 2.2s ease-in-out infinite alternate
                  `
                }}
              >
                {formatVolume(totalVolume)} kg
              </Typography>

              <Box
                sx={{
                  width: 40,
                  height: 4,
                  borderRadius: 10,
                  background: "linear-gradient(90deg, #42a5f5, #66bb6a)"
                }}
              />

            </Stack>
          </CardContent>
        </Card>



        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3
          }}
        >
          <CardContent>

            {/* 🔥 TÍTULO ÚNICO */}
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={800}>
                Volumen semanal por músculo
              </Typography>

              <Box
                sx={{
                  width: 60,
                  height: 4,
                  borderRadius: 10,
                  background: "linear-gradient(90deg, #ff2020, #f16744)"
                }}
              />
            </Stack>

            {filteredRows.length === 0 ? (
              <Typography color="text.secondary">
                No hay datos para ese rango.
              </Typography>
            ) : (
              <Stack spacing={2}>

                {weeklyGroups.map((group) => (
                  <Box
                    key={`${group.weekStart}-${group.weekEnd}`}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderLeft: "4px solid #ff2020"
                    }}
                  >

                    {/* 📅 HEADER SEMANA */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
                        {group.weekStart} a {group.weekEnd}
                      </Typography>

                      <Typography sx={{ fontWeight: 800, fontSize: "1.2rem" }}>
                        {formatVolume(group.subtotal)} kg
                      </Typography>
                    </Stack>

                    {/* 💪 MÚSCULOS */}
                    <Stack spacing={1.2}>
                      {group.rows.map((row, index) => (
                        <Box
                          key={`${row.weekStart}-${row.muscle}-${index}`}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            py: 0.5
                          }}
                        >

                          {/* 💪 MUSCLE */}
                          <Box sx={{ width: 140 }}> {/* 👈 mismo ancho para todos */}
                          <MuscleChips
                            muscles={[row.muscle]}
                            chipSx={{
                              fontWeight: 700,
                              fontSize: "1.2rem",
                              height: 32,
                              transform: "translateY(11px)"
                            }}
                          />
                          </Box>

                          {/* 📊 DATA */}
                          <Box sx={{ flex: 1 }}>

                            {/* 🔥 TOP ROW */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 0.5
                              }}
                            >

                              {/* 🔢 volumen */}
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: "1.4rem"
                                }}
                              >
                                {formatVolume(row.currentVolume)} kg
                              </Typography>

                              {/* ➕ delta */}
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "1.3rem",
                                  color: row.delta >= 0 ? "success.main" : "error.main"
                                }}
                              >
                                {row.delta >= 0 ? "+" : ""}
                                {formatVolume(row.delta)}
                              </Typography>
                            </Box>

                            {/* 📈 barra */}
                            <LinearProgress
                              variant="determinate"
                              value={row.volumeRatio}
                              sx={{
                                height: 10,
                                borderRadius: 10,
                                mb: 0.3
                              }}
                            />

                            {/* 📊 % */}
                            <Typography
                              sx={{
                                fontSize: "1rem",
                                textAlign: "right",
                                color:
                                  row.percent == null
                                    ? "text.secondary"
                                    : row.percent >= 0
                                    ? "success.main"
                                    : "error.main"
                              }}
                            >
                              {row.percent == null
                                ? "-"
                                : `${row.percent >= 0 ? "+" : ""}${formatVolume(row.percent)}%`}
                            </Typography>

                          </Box>
                        </Box>
                      ))}
                    </Stack>

                  </Box>
                ))}

              </Stack>
            )}

          </CardContent>
        </Card>



        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3
          }}
        >
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
                      tickFormatter={(value) => formatXAxis(value, volumeGranularity)}
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


        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3
          }}
        >
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
                      tickFormatter={(value) => formatXAxis(value, frequencyGranularity)}
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
    </Box>
  );
}
