import React, { useEffect, useState } from "react";
import { getLoggedUser, getNotLoggedUser, loginUser, getUserImageUrl } from "../services/userService";
import { useNavigate } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";

import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Switch,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";

import UserCard from "../components/UserCard";
import AnimatedDialog from "../components/AnimatedDialog";

const isFullscreenActive = () =>
  Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);

const requestFullscreen = async () => {
  const element = document.documentElement;
  const method = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;

  if (!method) {
    return false;
  }

  try {
    await method.call(element);
    return true;
  } catch {
    return false;
  }
};

const exitFullscreen = async () => {
  const method = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;

  if (!method) {
    return false;
  }

  try {
    await method.call(document);
    return true;
  } catch {
    return false;
  }
};

export default function HomeScreen() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [fullscreenEnabled, setFullscreenEnabled] = useState(isFullscreenActive());

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => {
      setFullscreenEnabled(isFullscreenActive());
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("webkitfullscreenchange", syncFullscreenState);
    };
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getLoggedUser();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const openModal = async () => {
    try {
      const data = await getNotLoggedUser();
      setAllUsers(data);
      setShowModal(true);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const goWorkoutWithUser = (user) => {
    navigate(`/workout/${user.id}`);
  };

  const goWorkout = async () => {
    try {
      if (!selectedUser) return;

      await loginUser(selectedUser.id);

      navigate(`/workout/${selectedUser.id}`);
    } catch (error) {
      console.error("Error logueando usuario:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        position: "relative",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        pt: 6,
      }}
    >
      {/* OVERLAY (para transparencia) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(44, 44, 44, 0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 1,
        }}
      />

      {/* CONTENIDO */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#fff",
                display: "inline-block",
                lineHeight: 0.55,
                letterSpacing: "1px",
                textShadow: `
                  0 0 10px rgba(255,255,255,0.3),
                  0 4px 20px rgba(0,0,0,0.6)
                `,
              }}
            >
              Usuarios activos
              <Box sx={{ width: { xs: "120%", md: "150%" }, ml: { xs: "-10%", md: "-25%" } }}>
                <svg width="100%" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <defs>
                    <filter id="blur">
                      <feGaussianBlur stdDeviation="0.4" />
                    </filter>
                  </defs>
                  <linearGradient id="grad" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#e53935" stopOpacity="0" />
                    <stop offset="10%" stopColor="#e53935" stopOpacity="1" />
                    <stop offset="90%" stopColor="#e53935" stopOpacity="1" />
                    <stop offset="100%" stopColor="#e53935" stopOpacity="0" />
                  </linearGradient>
                  <path d="M0 3 Q 50 6 100 3 Q 50 0 0 3" fill="url(#grad)" filter="url(#blur)" />
                </svg>
              </Box>
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
              pb: 1,
              px: { xs: 1.5, md: 3 },
              maxWidth: { xs: "93%", md: "1100px" },
              margin: "0 auto",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "1.1rem", md: "1.5rem" },
              }}
            >
              Conectados: {users.length}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: "1.05rem", md: "1.4rem" },
                }}
              >
                Pantalla completa
              </Typography>

              <Switch
                checked={fullscreenEnabled}
                onChange={async (_event, checked) => {
                  if (checked) {
                    const ok = await requestFullscreen();

                    if (!ok) {
                      setFullscreenEnabled(false);
                    }
                    return;
                  }

                  await exitFullscreen();
                }}
                color="error"
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: {
                xs: 2,
                md: 4,
              },
              maxWidth: "1100px",
              margin: "0 auto",
              px: {
                xs: 1.5,
                md: 3,
              },
              boxSizing: "border-box",
              width: "100%",
              justifyItems: "center",
            }}
          >
            {users.map((user) => (
              <UserCard
                key={user.id}
                title={`${user.name} ${user.surname}`}
                imageUrl={user.image ? getUserImageUrl(user.image) : null}
                onClick={() => goWorkoutWithUser(user)}
                sx={{
                  width: {
                    xs: "90%",
                    md: "100%",
                  },
                }}
              />
            ))}

            {/* BOTÓN + */}

            <Box
              sx={{
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Card
                onClick={openModal}
                sx={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "0.2s",
                  border: "2px solid #d32f2f",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: 6,
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 70, color: "mainRed.hover" }} />
              </Card>
            </Box>
          </Box>

          {/* MODAL */}

          <AnimatedDialog
            open={showModal}
            onClose={() => setShowModal(false)}
            onExited={() => {
              setSearch("");
              setSelectedUser(null);
            }}
            title="Seleccionar usuario"
            maxWidth="xs"
            fullWidth
            titleSize="2rem"
            headerSx={{ py: 1 }}
            paperSx={{
              borderRadius: 4,
              maxHeight: "60vh",
            }}
            closeSx={{ p: 1, "& svg": { fontSize: 50 } }}
            actions={
              <Button
                variant="contained"
                disabled={!selectedUser}
                onClick={goWorkout}
                fullWidth
                sx={{
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  height: 80,
                  backgroundColor: "#202020",
                  "&:hover": {
                    backgroundColor: "#000000",
                  },
                }}
              >
                Seleccionar
              </Button>
            }
          >
            <TextField
              fullWidth
              placeholder="Buscar usuario..."
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                mb: 2,

                "& .MuiOutlinedInput-root": {
                  height: 80,
                  borderRadius: 3,
                },

                "& .MuiInputBase-input": {
                  fontSize: "2rem",
                },

                "& .MuiInputBase-input::placeholder": {
                  fontSize: "2rem",
                  opacity: 0.7,
                },
              }}
              InputProps={{
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearch("")} edge="end">
                      <ClearIcon sx={{ fontSize: 50 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <List sx={{ mt: 1 }}>
              {allUsers
                .filter((user) => `${user.name} ${user.surname}`.toLowerCase().includes(search.toLowerCase()))
                .map((user) => (
                  <ListItemButton
                    key={user.id}
                    selected={selectedUser?.id === user.id}
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      borderRadius: 3,
                      mb: 1,
                      py: 2,
                      transition: "0.2s",

                      "&.Mui-selected": {
                        backgroundColor: "mainRed.main",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "mainRed.hover",
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.image ? getUserImageUrl(user.image) : undefined}
                        sx={{
                          width: 65,
                          height: 65,
                          fontSize: "2rem",
                          mr: 3,
                        }}
                      >
                        {user.name?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.name} ${user.surname}`}
                      primaryTypographyProps={{
                        fontSize: "2rem",
                        fontWeight: selectedUser?.id === user.id ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                ))}
            </List>
          </AnimatedDialog>
        </Container>
      </Box>
    </Box>
  );
}
