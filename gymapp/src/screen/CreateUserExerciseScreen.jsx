import { useState, useEffect } from "react";
import useRequireAuth from "../hooks/useRequireAuth";
import useSnackbar from "../hooks/useSnackbar";

import backgroundImg from "../assets/gymproIcon.png";

import { normalizeText } from "../utils/stringUtils";

import { getUsers } from "../services/userService";
import { getUserExercises, saveUserExercises } from "../services/userExerciseService";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Box,
  Autocomplete,
  Stack,
  Card,
  CardContent,
  Button,
} from "@mui/material";

import BackButton from "../components/BackButton";
import AppSnackbar from "../components/AppSnackbar";

import { syncWorkoutWeights } from "../services/workoutService"; //ELIMINAR

export default function CreateUserExerciseScreen() {
  useRequireAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userExercises, setUserExercises] = useState([]);

  const { message, messageType, showMessage, clearMessage } = useSnackbar();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      showMessage("Error al cargar los usuarios", "error");
    }
  };

  const loadUserExercises = async (userId) => {
    try {
      const data = await getUserExercises(userId);
      setUserExercises(data);
    } catch (error) {
      console.error("Error al cargar los ejercicios:", error);
    }
  };

  const handleUserChange = async (value) => {
    setSelectedUser(value);
    setUserExercises([]);

    if (value) {
      await loadUserExercises(value.id);
    }
  };

  const handleWeightChange = (exerciseId, weight) => {
    setUserExercises((prev) =>
      prev.map((exercise) => (exercise.exerciseId === exerciseId ? { ...exercise, weight } : exercise)),
    );
  };

  const handleSave = async () => {
    try {
      const exercisesToSave = userExercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        weight: exercise.weight === "" || exercise.weight === null ? null : Number(exercise.weight),
      }));

      await saveUserExercises(selectedUser.id, exercisesToSave);

      await loadUserExercises(selectedUser.id);

      showMessage("Cambios guardados correctamente", "success");
    } catch (error) {
      showMessage("Error al guardar los cambios", "error");
    }
  };

  //ELIMINAR
  const handleSyncWeights = async () => {
    try {
      const exerciseIds = userExercises.map((exercise) => exercise.exerciseId);

      const weights = await syncWorkoutWeights(selectedUser.id, exerciseIds);

      setUserExercises((prev) =>
        prev.map((exercise) => {
          const syncedWeight = weights.find((item) => item.exerciseId === exercise.exerciseId);

          if (!syncedWeight || syncedWeight.weight == null) {
            return exercise;
          }

          return {
            ...exercise,
            weight: syncedWeight.weight,
          };
        }),
      );

      showMessage("Pesos sincronizados correctamente", "success");
    } catch (error) {
      console.error("Error al sincronizar los pesos:", error);
      showMessage("Error al sincronizar los pesos", "error");
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${backgroundImg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",

          "@media (min-aspect-ratio: 16/9)": {
            backgroundSize: "90%",
          },

          zIndex: 0,
        }}
      />

      {/* OVERLAY */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(44, 44, 44, 0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 1,
        }}
      />

      <Container maxWidth="md" sx={{ mt: 4, mb: 6, position: "relative", zIndex: 2 }}>
        <Paper sx={{ p: 4 }}>
          {/* HEADER */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box sx={{ position: "absolute", left: 0 }}>
              <BackButton to="/admin" sx={{ color: "black" }} />
            </Box>

            <Typography variant="h4" sx={{ transform: "translateY(-2px)" }}>
              Pesos de Usuarios
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* SELECTOR DE USUARIO */}
            <Autocomplete
              autoHighlight
              options={users}
              getOptionLabel={(option) => `${option.name} ${option.surname}`}
              value={selectedUser}
              onChange={(_, value) => handleUserChange(value)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterOptions={(options, state) => {
                const search = normalizeText(state.inputValue);

                return options.filter((option) => {
                  const name = normalizeText(option.name);
                  const surname = normalizeText(option.surname);

                  return name.startsWith(search) || surname.startsWith(search);
                });
              }}
              renderInput={(params) => <TextField {...params} label="Seleccionar usuario" />}
            />

            {/* EJERCICIOS DEL USUARIO */}
            {selectedUser && (
              <Stack spacing={2}>
                <Typography variant="h6">Ejercicios</Typography>

                {userExercises.map((exercise, index) => (
                  <Card key={exercise.exerciseId}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            minWidth: 25,
                          }}
                        >
                          {index + 1}.
                        </Typography>

                        <Typography
                          sx={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {exercise.exerciseName}
                        </Typography>

                        <TextField
                          type="number"
                          label="Peso"
                          size="small"
                          value={exercise.weight ?? ""}
                          onChange={(e) => handleWeightChange(exercise.exerciseId, e.target.value)}
                          sx={{ width: 110 }}
                          inputProps={{ min: 0, step: "any" }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
          {/*{selectedUser && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button variant="contained" color="success" onClick={handleSave}>
                Guardar pesos
              </Button>
            </Box>
          )}*/}

          {/*ELIMINAR*/}
          {selectedUser && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <Button variant="outlined" onClick={handleSyncWeights}>
                Sincronizar pesos
              </Button>

              <Button variant="contained" color="success" onClick={handleSave}>
                Guardar pesos
              </Button>
            </Box>
          )}
        </Paper>

        <AppSnackbar message={message} type={messageType} onClose={clearMessage} />
      </Container>
    </Box>
  );
}
