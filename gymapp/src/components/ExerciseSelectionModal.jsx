import { useMemo, useState, useEffect } from "react";

import AnimatedDialog from "./AnimatedDialog";

import { muscleLabels, typeLabels } from "../config/muscleConfig";
import { getExerciseIconUrl } from "../services/exerciseService";

import { Box, Button, Stack, Tabs, Tab, Typography, TextField } from "@mui/material";

export default function ExerciseSelectionModal({
  open,
  onClose,
  exercises = [],
  initialSelected = [],
  alreadyAddedExercises = [],
  onConfirm,
}) {
  const [filterType, setFilterType] = useState("ALL");
  const [filterMuscle, setFilterMuscle] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    if (open) {
      setSelectedExercises([]);
    }
  }, [open]);

  const alreadyAddedIds = useMemo(() => {
    return new Set(alreadyAddedExercises.map((e) => e.exerciseId));
  }, [alreadyAddedExercises]);

  const availableMuscles = useMemo(
    () => ["ALL", ...Array.from(new Set(exercises.map((e) => e.muscle).filter(Boolean)))],
    [exercises],
  );

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (filterType !== "ALL" && ex.type !== filterType) {
        return false;
      }

      if (filterMuscle !== "ALL" && ex.muscle !== filterMuscle) {
        return false;
      }

      if (searchText && !ex.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [exercises, filterType, filterMuscle, searchText]);

  const toggleExercise = (exercise) => {
    if (alreadyAddedIds.has(exercise.id)) {
      return;
    }

    const exists = selectedExercises.some((e) => e.id === exercise.id);

    if (exists) {
      setSelectedExercises((prev) => prev.filter((e) => e.id !== exercise.id));
    } else {
      setSelectedExercises((prev) => [...prev, exercise]);
    }
  };

  const getOrderNumber = (exerciseId) => {
    const index = selectedExercises.findIndex((e) => e.id === exerciseId);

    return index >= 0 ? index + 1 : null;
  };

  return (
    <AnimatedDialog
      open={open}
      onClose={onClose}
      title="Seleccionar ejercicios"
      titleSize="2rem"
      maxWidth={false}
      paperSx={{
        width: { xs: "95%", md: "80%" },
        maxWidth: "900px",
      }}
      actions={
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            onConfirm(selectedExercises);
            onClose();
          }}
        >
          Seleccionar ejercicios
        </Button>
      }
    >
      <Stack spacing={2}>
        <TextField
          label="Buscar ejercicio"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
        />

        <Tabs
          value={filterType}
          onChange={(e, value) => setFilterType(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="ALL" label="Todos" />
          <Tab value="PRIMARY" label="Primario" />
          <Tab value="SECONDARY" label="Secundario" />
          <Tab value="TERTIARY" label="Terciario" />
          <Tab value="ABDOMINAL" label="Abdominal" />
        </Tabs>

        <Tabs
          value={filterMuscle}
          onChange={(e, value) => setFilterMuscle(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {availableMuscles.map((muscle) => (
            <Tab key={muscle} value={muscle} label={muscle === "ALL" ? "Todos" : muscleLabels[muscle] || muscle} />
          ))}
        </Tabs>

        <Stack spacing={1}>
          {filteredExercises.map((exercise) => {
            const orderNumber = getOrderNumber(exercise.id);
            const selected = orderNumber !== null;
            const alreadyAdded = alreadyAddedIds.has(exercise.id);

            return (
              <Box
                key={exercise.id}
                tabIndex={0}
                onClick={() => toggleExercise(exercise)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExercise(exercise);
                  }
                }}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: alreadyAdded ? "2px solid #1976d2" : `2px solid ${selected ? "#4caf50" : "#ddd"}`,

                  cursor: alreadyAdded ? "not-allowed" : "pointer",

                  opacity: alreadyAdded ? 0.65 : 1,

                  backgroundColor: alreadyAdded ? "rgba(25,118,210,0.08)" : selected ? "rgba(76,175,80,0.08)" : "#fff",

                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {exercise.icon && (
                  <Box
                    component="img"
                    src={getExerciseIconUrl(exercise.icon)}
                    alt={exercise.name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "contain",
                    }}
                  />
                )}

                <Box sx={{ flex: 1 }}>
                  <Typography
                    fontWeight={700}
                    fontSize={{
                      xs: "1.1rem",
                      md: "1.3rem",
                    }}
                  >
                    {exercise.name}
                  </Typography>

                  <Typography color="text.secondary">
                    {exercise.type === "ABDOMINAL"
                      ? muscleLabels[exercise.muscle]
                      : `${typeLabels[exercise.type]} | ${muscleLabels[exercise.muscle]}`}
                  </Typography>

                  {alreadyAdded && (
                    <Typography
                      sx={{
                        color: "#1976d2",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        mt: 0.5,
                      }}
                    >
                      Ya agregado
                    </Typography>
                  )}
                </Box>

                {selected && !alreadyAdded && (
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      backgroundColor: "#4caf50",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                    }}
                  >
                    {orderNumber}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </AnimatedDialog>
  );
}
