import { useState } from "react";
import { useNavigate } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  Snackbar
} from "@mui/material";

import { loginSystemUser } from "../services/systemUserService";

export default function LoginScreen() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Completá usuario y contraseña");
      return;
    }

    try {
      setLoading(true);

      const res = await loginSystemUser({
        username,
        password
      });

      // 🔥 guardar sesión simple
      localStorage.setItem("systemUser", JSON.stringify(res));

      // 🔥 redirección por rol
      if (res.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/home");
      }

    } catch (e) {
      setError(e?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden"
      }}
    >
      {/* 🖼️ BACKGROUND */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          zIndex: 0
        }}
      />

      {/* 🌑 OVERLAY */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(44, 44, 44, 0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 1
        }}
      />

      <Container
        maxWidth="md"
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          position: "relative"
        }}
      >
        <Card
          sx={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.2)",
            width: "100%",
            minHeight: 700,
            maxWidth: 700, // 👈 controla ancho real
            p: 4,
            mx: "auto"
          }}
        >
          <CardContent
            sx={{
              height: "100%",
              alignItems: "center",     // 👈 centra vertical
              justifyContent: "center"  // 👈 centra horizontal
            }}
          >
            <Stack sx={{ height: "100%" }}>

              {/* 🧠 TÍTULO */}
              <Box textAlign="center" sx={{p: 2}}>
                <Typography
                  variant="h2"
                  fontWeight={900}
                  sx={{
                    background: "linear-gradient(135deg, #ff2020, #f16744)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  GymPro
                </Typography>

                <Typography variant="h4" sx={{ opacity: 0.7, mt: 3 }}>
                  Iniciar sesión
                </Typography>
              </Box>
              
              
              <Stack spacing={3} sx={{ mt: 9 }}>
                {/* 👤 USER */}
                <TextField
                  label="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    sx: {
                      fontSize: "1.8rem",

                      "&.MuiInputLabel-shrink": {
                        fontSize: "1.6rem",
                        transform: "translate(11px, -18px) scale(1)" 
                      }
                    }
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 80, // 👈 altura
                      fontSize: "2rem"
                    }
                  }}
                />

                {/* 🔒 PASSWORD */}
                <TextField
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    sx: {
                      fontSize: "1.8rem",

                      "&.MuiInputLabel-shrink": {
                        fontSize: "1.6rem",
                        transform: "translate(11px, -18px) scale(1)" 
                      }
                    }
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 80, // 👈 altura
                      fontSize: "2rem"
                    },
                  }}
                />

                {/* 🔘 BOTÓN */}
                <Button
                size="lg"
                  variant="contained"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{
                    py: 1.3,
                    fontWeight: 700,
                    fontSize: "1.7rem",
                    background: "linear-gradient(135deg, #ff2020, #f16744)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                  }}
                >
                  {loading ? "Entrando..." : "Login"}
                </Button>
              </Stack>

            </Stack>
          </CardContent>
        </Card>

        {/* ⚠️ ERROR */}
        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity="error"
            sx={{
              width: "100%",
              fontSize: "1.8rem",     // 👈 texto más grande
              px: 3,
              py: 1.5,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: "1.8rem", // 👈 agranda el ícono
                alignItems: "center",
                marginTop: "2px"
              }
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
      
    </Box>
  );
}