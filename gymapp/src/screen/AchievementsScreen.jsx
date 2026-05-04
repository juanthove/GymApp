import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";

import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Skeleton
} from "@mui/material";

import BackButton from "../components/BackButton";
import AchievementCard from "../components/AchievementCard";

import { getUserById, getUserAchievements } from "../services/userService";

export default function AchievementsScreen() {

  const { userId } = useParams();

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [userRes, achievementsRes] = await Promise.all([
        getUserById(userId),
        getUserAchievements(userId)
      ]);

      setUser(userRes);
      setAchievements(achievementsRes);

    } catch (e) {
      console.error("Error cargando logros", e);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Filtrar por nivel del usuario
  const filteredAchievements = useMemo(() => {
    if (!user) return [];

    return achievements
      .filter(a => a.levelId >= user.userLevelId)
      .sort((a, b) => a.levelId - b.levelId);
  }, [achievements, user]);

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

      <Container
        maxWidth="md"
        sx={{ mt: 4, mb: 6, zIndex: 2, position: "relative" }}
      >
        <Stack spacing={3}>

          {/* 🔝 HEADER */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 3
            }}
          >
            <Box sx={{ width: 48 }}>
              <BackButton to={`/workout/${userId}`} />
            </Box>

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
                Logros
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

            <Box sx={{ width: 48 }} />
          </Box>

          {/* 🧱 GRID DE CARDS */}
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(6px)",
              borderRadius: 3
            }}
          >
            <CardContent>

              {loading ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)"
                    },
                    gap: 3
                  }}
                >
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} variant="rounded" height={200} />
                  ))}
                </Box>
              ) : filteredAchievements.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography fontSize="1.8rem">
                    No hay logros disponibles todavía 🏆
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)"
                    },
                    gap: 3
                  }}
                >
                  {filteredAchievements.map((ach) => (
                    <AchievementCard
                      key={ach.id}
                      achievement={ach}
                    />
                  ))}
                </Box>
              )}

            </CardContent>
          </Card>

        </Stack>
      </Container>
    </Box>
  );
}