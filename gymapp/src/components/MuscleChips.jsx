import { Stack } from "@mui/material";
import MuscleChip from "./MuscleChip";

export default function MuscleChips({ muscles = [], size = "small", chipSx = {} }) {
  if (!muscles.length) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      rowGap={1}
      justifyContent="center"
      alignItems="center"
      sx={{
        width: "100%",
      }}
    >
      {muscles.map((muscle) => (
        <MuscleChip key={muscle} muscle={muscle} size={size} chipSx={chipSx} />
      ))}
    </Stack>
  );
}
