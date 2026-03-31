import { Button, Stack, Typography, FormControlLabel, Checkbox } from "@mui/material";

export default function FileUploadField({
  label,
  accept,
  setFile,
  preview,
  setPreview,
  existingUrl,
  deleteFlag,
  setDeleteFlag,
  renderPreview
}) {

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setDeleteFlag(false);

    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  return (
    <Stack spacing={1}>
      <Typography>{label}</Typography>

      <Button variant="outlined" component="label">
        Seleccionar
        <input
          hidden
          type="file"
          accept={accept}
          onClick={(e) => (e.target.value = null)}
          onChange={handleChange}
        />
      </Button>

      {/* Checkbox eliminar */}
      {existingUrl && (
        <FormControlLabel
          control={
            <Checkbox
              checked={deleteFlag}
              onChange={() => {
                const newValue = !deleteFlag;
                setDeleteFlag(newValue);
                if (newValue) setFile(null);
              }}
            />
          }
          label="Eliminar archivo"
        />
      )}

      {/* Preview */}
      {(preview || existingUrl) && !deleteFlag &&
        renderPreview(preview || existingUrl)
      }
    </Stack>
  );
}