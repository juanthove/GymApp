import { useState, useEffect, useRef } from "react";
import useRequireAuth from "../hooks/useRequireAuth";
import Cropper from "react-easy-crop";

import backgroundImg from "../assets/gymproIcon.png";

import {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  uploadUserImage,
  deleteUserImage,
  getUserImageUrl,
} from "../services/userService";

import { getUserLevels } from "../services/userLevelService";

import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogContent,
  DialogActions,
  Slider,
  Box,
  Autocomplete,
} from "@mui/material";

import BackButton from "../components/BackButton";
import AppSnackbar from "../components/AppSnackbar";
import ConfirmDialog from "../components/ConfirmDialog";

export default function CreateUserScreen() {
  useRequireAuth();
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("new");
  const [currentUser, setCurrentUser] = useState(null);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gymDays, setGymDays] = useState("");
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [deleteImageChecked, setDeleteImageChecked] = useState(false);

  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    loadLevels();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const loadLevels = async () => {
    const data = await getUserLevels();
    setLevels(data);
  };

  const resetForm = () => {
    setSelectedId("new");
    setCurrentUser(null);
    setName("");
    setSurname("");
    setGymDays("");
    setImage(null);
    setPreview(null);
    setDeleteImageChecked(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelect = (id) => {
    setSelectedId(id);

    if (id === "new") {
      resetForm();
      return;
    }

    const user = users.find((u) => u.id === Number(id));

    setCurrentUser(user);
    setName(user.name);
    setSurname(user.surname);
    setGymDays(user.gymDaysPerWeek || "");
    setSelectedLevel(user.userLevelId || "");
    setImage(null);
    setDeleteImageChecked(false);
    setPreview(user.image ? getUserImageUrl(user.image) : null);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setMessage("El nombre es obligatorio");
      setMessageType("warning");
      return false;
    }

    if (!surname.trim()) {
      setMessage("El apellido es obligatorio");
      setMessageType("warning");
      return false;
    }

    if (!gymDays) {
      setMessage("Debes indicar los días de gimnasio por semana");
      setMessageType("warning");
      return false;
    }

    if (gymDays < 1 || gymDays > 7) {
      setMessage("Los días de gimnasio deben ser entre 1 y 7");
      setMessageType("warning");
      return false;
    }

    if (!selectedLevel) {
      setMessage("Debes seleccionar un nivel");
      setMessageType("warning");
      return false;
    }

    return true;
  };

  //Recortar imagen
  const getCroppedImg = async (imageSrc, crop) => {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleCropSave = async () => {
    const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);

    const croppedFile = new File([croppedBlob], "avatar.jpg", {
      type: "image/jpeg",
    });

    setImage(croppedFile);
    setPreview(URL.createObjectURL(croppedBlob));
    setShowCropModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (selectedId === "new") {
        const created = await createUser({
          name,
          surname,
          gymDaysPerWeek: parseInt(gymDays, 10),
          userLevelId: selectedLevel,
        });

        if (image) {
          await uploadUserImage(created.id, image);
        }

        setMessage("Usuario creado correctamente");
        setMessageType("success");
      } else {
        await updateUser(selectedId, {
          name,
          surname,
          gymDaysPerWeek: parseInt(gymDays, 10),
          userLevelId: selectedLevel,
        });

        if (image) {
          await uploadUserImage(Number(selectedId), image);
        } else if (deleteImageChecked) {
          await deleteUserImage(Number(selectedId));
        }

        setMessage("Usuario actualizado correctamente");
        setMessageType("success");
      }

      resetForm();
      loadUsers();
    } catch (error) {
      setMessage("Error: " + error.message);
      setMessageType("error");
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;

    try {
      await deleteUser(currentUser.id);

      setMessage("Usuario eliminado correctamente");
      setMessageType("success");

      resetForm();
      loadUsers();
    } catch {
      setMessage("Error al eliminar usuario");
      setMessageType("error");
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
      <Container maxWidth="sm" sx={{ mt: 4, mb: 6, position: "relative", zIndex: 2 }}>
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            {/* Flecha a la izquierda */}
            <Box sx={{ position: "absolute", left: 0 }}>
              <BackButton to="/admin" sx={{ color: "black" }} />
            </Box>

            {/* Título centrado REAL */}
            <Typography variant="h4" sx={{ transform: "translateY(-2px)" }}>
              Usuarios
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Autocomplete
              options={[
                { id: "new", label: "Nuevo Usuario" },
                ...users.map((u) => ({
                  id: u.id,
                  label: `${u.name} ${u.surname}`,
                  name: u.name,
                  surname: u.surname,
                })),
              ]}
              value={
                selectedId === "new"
                  ? { id: "new", label: "Nuevo Usuario" }
                  : users
                      .map((u) => ({
                        id: u.id,
                        label: `${u.name} ${u.surname}`,
                        name: u.name,
                        surname: u.surname,
                      }))
                      .find((u) => u.id === Number(selectedId)) || null
              }
              onChange={(event, value) => {
                handleSelect(value?.id ?? "new");
              }}
              filterOptions={(options, state) => {
                const search = state.inputValue.trim().toLowerCase();

                return options.filter((option) => {
                  if (option.id === "new") return true;

                  return (
                    option.name?.toLowerCase().startsWith(search) || option.surname?.toLowerCase().startsWith(search)
                  );
                });
              }}
              renderInput={(params) => <TextField {...params} label="Seleccionar usuario" />}
            />

            <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Apellido" value={surname} onChange={(e) => setSurname(e.target.value)} />

            <TextField
              label="Días por semana en el gimnasio"
              type="number"
              inputProps={{ min: 1, max: 7 }}
              value={gymDays}
              onChange={(e) => setGymDays(e.target.value)}
            />

            <Autocomplete
              options={levels}
              getOptionLabel={(option) => option.name}
              value={levels.find((l) => l.id === selectedLevel) || null}
              onChange={(event, value) => {
                setSelectedLevel(value?.id || "");
              }}
              autoHighlight
              renderInput={(params) => <TextField {...params} label="Nivel" />}
              filterOptions={(options, state) => {
                const search = state.inputValue.trim().toLowerCase();

                return options.filter((option) => option.name.toLowerCase().startsWith(search));
              }}
            />

            <Stack spacing={1}>
              <Typography>Foto de perfil</Typography>

              <Button variant="outlined" component="label">
                Seleccionar imagen
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onClick={() => {
                    //Permitir volver a elegir la misma imagen
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const imageUrl = URL.createObjectURL(file);

                    setPreview(imageUrl);
                    setImage(file);
                    setDeleteImageChecked(false);
                    setShowCropModal(true);
                  }}
                />
              </Button>
            </Stack>

            {preview && (
              <Stack spacing={1}>
                {currentUser && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={deleteImageChecked}
                        onChange={() => {
                          const checked = !deleteImageChecked;
                          setDeleteImageChecked(checked);
                          if (checked) setImage(null);
                        }}
                      />
                    }
                    label="Eliminar foto"
                  />
                )}

                {!deleteImageChecked && (
                  <img
                    src={preview}
                    style={{
                      maxWidth: "180px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                    }}
                  />
                )}
              </Stack>
            )}

            <AppSnackbar message={message} type={messageType} onClose={() => setMessage("")} />

            <Stack direction="row" spacing={2}>
              {currentUser && (
                <Button variant="contained" color="error" onClick={() => setConfirmDeleteOpen(true)}>
                  Eliminar Usuario
                </Button>
              )}

              <Button variant="contained" color="success" onClick={handleSubmit}>
                {currentUser ? "Actualizar Usuario" : "Crear Usuario"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
        <ConfirmDialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={async () => {
            await handleDelete();
            setConfirmDeleteOpen(false);
          }}
          title="Eliminar usuario"
          message="¿Estás seguro de que deseas eliminar este usuario?"
          confirmText="Eliminar"
          confirmColor="error"
        />

        {/* MODAL CROPPER */}
        <Dialog open={showCropModal} onClose={() => setShowCropModal(false)} fullWidth>
          <DialogContent sx={{ position: "relative", height: 300 }}>
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(area, pixels) => setCroppedAreaPixels(pixels)}
            />
          </DialogContent>

          <Stack sx={{ px: 3 }}>
            <Typography>Zoom</Typography>
            <Slider min={1} max={3} step={0.1} value={zoom} onChange={(e, val) => setZoom(val)} />
          </Stack>

          <DialogActions>
            <Button onClick={() => setShowCropModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleCropSave}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
