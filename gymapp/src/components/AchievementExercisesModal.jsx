import AnimatedDialog from "./AnimatedDialog";

import { Box, Stack, Typography } from "@mui/material";

import { muscleLabels, typeLabels } from "../config/muscleConfig";
import { getExerciseIconUrl } from "../services/exerciseService";

export default function AchievementExercisesModal({ open, onClose, exercises = [] }) {
  return (
    <AnimatedDialog
      open={open}
      onClose={onClose}
      title="Ejercicios"
      titleSize="2rem"
      maxWidth={false}
      paperSx={{
        width: { xs: "95%", md: "650px" },
      }}
    >
      <Stack spacing={1.5}>
        {exercises.map((exercise) => (
          <Box
            key={exercise.id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid #ddd",

              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                flexShrink: 0,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {exercise.icon && (
                <Box
                  component="img"
                  src={getExerciseIconUrl(exercise.icon)}
                  alt={exercise.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700} fontSize="1.15rem">
                {exercise.name}
              </Typography>

              <Typography color="text.secondary">
                {exercise.type === "ABDOMINAL"
                  ? muscleLabels[exercise.muscle]
                  : `${typeLabels[exercise.type]} | ${muscleLabels[exercise.muscle]}`}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </AnimatedDialog>
  );
}
