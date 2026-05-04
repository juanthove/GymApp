import { useNavigate } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";

import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Box
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import PrimaryButton from "../components/PrimaryButton";

export default function AdminScreen() {

  const navigate = useNavigate();

  const adminOptions = [
    {
      title: "Usuarios",
      description: "Crear y administrar usuarios",
      icon: <PersonIcon sx={{ fontSize: 80 }} />,
      route: "/admin/users"
    },
    {
      title: "Ejercicios",
      description: "Crear ejercicios",
      icon: <FitnessCenterIcon sx={{ fontSize: 80 }} />,
      route: "/admin/exercises"
    },
    {
      title: "Plantillas",
      description: "Crear plantillas de entrenamiento",
      icon: <AssignmentIcon sx={{ fontSize: 80 }} />,
      route: "/admin/workout-templates"
    },
    {
      title: "Planillas",
      description: "Crear planillas de entrenamiento",
      icon: <DescriptionIcon sx={{ fontSize: 80 }} />,
      route: "/admin/workouts"
    },
    {
      title: "Frases",
      description: "Crear frases de motivación",
      icon: <FormatQuoteIcon sx={{ fontSize: 80 }} />,
      route: "/admin/phrases"
    },
    {
      title: "Avisos",
      description: "Crear avisos para los ejercicios",
      icon: <NotificationsActiveIcon sx={{ fontSize: 80 }} />,
      route: "/admin/rules"
    },
    {
      title: "Usuarios del Sistema",
      description: "Crear usuarios para el sistema",
      icon: <ManageAccountsIcon sx={{ fontSize: 80 }} />,
      route: "/admin/system-users"
    },
    {
      title: "Niveles de Experiencia",
      description: "Crear niveles para los logros",
      icon: <SignalCellularAltIcon sx={{ fontSize: 80 }} />,
      route: "/admin/user-level"
    },
    {
      title: "Logros",
      description: "Crear logros",
      icon: <EmojiEventsIcon sx={{ fontSize: 80 }} />,
      route: "/admin/achievements"
    }
  ];

  const handleLogout = () => {
    navigate("/login");
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
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",


          "@media (min-aspect-ratio: 16/9)": {
            backgroundSize: "90%" // 👈 cuando es muy ancho
          },

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
      <Box
        sx={{
          position: "absolute",
          top: 24,
          right: 32,
          zIndex: 3
        }}
      >
        <PrimaryButton
          label="Cerrar sesión"
          onClick={handleLogout}
          sx={{
            fontSize: "1rem",
            px: 2.5,
            py: 0.6,
            borderRadius: "20px",

            background: "linear-gradient(145deg, #ff6b6b, #c62828)",

            boxShadow: `
                    0 4px 10px rgba(0,0,0,0.25),
                    inset 0 1px 2px rgba(255,255,255,0.15)
                `,

            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `
                    0 6px 14px rgba(0,0,0,0.35),
                    inset 0 1px 2px rgba(255,255,255,0.2)
                    `
            }
          }}
        />
      </Box>

      <Container
        maxWidth="lg" // 👈 más ancho
        sx={{
          mt: 6,
          mb: 6,
          position: "relative",
          zIndex: 2
        }}
      >

        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 900,
            mb: 4,
            color: "#fff",
            letterSpacing: "1px",
            textShadow: `
                0 0 10px rgba(255,255,255,0.3),
                0 4px 20px rgba(0,0,0,0.6)
            `
          }}
        >
          Panel de Administración
        </Typography>

        <Grid container spacing={3} justifyContent="center">

          {adminOptions.map((option, index) => (

            <Grid item xs={12} sm={6} md={4} lg={4} sx={{ display: "flex" }} key={index}>

              <Card
                sx={{
                  width: "100%",
                  height: "100%",
                  minWidth: 350,
                  borderRadius: 3,
                  transition: "all 0.25s ease",
                  boxShadow: 3,
                  display: "flex",              // 👈 IMPORTANTE
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 8
                  }
                }}
              >

                <CardActionArea
                  sx={{ height: "100%", display: "flex" }}
                  onClick={() => navigate(option.route)}
                >

                  <CardContent sx={{ flexGrow: 1 }}>

                    <Stack
                      spacing={2}
                      alignItems="center"
                      justifyContent="space-between"
                      textAlign="center"
                      sx={{ py: 2 }}
                    >

                      {option.icon}

                      <Typography sx={{ fontWeight: 600, fontSize: "1.8rem" }}>
                        {option.title}
                      </Typography>

                      <Typography
                        sx={{ fontSize: "1.4rem" }}
                      >
                        {option.description}
                      </Typography>

                    </Stack>

                  </CardContent>

                </CardActionArea>

              </Card>

            </Grid>

          ))}

        </Grid>

      </Container>

    </Box>

  );
}