import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import useRequireAuth from "../hooks/useRequireAuth";
import { useDarkMode } from "../context/DarkModeContext";

import CountUpImport from "react-countup";
const CountUp = CountUpImport?.default || CountUpImport;

import backgroundImg from "../assets/gymproIcon.png";
import { muscleLabels } from "../config/muscleConfig";

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
  Divider,
  Skeleton,
  Pagination,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";

import { keyframes } from "@mui/system";

import dayjs from "dayjs";
import { DateCalendar, PickerDay } from "@mui/x-date-pickers";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SortIcon from "@mui/icons-material/Sort";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ClearIcon from "@mui/icons-material/Clear";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";

import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";
import PRMiniCard from "../components/PRMiniCard";
import PRCard from "../components/PRCard";
import CustomLineTooltip from "../components/CustomLineTooltip";
import ScrollToTopButton from "../components/ScrollToTopButton";

import { MAIN_RED, RED_GRADIENT } from "../utils/colorUtils";

import {
  getTotalWorkoutVolumeByUserAndDateRange,
  getWeeklyMuscleVolumeByUserAndDateRange,
  getVolumeByUserAndDateRange,
} from "../services/workoutSetService";

import { getWorkoutFrequency, getTrainingSummary } from "../services/workoutDayService";

import { getPersonalRecordsByUser } from "../services/personalRecordService";

import { getExerciseIconUrl } from "../services/exerciseService";

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
  useRequireAuth();
  const { userId } = useParams();
  const { darkMode } = useDarkMode();
  const [loadingVolume, setLoadingVolume] = useState(false);
  const [loadingPR, setLoadingPR] = useState(false);
  const [loadingFrequency, setLoadingFrequency] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [totalVolume, setTotalVolume] = useState(0);
  const [weeklyByMuscle, setWeeklyByMuscle] = useState([]);
  const [weeklyPage, setWeeklyPage] = useState(0);
  const [weeklyTotalPages, setWeeklyTotalPages] = useState(0);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  const [selectedMuscle, setSelectedMuscle] = useState("ALL");
  const [chartData, setChartData] = useState([]);

  const WEEKLY_PAGE_SIZE = 3;

  const [frequencyData, setFrequencyData] = useState([]);
  const [volumeGranularity, setVolumeGranularity] = useState(null);
  const [frequencyGranularity, setFrequencyGranularity] = useState(null);
  const [frequencyMode, setFrequencyMode] = useState("WEEK");
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [calendarData, setCalendarData] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  const [currentStreak, setCurrentStreak] = useState(0);

  const [prs, setPrs] = useState([]);
  const [prSearch, setPrSearch] = useState("");
  const [prMuscle, setPrMuscle] = useState("ALL");
  const [prSortOrder, setPrSortOrder] = useState("DESC");
  const [selectedPR, setSelectedPR] = useState(null);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("volume");
  const tabsRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({
    left: 0,
    width: 0,
  });

  const computedTotalVolume = totalVolume;

  const muscleOptions = useMemo(() => ["ALL", ...Object.keys(muscleLabels)], []);

  const weeklyGroups = useMemo(() => {
    return weeklyByMuscle
      .map((week) => {
        const rows = week.muscles
          .filter((item) => selectedMuscle === "ALL" || item.muscle === selectedMuscle)
          .map((item) => {
            const currentVolume = Number(item.volume || 0);
            const historicalMax = Number(item.historicalMaxBefore || 0);

            const delta = currentVolume - historicalMax;
            const percent = historicalMax > 0 ? (delta / historicalMax) * 100 : null;

            return {
              ...item,
              weekStart: week.weekStart,
              weekEnd: week.weekEnd,
              currentVolume,
              historicalMax,
              delta,
              percent,
            };
          });

        const subtotal =
          selectedMuscle === "ALL"
            ? Number(week.totalVolume || 0)
            : rows.reduce((acc, row) => acc + row.currentVolume, 0);

        return {
          weekStart: week.weekStart,
          weekEnd: week.weekEnd,
          subtotal,
          rows: rows.map((row) => ({
            ...row,
            volumeRatio: subtotal > 0 ? (row.currentVolume / subtotal) * 100 : 0,
          })),
        };
      })
      .filter((week) => week.rows.length > 0);
  }, [weeklyByMuscle, selectedMuscle]);

  const loadTotalVolume = async () => {
    try {
      const totalRes = await getTotalWorkoutVolumeByUserAndDateRange(
        userId,
        from,
        to,
        selectedMuscle === "ALL" ? null : selectedMuscle,
      );

      setTotalVolume(totalRes?.totalVolume || 0);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el volumen total");
    }
  };

  const loadWeeklyStats = async () => {
    try {
      setLoadingWeekly(true);

      const weeklyRes = await getWeeklyMuscleVolumeByUserAndDateRange(
        userId,
        from,
        to,
        weeklyPage,
        WEEKLY_PAGE_SIZE,
        selectedMuscle === "ALL" ? null : selectedMuscle,
      );

      setWeeklyByMuscle(weeklyRes?.content || []);
      setWeeklyTotalPages(weeklyRes?.totalPages || 0);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las estadísticas semanales");
    } finally {
      setLoadingWeekly(false);
    }
  };

  useEffect(() => {
    if (from && to && from > to) {
      setError("La fecha desde no puede ser mayor que la fecha hasta");
      return;
    }

    setError("");
    loadTotalVolume();
  }, [from, to, selectedMuscle]);

  useEffect(() => {
    if (from && to && from > to) return;

    loadWeeklyStats();
  }, [from, to, weeklyPage, selectedMuscle]);

  useEffect(() => {
    if (!muscleOptions.includes(selectedMuscle)) {
      setSelectedMuscle("ALL");
    }
  }, [muscleOptions, selectedMuscle]);

  function getGranularity(from, to) {
    if (!from || !to) return null;

    const days = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);

    if (days <= 30) return "DAY";
    if (days <= 180) return "WEEK";
    return "MONTH";
  }

  const loadChartData = async () => {
    try {
      setLoadingVolume(true);
      const granularity = getGranularity(from, to);

      const res = await getVolumeByUserAndDateRange(
        userId,
        from,
        to,
        granularity,
        selectedMuscle === "ALL" ? null : selectedMuscle,
      );

      setVolumeGranularity(res.granularity);

      const formatted = (res.data || []).map((item) => ({
        date: dayjs(item.date).valueOf(),
        volume: Number(item.volume || 0),
      }));

      setChartData(formatted);
    } catch (e) {
      console.error("Error cargando gráfica", e);
    } finally {
      setLoadingVolume(false);
    }
  };

  const loadFrequency = async () => {
    try {
      setLoadingFrequency(true);
      const res = await getWorkoutFrequency(userId, from, to, frequencyMode);

      setFrequencyGranularity(res.granularity);

      const formatted = (res.data || []).map((item) => ({
        date: dayjs(item.date).valueOf(),
        originalDate: item.date,
        count: item.count,
      }));

      setFrequencyData(formatted);
    } catch (e) {
      console.error("Error frecuencia", e);
    } finally {
      setLoadingFrequency(false);
    }
  };

  function formatDay(value) {
    const d = dayjs(value);

    const day = String(d.date()).padStart(2, "0");
    const month = String(d.month() + 1).padStart(2, "0");

    return `${day}/${month}`;
  }

  function formatWeekRange(value) {
    const start = dayjs(value);
    const end = start.add(6, "day");

    const format = (d) => {
      const day = String(d.date()).padStart(2, "0");
      const month = String(d.month() + 1).padStart(2, "0");
      return `${day}/${month}`;
    };

    return `${format(start)}\n${format(end)}`;
  }

  const formatXAxis = (value, granularity) => {
    if (!granularity) return value;

    const date = dayjs(value);

    if (granularity === "DAY") {
      return formatDay(value);
    }

    if (granularity === "WEEK") {
      return formatWeekRange(value);
    }

    if (granularity === "MONTH") {
      const formatted = new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short",
      }).format(new Date(value)); //abr 2026

      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    return value;
  };

  const loadPRs = async () => {
    try {
      setLoadingPR(true);
      const prsRes = await getPersonalRecordsByUser(userId);

      const formatted = prsRes.map((pr) => ({
        ...pr,
        imageUrl: getExerciseIconUrl(pr.icon),
      }));

      setPrs(formatted);
    } catch (e) {
      console.error("Error cargando PRs", e);
    } finally {
      setLoadingPR(false);
    }
  };

  const filteredPRs = useMemo(() => {
    return prs
      .filter((pr) => {
        const matchesName = pr.name?.toLowerCase().includes(prSearch.trim().toLowerCase());

        const matchesMuscle = prMuscle === "ALL" || pr.muscle === prMuscle;

        return matchesName && matchesMuscle;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        return prSortOrder === "DESC" ? dateB - dateA : dateA - dateB;
      });
  }, [prs, prSearch, prMuscle, prSortOrder]);

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

  //GRAFICA VOLUMEN
  const VOLUME_POINT_WIDTH = 90;

  const minWidth = window.innerWidth < 900 ? 500 : 820;

  const volumeChartWidth = Math.max(chartData.length * VOLUME_POINT_WIDTH + 80, containerWidth || minWidth);

  //Mover grafica de volumen hacia la derecha
  useEffect(() => {
    const el = containerRef.current;
    if (!el || activeTab !== "volume") return;

    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth;
    });
  }, [chartData, volumeChartWidth, activeTab]);

  //Custom tooltip
  const tooltipTimeoutRef = useRef(null);
  const [clickedPoint, setClickedPoint] = useState(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  //GRAFICA FRECUENCIA
  const getBarColor = (count) => {
    if (count === 0) return "#e0e0e0";
    if (count <= 2) return "#6de972";
    if (count <= 4) return "#48be4e";
    if (count <= 6) return "#0ebb17";
    return "#00b80c";
  };

  const totalDays = frequencyData.reduce((acc, item) => acc + (item.count || 0), 0);

  const shouldRotate = frequencyData.length > 6;

  const isSmallScreen = containerWidth <= 900;

  const BAR_WIDTH = 100;
  const MIN_CHART_WIDTH = isSmallScreen ? 500 : 800;

  const chartWidth = Math.max(frequencyData.length * BAR_WIDTH, MIN_CHART_WIDTH);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setContainerWidth(el.offsetWidth);
  }, []);

  const hasOverflow = chartWidth > containerWidth;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || activeTab !== "frequency") return;

    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth;
    });
  }, [frequencyData, activeTab]);

  useEffect(() => {
    setShouldAnimate(true);

    const timeout = setTimeout(() => {
      setShouldAnimate(false);
    }, 700);

    return () => clearTimeout(timeout);
  }, [frequencyData, frequencyMode, from, to]);

  //CALENDARIO FRECUENCIA DIARIA
  const trainedDaysSet = useMemo(() => {
    if (frequencyGranularity !== "DAY") return new Set();

    return new Set(frequencyData.filter((d) => d.count > 0).map((d) => dayjs(d.date).format("YYYY-MM-DD")));
  }, [frequencyData, frequencyGranularity]);

  const loadCalendarData = async () => {
    try {
      const res = await getTrainingSummary(userId);

      setCalendarData(res.trainedDays || []);
      setCurrentStreak(res.currentStreak || 0);
    } catch (e) {
      console.error("Error calendario", e);
    }
  };

  const trainedDaysMap = useMemo(() => {
    return new Map(calendarData.map((d) => [dayjs(d.date).format("YYYY-MM-DD"), d.count]));
  }, [calendarData]);

  useEffect(() => {
    if (activeTab === "frequency") {
      loadCalendarData();
    }
  }, [activeTab]);

  function CustomDay(props) {
    const { day, outsideCurrentMonth, ...other } = props;

    const dateStr = day.format("YYYY-MM-DD");
    const count = trainedDaysMap.get(dateStr) || 0;

    return (
      <PickerDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{
          width: { xs: 40, sm: 48, md: 64 },
          height: { xs: 40, sm: 48, md: 64 },

          borderRadius: "50%",
          fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
          fontWeight: 700,

          transform: "scale(0.9)",

          bgcolor: getBarColor(count),
          color: count > 0 ? "#fff" : "inherit",

          opacity: "1 !important",
          visibility: "visible",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          "&:hover": {
            backgroundColor: `${getBarColor(count)} !important`,
          },

          "&:active": {
            backgroundColor: `${getBarColor(count)} !important`,
          },

          "&.Mui-selected": {
            backgroundColor: `${getBarColor(count)} !important`,
            color: `${count > 0 ? "#fff" : "inherit"} !important`,
          },

          "&.Mui-focusVisible": {
            backgroundColor: `${getBarColor(count)} !important`,
          },

          "&:focus": {
            outline: "none",
            backgroundColor: `${getBarColor(count)} !important`,
          },
        }}
      />
    );
  }

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
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* 🖼️ BACKGROUND */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      />

      {/* 🌑 OVERLAY */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: darkMode ? "rgba(15, 23, 42, 0.78)" : "rgba(44, 44, 44, 0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 1,
        }}
      />

      <Container maxWidth="md" sx={{ mt: 4, mb: 6, zIndex: 2, position: "relative" }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 3,
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
                `,
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
                  background: RED_GRADIENT,
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
              width: "100%",
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
                  background: "rgba(0,0,0,0.35)",
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
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  },

                  // Botones seleccionados
                  "& .MuiToggleButton-root.Mui-selected": {
                    background: "linear-gradient(135deg, #ff1744 0%, #e60013 55%, #ff3030 100%) !important",
                    color: "#fff",
                    borderRadius: 3,
                    boxShadow: `
                      0 0 12px rgba(255, 0, 40, 0.65),
                      0 0 24px rgba(255, 0, 40, 0.35),
                      0 3px 8px rgba(180, 0, 20, 0.3)
                    `,
                    "&:hover": {
                      background: "linear-gradient(135deg, #ff3030, #ed0028) !important",
                      boxShadow: "0 0 18px rgba(255, 0, 40, 0.8)",
                    },
                  },
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

                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
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
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      alignItems: "flex-end",
                    }}
                  >
                    {/* 📅 Desde */}
                    <TextField
                      type="date"
                      label="Desde"
                      InputLabelProps={{ shrink: true }}
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setWeeklyPage(0);
                      }}
                      sx={{ width: 150 }}
                    />

                    {/* 📅 Hasta */}
                    <TextField
                      type="date"
                      label="Hasta"
                      InputLabelProps={{ shrink: true }}
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setWeeklyPage(0);
                      }}
                      sx={{ width: 150 }}
                    />

                    {/* 💪 Músculo */}
                    {activeTab === "volume" && (
                      <TextField
                        select
                        label="Músculo"
                        value={selectedMuscle}
                        onChange={(e) => {
                          setSelectedMuscle(e.target.value);
                          setWeeklyPage(0);
                        }}
                        sx={{
                          minWidth: 180,
                          maxWidth: 260,
                          flexGrow: 1,
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
                      <Box
                        sx={{
                          flexGrow: 1,
                          display: {
                            xs: "none",
                            sm: "block",
                          },
                        }}
                      />
                    )}

                    {/* 🔄 Reset */}
                    <Box
                      sx={{
                        ml: "auto",
                        display: "flex",
                        alignSelf: "flex-end",
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setFrom("");
                          setTo("");
                          setSelectedMuscle("ALL");
                          setWeeklyPage(0);
                        }}
                        sx={{
                          height: 40,
                          whiteSpace: "nowrap",
                          mb: { md: 1 },
                        }}
                      >
                        Resetear filtros
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {error && <Alert severity="error">{error}</Alert>}
            </>
          )}

          {activeTab === "volume" && (
            <>
              <Card
                sx={{
                  background: darkMode ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(6px)",
                  border: darkMode ? "1px solid rgba(148,163,184,0.22)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  color: darkMode ? "#f8fafc" : "#111827",
                }}
              >
                <CardContent>
                  <Stack alignItems="center" spacing={1.5}>
                    <Typography variant="body1" sx={{ opacity: 0.7, letterSpacing: 1 }}>
                      VOLUMEN TOTAL
                    </Typography>

                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        background: RED_GRADIENT,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animation: `
                        ${glow} 2.2s ease-in-out infinite alternate
                      `,
                      }}
                    >
                      <CountUp key={activeTab} end={computedTotalVolume} duration={0.5} separator="." preserveValue />{" "}
                      kg
                    </Typography>

                    <Box
                      sx={{
                        width: 40,
                        height: 4,
                        borderRadius: 10,
                        background: "linear-gradient(90deg, #42a5f5, #66bb6a)",
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: darkMode ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(6px)",
                  border: darkMode ? "1px solid rgba(148,163,184,0.22)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  overflow: "visible",
                  color: darkMode ? "#f8fafc" : "#111827",
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
                        background: RED_GRADIENT,
                      }}
                    />
                  </Stack>

                  {loadingVolume ? (
                    <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
                  ) : chartData.length === 0 ? (
                    <Typography color="text.secondary">No hay datos para graficar.</Typography>
                  ) : (
                    <Box
                      sx={{
                        position: "relative",
                        "& *:focus": {
                          outline: "none",
                        },
                        "& *:focus-visible": {
                          outline: "none",
                        },
                      }}
                    >
                      <Box
                        ref={containerRef}
                        sx={{
                          width: "100%",
                          overflowX: "auto",
                          overflowY: "hidden",
                        }}
                      >
                        <Box sx={{ width: volumeChartWidth }}>
                          <LineChart
                            width={volumeChartWidth}
                            height={300}
                            data={chartData}
                            margin={{
                              top: 10,
                              right: 45,
                              left: 0,
                              bottom: 30,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                              dataKey="date"
                              interval={0}
                              scale="point"
                              tick={({ x, y, payload }) => {
                                const formatted = formatXAxis(payload.value, volumeGranularity);
                                const lines = formatted.split("\n");

                                return (
                                  <text x={x} y={y} textAnchor="middle" fill="#000" fontSize={20} fontWeight={600}>
                                    {lines.map((line, index) => (
                                      <tspan key={index} x={x} dy={index === 0 ? 22 : 22}>
                                        {line}
                                      </tspan>
                                    ))}
                                  </text>
                                );
                              }}
                            />

                            <YAxis />

                            <Line
                              type="monotone"
                              dataKey="volume"
                              stroke={MAIN_RED}
                              strokeWidth={5}
                              activeDot={false}
                              dot={(props) => {
                                const { cx, cy, payload, index } = props;

                                const isActive = clickedPoint?.index === index;

                                return (
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isActive ? 10 : 7}
                                    fill={MAIN_RED}
                                    stroke="#fff"
                                    strokeWidth={2}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setClickedPoint({
                                        payload,
                                        cx,
                                        cy,
                                        index,
                                      });

                                      if (tooltipTimeoutRef.current) {
                                        clearTimeout(tooltipTimeoutRef.current);
                                      }

                                      tooltipTimeoutRef.current = setTimeout(() => {
                                        setClickedPoint(null);
                                      }, 3000);
                                    }}
                                  />
                                );
                              }}
                            />
                          </LineChart>
                        </Box>
                        {clickedPoint && (
                          <Box
                            sx={{
                              position: "absolute",
                              left: clickedPoint.cx - (containerRef.current?.scrollLeft || 0),
                              top: clickedPoint.cy - 10,
                              transform: "translate(-50%, -100%)",
                              zIndex: 9999,
                              pointerEvents: "none",
                            }}
                          >
                            <CustomLineTooltip
                              active
                              label={clickedPoint.payload.date}
                              payload={[
                                {
                                  value: clickedPoint.payload.volume,
                                  dataKey: "volume",
                                },
                              ]}
                              granularity={volumeGranularity}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
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
                        background: RED_GRADIENT,
                      }}
                    />
                  </Stack>

                  {loadingWeekly ? (
                    <Stack spacing={2}>
                      {[1, 2, 3].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Skeleton width="40%" height={30} />
                          <Skeleton width="30%" height={25} />

                          <Stack spacing={1} mt={2}>
                            <Skeleton height={20} />
                            <Skeleton height={20} />
                            <Skeleton height={20} />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : weeklyGroups.length === 0 ? (
                    <Typography color="text.secondary">No hay datos para ese rango.</Typography>
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
                            borderLeft: `4px solid ${MAIN_RED}`,
                          }}
                        >
                          {/* 📅 HEADER SEMANA */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
                              {dayjs(group.weekStart).format("DD/MM/YYYY")} -{" "}
                              {dayjs(group.weekEnd).format("DD/MM/YYYY")}
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
                                  py: 0.5,
                                }}
                              >
                                {/* 💪 MUSCLE */}
                                <Box sx={{ width: 140 }}>
                                  {" "}
                                  {/* 👈 mismo ancho para todos */}
                                  <MuscleChips
                                    muscles={[row.muscle]}
                                    chipSx={{
                                      fontWeight: 700,
                                      fontSize: "1.2rem",
                                      height: 32,
                                      transform: "translateY(11px)",
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
                                      mb: 0.5,
                                    }}
                                  >
                                    {/* 🔢 volumen */}
                                    <Typography
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: "1.4rem",
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
                                          color: "success.main",
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
                                      mb: 0.3,
                                      "& .MuiLinearProgress-bar": {
                                        backgroundColor: MAIN_RED,
                                      },

                                      backgroundColor: "rgba(255,32,32,0.15)",
                                    }}
                                  />

                                  {/* 📊 % */}
                                  <Typography
                                    sx={{
                                      fontSize: "1rem",
                                      textAlign: "right",
                                      color: row.percent > 0 ? "success.main" : "text.secondary",
                                    }}
                                  >
                                    {row.percent > 0 ? `+${formatVolume(row.percent)}%` : ""}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                  {weeklyTotalPages > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 3,
                      }}
                    >
                      <Pagination
                        count={weeklyTotalPages}
                        page={weeklyPage + 1}
                        onChange={(event, value) => setWeeklyPage(value - 1)}
                        color="primary"
                        shape="rounded"
                        siblingCount={2}
                        boundaryCount={1}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: darkMode ? "#fff" : "#333",
                            fontWeight: 700,
                          },
                          "& .Mui-selected": {
                            background: `${MAIN_RED} !important`,
                            color: "#fff",
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "pr" && (
            <Card
              sx={{
                background: darkMode ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(6px)",
                border: darkMode ? "1px solid rgba(148,163,184,0.22)" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                color: darkMode ? "#f8fafc" : "#111827",
              }}
            >
              <CardContent>
                {loadingPR ? (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                      },
                      gap: 3,
                    }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <Box key={i}>
                        <Skeleton variant="rounded" height={120} />
                        <Skeleton width="70%" height={30} sx={{ mt: 1 }} />
                        <Skeleton width="50%" height={25} />
                      </Box>
                    ))}
                  </Box>
                ) : prs.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography fontSize="2.1rem">No hay récords personales todavía 💪</Typography>
                    <Typography fontSize="1.5rem">Registrá tus series para empezar a ver tus récords.</Typography>
                  </Box>
                ) : (
                  <>
                    {/* FILTROS */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                      {/* BUSCAR */}
                      <TextField
                        fullWidth
                        label="Buscar ejercicio"
                        placeholder="Ej. Press banca"
                        value={prSearch}
                        onChange={(e) => setPrSearch(e.target.value)}
                        size="small"
                        InputProps={{
                          endAdornment: prSearch && (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setPrSearch("")} edge="end">
                                <ClearIcon sx={{ fontSize: 27 }} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: darkMode ? "#17263d" : "#fff",
                            color: darkMode ? "#fff" : "inherit",
                            "& fieldset": {
                              borderColor: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                            },
                            "&:hover fieldset": {
                              borderColor: "#f16744",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#f16744",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: darkMode ? "#aaa" : "text.secondary",
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#f16744",
                          },
                        }}
                      />

                      {/* MÚSCULO */}
                      <TextField
                        select
                        label="Músculo"
                        value={prMuscle}
                        onChange={(e) => setPrMuscle(e.target.value)}
                        size="small"
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: darkMode ? "#17263d" : "#fff",
                            color: darkMode ? "#fff" : "inherit",
                            "& fieldset": {
                              borderColor: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                            },
                            "&:hover fieldset": {
                              borderColor: "#f16744",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#f16744",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: darkMode ? "#aaa" : "text.secondary",
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#f16744",
                          },
                        }}
                      >
                        {muscleOptions.map((muscle) => (
                          <MenuItem key={muscle} value={muscle}>
                            {muscle === "ALL" ? "Todos" : muscleLabels[muscle] || muscle}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* ORDENAR */}
                      <Button
                        variant="contained"
                        onClick={() => setPrSortOrder((prev) => (prev === "DESC" ? "ASC" : "DESC"))}
                        startIcon={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
                            {prSortOrder === "DESC" ? (
                              <ArrowUpwardIcon sx={{ fontSize: 20 }} />
                            ) : (
                              <ArrowDownwardIcon sx={{ fontSize: 20 }} />
                            )}
                            <SortIcon />
                          </Box>
                        }
                        sx={{
                          minWidth: 140,
                          height: 40,
                          borderRadius: 2,
                          fontSize: "1rem",
                          whiteSpace: "nowrap",
                          background: "linear-gradient(135deg, #ff2020, #f16744)",
                          color: "#fff",
                          "&:hover": {
                            background: "linear-gradient(135deg, #e51b1b, #d95738)",
                          },
                        }}
                      >
                        {prSortOrder === "DESC" ? "Recientes" : "Antiguos"}
                      </Button>
                    </Stack>

                    {/* RESULTADOS */}
                    {filteredPRs.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography fontSize="1.3rem" fontWeight={700}>
                          No se encontraron récords
                        </Typography>
                        <Typography color="text.secondary">Probá cambiando los filtros de búsqueda.</Typography>
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
                        {filteredPRs.map((row) => (
                          <Box
                            key={row.id}
                            onClick={() => setSelectedPR(row)}
                            sx={{
                              width: {
                                xs: "90%",
                                md: "100%",
                              },
                              maxWidth: 320,
                              cursor: "pointer",
                            }}
                          >
                            <PRMiniCard row={row} />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "frequency" && (
            <>
              <Card
                sx={{
                  background: darkMode ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(6px)",
                  border: darkMode ? "1px solid rgba(148,163,184,0.22)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  color: darkMode ? "#f8fafc" : "#111827",
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
                        background: RED_GRADIENT,
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
                        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
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
                              backgroundColor: "rgba(0,0,0,0.05)",
                            },
                          },

                          "& .Mui-selected": {
                            background: "linear-gradient(135deg, #ff2020, #fd2828)",
                            color: "#fff",
                            borderRadius: 3,
                            boxShadow: "0 0 10px rgba(255, 80, 60, 0.6)",
                          },
                        }}
                      >
                        <ToggleButton value="WEEK">Semanal</ToggleButton>
                        <ToggleButton value="MONTH">Mensual</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Box>

                  {loadingFrequency ? (
                    <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
                  ) : frequencyData.length === 0 ? (
                    <Typography color="text.secondary">No hay datos para mostrar.</Typography>
                  ) : (
                    <Box ref={containerRef} sx={{ width: "100%", overflowX: "auto" }}>
                      <Box
                        sx={{
                          width: chartWidth,
                          ml: hasOverflow ? 0 : "auto",
                          mr: hasOverflow ? 0 : "auto",
                        }}
                      >
                        <BarChart
                          width={chartWidth}
                          height={300}
                          data={frequencyData}
                          margin={{ top: 30, right: 20, left: 20, bottom: 25 }}
                        >
                          <XAxis
                            dataKey="date"
                            interval={0}
                            domain={["dataMin", "dataMax"]}
                            tickFormatter={(value) =>
                              formatXAxis(dayjs(value).format("YYYY-MM-DD"), frequencyGranularity)
                            }
                            tick={({ x, y, payload }) => {
                              const formatted = formatXAxis(payload.value, frequencyGranularity);
                              const lines = formatted.split("\n");

                              return (
                                <text x={x} y={y} textAnchor="middle" fill="#000" fontSize={20} fontWeight={600}>
                                  {lines.map((line, index) => (
                                    <tspan key={index} x={x} dy={index === 0 ? 15 : 22}>
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
                            barSize={isSmallScreen ? 150 : 200}
                            animationDuration={600}
                            animationEasing="ease-out"
                            animationBegin={0}
                            isAnimationActive={shouldAnimate}
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

                  <Divider sx={{ my: 1, opacity: 0.8, borderBottomWidth: 3, bgcolor: "#0000003b" }} />

                  {loadingFrequency ? (
                    <Stack alignItems="center">
                      <Skeleton width={100} height={60} />
                      <Skeleton width={150} height={30} />
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", mt: 3 }}>
                      <Typography variant="h3" fontWeight={900}>
                        {totalDays}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "1.3rem",
                          opacity: 0.7,
                          letterSpacing: 1,
                        }}
                      >
                        entrenamientos
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: darkMode ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(6px)",
                  border: darkMode ? "1px solid rgba(148,163,184,0.22)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  color: darkMode ? "#f8fafc" : "#111827",
                }}
              >
                <CardContent>
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={800}>
                      Días sin faltar
                    </Typography>

                    <Box
                      sx={{
                        width: 60,
                        height: 4,
                        borderRadius: 10,
                        background: RED_GRADIENT,
                      }}
                    />
                  </Stack>

                  <Box
                    sx={{
                      py: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h1" fontWeight={900}>
                      {currentStreak}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "1.3rem",
                        opacity: 0.75,
                        letterSpacing: 1,
                      }}
                    >
                      días consecutivos
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: darkMode ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(6px)",
                  border: darkMode ? "1px solid rgba(148,163,184,0.22)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  color: darkMode ? "#f8fafc" : "#111827",
                }}
              >
                <CardContent sx={{ height: { xs: 520, md: 620 } }}>
                  {/*Titulo + linea roja*/}
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={800}>
                      Calendario histórico completo
                    </Typography>

                    <Box
                      sx={{
                        width: 60,
                        height: 4,
                        borderRadius: 10,
                        background: RED_GRADIENT,
                      }}
                    />
                  </Stack>
                  {loadingFrequency ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 1,
                        width: 400,
                        height: 400,
                        mt: 13,
                        mx: "auto",
                      }}
                    >
                      {Array.from({ length: 35 }).map((_, i) => (
                        <Skeleton key={i} variant="circular" width={35} height={35} />
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        position: "relative",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {/* ⬅️ IZQUIERDA */}
                      <Box
                        onClick={() => setCalendarMonth((prev) => prev.subtract(1, "month"))}
                        sx={{
                          position: "absolute",
                          left: 15,
                          top: "40%",
                          transform: "translateY(-50%)",

                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",

                          width: 60,
                          height: 60,
                          borderRadius: "50%",

                          cursor: "pointer",
                          color: "#fff",

                          transition: "all 0.2s ease",
                        }}
                      >
                        <ArrowBackIosNewIcon
                          sx={{
                            fontSize: {
                              xs: 70,
                              md: 90,
                            },
                            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))",
                          }}
                        />
                      </Box>

                      {/* 📅 CALENDARIO */}
                      <DateCalendar
                        value={calendarMonth}
                        onMonthChange={(newMonth) => setCalendarMonth(newMonth)}
                        referenceDate={calendarMonth}
                        views={["year", "month", "day"]}
                        openTo="day"
                        onChange={(newValue) => {
                          if (newValue) {
                            setCalendarMonth(newValue);
                          }
                        }}
                        slots={{ day: CustomDay }}
                        disableHighlightToday
                        sx={{
                          width: "fit-content",
                          height: "auto", //Permite que el componente crezca
                          maxHeight: 500, //Elimina la restricción de altura

                          "& .MuiDayCalendar-monthContainer": {
                            position: "relative", //Evita cortes raros en animaciones
                          },

                          //Grid fijo de 7 columnas
                          "& .MuiDayCalendar-weekContainer": {
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "repeat(7, 40px)",
                              sm: "repeat(7, 48px)",
                              md: "repeat(7, 64px)",
                            },
                            justifyContent: "center",
                            margin: "2px 0",
                            overflow: "visible !important",
                          },
                          "& .MuiPickersSlideTransition-root": {
                            overflow: "visible !important",
                          },
                          "& .MuiPickersCalendarHeader-label": {
                            fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.8rem" },
                            fontWeight: 700,
                          },

                          "& .MuiPickersArrowSwitcher-button": {
                            transform: { xs: "scale(1)", sm: "scale(1.2)", md: "scale(1.3)" },
                            display: "none",
                          },

                          "& .MuiDayCalendar-root": {
                            width: "auto",
                          },

                          "& .MuiDayCalendar-weekDayLabel": {
                            width: { xs: 40, sm: 44, md: 60 },
                            textAlign: "center",
                            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                            fontWeight: 700,
                          },

                          //Evitar efectos al cliquear
                          "& .MuiPickersDay-root": {
                            pointerEvents: "none", //Bloquea clics, hovers y selección
                            userSelect: "none", //Evita que se seleccione el texto del número
                            backgroundColor: "transparent !important", //Evita el fondo azul
                          },

                          "& .Mui-selected": {
                            backgroundColor: "transparent !important",
                            color: "inherit !important",
                            fontWeight: "inherit !important",
                          },

                          "& .MuiPickersDay-root:focus": {
                            outline: "none",
                            backgroundColor: "transparent !important",
                          },

                          "& .MuiDayCalendar-slideTransition": {
                            overflow: "visible !important",
                          },

                          "& .MuiDayCalendar-monthContainer": {
                            overflow: "visible !important",
                          },
                        }}
                      />

                      {/* ➡️ DERECHA */}
                      <Box
                        onClick={() => setCalendarMonth((prev) => prev.add(1, "month"))}
                        sx={{
                          position: "absolute",
                          right: 15,
                          top: "40%",
                          transform: "translateY(-50%)",

                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",

                          width: 60,
                          height: 60,
                          borderRadius: "50%",

                          cursor: "pointer",
                          color: "#fff",

                          transition: "all 0.2s ease",
                        }}
                      >
                        <ArrowForwardIosIcon
                          sx={{
                            fontSize: {
                              xs: 70,
                              md: 90,
                            },
                            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))",
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Stack>
        <Dialog
          open={Boolean(selectedPR)}
          onClose={() => setSelectedPR(null)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              background: "transparent",
              boxShadow: "none",
              overflow: "visible",
              m: 2,
            },
          }}
        >
          <DialogContent sx={{ p: 0, overflow: "visible" }}>{selectedPR && <PRCard row={selectedPR} />}</DialogContent>
        </Dialog>
        <ScrollToTopButton bottom={20} right={10} />
      </Container>
    </Box>
  );
}
