import { Snackbar, Alert } from "@mui/material";

export default function AppSnackbar({
  message,
  type = "info",
  onClose,
  duration = 3000,
  alertSx = {},
  snackbarProps = {}
}) {

  return (
    <Snackbar
      open={!!message}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      {...snackbarProps}
    >
      <Alert
        severity={type}
        sx={{ width: "100%", ...alertSx }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}