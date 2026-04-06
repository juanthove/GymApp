import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function CloseButton({ onClick, sx }) {
  return (
    <IconButton
      onClick={onClick}
      disableRipple
      sx={{
        color: "#666",
        padding: 0.5,
        "&:hover": {
          backgroundColor: "transparent",
          color: "#000", 
        },
        ...sx,
      }}
    >
      <CloseIcon sx={{ fontSize: "2.5rem" }} />
    </IconButton>
  );
}