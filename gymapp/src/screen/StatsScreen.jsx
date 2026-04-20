import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import CountUpImport from "react-countup";
const CountUp = CountUpImport?.default || CountUpImport;

import backgroundImg from "../assets/gymproIcon.png";
import { muscleLabels } from "../config/muscleConfig"

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
  ToggleButton,
  ToggleButtonGroup,
  Divider
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
  LabelList,
  Cell
} from "recharts";

import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";
import PRCard from "../components/PRCard";

import {
  getTotalWorkoutVolumeByUserAndDateRange,
  getWeeklyMuscleVolumeByUserAndDateRange,
  getVolumeByUserAndDateRange,
} from "../services/workoutSetService";

import {
  getWorkoutFrequency,
} from "../services/workoutDayService";

import {
  getPersonalRecordsByUser,
} from "../services/personalRecordService";

import {
  getExerciseIconUrl,
} from "../services/exerciseService";



function formatVolume(value) {
  return Number(value || 0).toLocaleString("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function shiftDateIso(dateIso, days) {
  const d = new Date(`${dateIso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

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
  const [frequencyMode, setFrequencyMode] = useState("AUTO");

  const [prs, setPrs] = useState([]);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("volume");
  const tabsRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({
    left: 0,
    width: 0
  });

  const computedTotalVolume = useMemo(() => {
    if (selectedMuscle === "ALL") return totalVolume;

    return weeklyByMuscle
      .filter(item => item.muscle === selectedMuscle)
      .reduce((acc, item) => acc + Number(item.volume || 0), 0);

  }, [selectedMuscle, weeklyByMuscle, totalVolume]);
  


  const enhancedRows = useMemo(() => {
    const byWeekAndMuscle = new Map(
      weeklyByMuscle.map((item) => [`${item.weekStart}|${item.muscle || "SIN_MUSCULO"}`, Number(item.volume || 0)])
    );

    const rows = weeklyByMuscle.map((item) => {
      const muscle = item.muscle || "SIN_MUSCULO";

      const currentVolume = Number(item.volume || 0);
      const historicalMax = Number(item.historicalMaxBefore || 0);

      const delta = currentVolume - historicalMax;

      const percent =
        historicalMax > 0
          ? (delta / historicalMax) * 100
          : null;

      return {
        ...item,
        muscle,
        currentVolume,
        historicalMax,
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
    const muscles = new Set(enhancedRows.map((row) => row.muscle));
    const orderedMuscles = Object.keys(muscleLabels).filter(muscle => muscles.has(muscle));
    return ["ALL", ...orderedMuscles];
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
        getTotalWorkoutVolumeByUserAndDateRange(userId, from, to, selectedMuscle === "ALL" ? null : selectedMuscle),
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
  }, [from, to, selectedMuscle]);

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
        granularity, // podés mandar null también
        selectedMuscle === "ALL" ? null : selectedMuscle
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
      let granularity = null;

      if (frequencyMode === "WEEK") granularity = "WEEK";
      if (frequencyMode === "MONTH") granularity = "MONTH";

      if (frequencyMode === "AUTO") {
        granularity = getGranularity(from, to);
      }

      const res = await getWorkoutFrequency(
        userId,
        from,
        to,
        granularity
      );

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

  function formatDay(value) {
    const d = new Date(value);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");

    return `${day}/${month}`;
  }

  function formatWeekRange(value) {
    const start = new Date(value);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const format = (d) => {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}`;
    };

    return `${format(start)}\n${format(end)}`;
  }

  

  const formatXAxis = (value, granularity) => {
    if (!granularity) return value;

    const date = new Date(value);

    if (granularity === "DAY") {
      return formatDay(value);
    }

    if (granularity === "WEEK") {
      return formatWeekRange(value);
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

  const loadPRs = async () => {
    try {
      const prsRes = await getPersonalRecordsByUser(userId);

      const formatted = prsRes.map(pr => ({
        ...pr,
        imageUrl: getExerciseIconUrl(pr.icon),
      }));

      formatted.sort((a, b) => new Date(b.date) - new Date(a.date));

      setPrs(formatted);

    } catch (e) {
      console.error("Error cargando PRs", e);
    }
  };


  useEffect(() => {
    if (activeTab === "volume") {
      loadChartData();
    }
  }, [from, to, selectedMuscle, activeTab]);

  useEffect(() => {
    if (activeTab === "pr") {
      loadPRs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "frequency") {
      loadFrequency();
    }
  }, [from, to, activeTab, frequencyMode]);


  //GRAFICA FRECUENCIA
  const getBarColor = (count) => {
    if (count === 0) return "#e0e0e0";
    if (count <= 2) return "#6de972";
    if (count <= 4) return "#48be4e";
    if (count <= 6) return "#0ebb17";
    return "#00b80c";
  };

  const totalDays = frequencyData.reduce(
    (acc, item) => acc + (item.count || 0),
    0
  );

  const shouldRotate = frequencyData.length > 6;

  const BAR_WIDTH = 100;
  const MIN_CHART_WIDTH = 800;

  const chartWidth = Math.max(
    frequencyData.length * BAR_WIDTH,
    MIN_CHART_WIDTH
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setContainerWidth(el.offsetWidth);
  }, []);

  const hasOverflow = chartWidth > containerWidth;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth;
    });
  }, [frequencyData]);




  //ANIMACIONES
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

  useEffect(() => {
    if (!tabsRef.current) return;

    const activeButton = tabsRef.current.querySelector(".Mui-selected");

    if (activeButton) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth
      });
    }
  }, [activeTab]);

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

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%"
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "fit-content",
              borderRadius: 3,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <ToggleButtonGroup
              ref={tabsRef}
              value={activeTab}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) setActiveTab(newValue);
              }}
              sx={{
                position: "relative",
                background: "rgba(0,0,0,0.35)", // 👈 más oscuro
                borderRadius: 3,
                p: 0.5,
                backdropFilter: "blur(6px)",

                //Botones
                "& .MuiToggleButton-root.MuiToggleButton-root": {
                  color: "#fff",
                  fontWeight: 700,
                  textShadow: "0 2px 6px rgba(0, 0, 0, 0.8)",
                  zIndex: 2,

                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                },

                //Botones seleccionados
                "& .Mui-selected": {
                  background: "linear-gradient(135deg, #ff0000, #fd2828)",
                  color: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 0 12px rgba(255, 80, 60, 0.8)"
                }
              }}
            >
              <ToggleButton value="volume">Volumen</ToggleButton>
              <ToggleButton value="pr">Record Personal</ToggleButton>
              <ToggleButton value="frequency">Frecuencia</ToggleButton>
            </ToggleButtonGroup>

            <Box
              sx={{
                position: "absolute",
                bottom: 6,
                height: 4,
                borderRadius: 10,
                background: "rgba(255,255,255,0.6)",

                left: `calc(${sliderStyle.left}px + 6px)`,
                width: `calc(${sliderStyle.width}px - 12px)`,

                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
          </Box>

        </Box>

        {activeTab !== "pr" && (
          <>
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
                  {activeTab === "volume" && (
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
                  )}

                  {/* 🧱 SPACER */}
                  {activeTab !== "volume" && (
                    <Box sx={{ flexGrow: 1 }} />
                  )}
                  
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
          </>
        )}

        {activeTab === "volume" && (
          <>

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
                    <CountUp
                      key={activeTab} // 👈 importante
                      end={computedTotalVolume}
                      duration={0.5}
                      separator="."
                      preserveValue
                    />{" "}
                    kg
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
                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Evolución del volumen
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
                                  {row.delta > 0 && (
                                    <Typography
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: "1.3rem",
                                        color: "success.main"
                                      }}
                                    >
                                      +{formatVolume(row.delta)}
                                    </Typography>
                                  )}
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
                                    color: row.percent > 0 ? "success.main" : "text.secondary"
                                  }}
                                >
                                  {row.percent > 0
                                    ? `+${formatVolume(row.percent)}%`
                                    : ""}
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
          </>
        )}

        {activeTab === "pr" && (
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 3
            }}
          >
            <CardContent>
              {prs.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography fontSize="2.1rem">
                    No hay récords personales todavía 💪
                  </Typography>

                  <Typography fontSize="1.5rem">
                    Registrá tus series para empezar a ver tus records.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                    },
                    rowGap: 3,
                    justifyItems: "center",
                  }}
                >
                  {prs.map((row) => (
                    <Box
                      key={row.id}
                      sx={{
                        width: "100%",
                        maxWidth: 320,
                      }}
                    >
                      <PRCard row={row} />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "frequency" && (
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 3
            }}
          >
            <CardContent>
              {/*Titulo + linea roja*/}
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={800}>
                  Frecuencia de entrenamiento
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

              {/*Botones de granularidad*/}
              <Box display="flex" justifyContent="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    p: 0.6,
                    borderRadius: 3,
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)"
                  }}
                >
                  <ToggleButtonGroup
                    value={frequencyMode}
                    exclusive
                    onChange={(e, newValue) => {
                      if (newValue !== null) setFrequencyMode(newValue);
                    }}
                    sx={{
                      "& .MuiToggleButton-root": {
                        border: "none",
                        fontWeight: 700,
                        px: 2.5,
                        color: "#333",

                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.05)"
                        }
                      },

                      "& .Mui-selected": {
                        background: "linear-gradient(135deg, #ff2020, #fd2828)",
                        color: "#fff",
                        borderRadius: 3,
                        boxShadow: "0 0 10px rgba(255, 80, 60, 0.6)"
                      }
                    }}
                  >
                    <ToggleButton value="AUTO">Auto</ToggleButton>
                    <ToggleButton value="WEEK">Semanal</ToggleButton>
                    <ToggleButton value="MONTH">Mensual</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              {frequencyData.length === 0 ? (
                <Typography color="text.secondary">
                  No hay datos para mostrar.
                </Typography>
              ) : (
                <Box ref={containerRef} sx={{ width: "100%", overflowX: "auto" }}>
                  <Box
                    sx={{
                      width: chartWidth,
                      ml: hasOverflow ? 0 : "auto",
                      mr: hasOverflow ? 0 : "auto"
                    }}
                  >
                    <BarChart
                      width={chartWidth}
                      height={300}
                      data={frequencyData}
                      margin={{top: 30, right: 20, left: 20, bottom: 25 }}
                    >
                      <XAxis
                        dataKey="date"
                        interval={0}
                        tick={({ x, y, payload }) => {
                          const formatted = formatXAxis(payload.value, frequencyGranularity);
                          const lines = formatted.split("\n");

                          return (
                            <text
                              x={x}
                              y={y}
                              textAnchor="middle"
                              fill="#000"
                              fontSize={20}
                              fontWeight={600}
                            >
                              {lines.map((line, index) => (
                                <tspan
                                  key={index}
                                  x={x}
                                  dy={index === 0 ? 15 : 22}
                                >
                                  {line}
                                </tspan>
                              ))}
                            </text>
                          );
                        }}
                      />

                      <Bar 
                        key={frequencyData.length}
                        dataKey="count" 
                        radius={[8, 8, 0, 0]} 
                        barSize={200}
                        animationDuration={600}
                        animationEasing="ease-out"
                        animationBegin={0}
                      >
                        <LabelList
                          dataKey="count"
                          position="top"
                          animationDuration={600}
                          animationEasing="ease-out"
                          animationBegin={0}
                          content={({ x, y, width, value }) => {
                            if (!value) return null;

                            const centerX = x + width / 2;

                            return (
                              <text
                                x={centerX}
                                y={y - 10}
                                textAnchor="middle"
                                fill="#000"
                                fontSize="25"
                                fontWeight="900"
                              >
                                {value}
                              </text>
                            );
                          }}
                        />

                        {frequencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </Box>
                </Box>

                
              )}
              <Divider sx={{ my: 1, opacity: 0.8, borderBottomWidth: 3, bgcolor: "#0000003b"}} />

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="h3" fontWeight={900}>
                  {totalDays}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "1.3rem",
                    opacity: 0.7,
                    letterSpacing: 1
                  }}
                >
                  días entrenados
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}


      </Stack>
    </Container>
    </Box>
  );
}
