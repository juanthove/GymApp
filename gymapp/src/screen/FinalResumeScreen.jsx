import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getUserById } from "../services/userService";
import {
  getTotalWorkoutVolumeByUserAndDateRange,
  getWeeklyMuscleVolumeByUserAndDateRange
} from "../services/workoutSetService";

import {
  Container,
  Typography,
  Stack,
  Button,
  Box
} from "@mui/material";

import MuscleChips from "../components/MuscleChips";

export default function FinalResumeScreen() {

  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [totalVolume, setTotalVolume] = useState(0);
  const [muscleVolume, setMuscleVolume] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const getTodayRange = () => {
    const today = new Date();
    const from = today.toISOString().split("T")[0];
    const to = from;
    return { from, to };
  };

  const loadData = async () => {
    const u = await getUserById(userId);
    setUser(u);

    const { from, to } = getTodayRange();

    const total = await getTotalWorkoutVolumeByUserAndDateRange(userId, from, to);
    setTotalVolume(total?.totalVolume ?? 0);

    const muscle = await getWeeklyMuscleVolumeByUserAndDateRange(userId, from, to);
    setMuscleVolume(muscle ?? []);
  };

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>

      <Stack spacing={4} textAlign="center" alignItems="center">

        {/* 🟢 MENSAJE */}
        <Typography variant="h3" fontWeight={700}>
          🎉 Felicitaciones {user.name}
        </Typography>

        <Typography variant="h4" color="text.secondary">
          Finalizaste el día
        </Typography>

        {/* 🔵 VOLUMEN TOTAL */}
        <Box>
          <Typography variant="h4">
            Volumen total levantado
          </Typography>

          <Typography variant="h3" fontWeight={700}>
            {totalVolume} kg
          </Typography>
        </Box>

        {/* 🟣 VOLUMEN POR MÚSCULO */}
        <Box width="75%">
          <Typography variant="h4" mb={2}>
            Volumen por músculo
          </Typography>

          <Stack spacing={1}>
            {muscleVolume.map((m) => (
              <Box
                key={m.muscle}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  p: 1.5,
                  alignItems: "center"
                }}
              >
                <MuscleChips muscles={[m.muscle]} size="medium" chipSx={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    height: 36,
                    px: 1.5
                  }}/>

                <Typography fontSize="1.2rem" fontWeight={700}>
                  {m.volume} kg
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* 🔙 BOTÓN */}
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(`/workout/${userId}`)}
        >
          Volver
        </Button>

      </Stack>

    </Container>
  );
}