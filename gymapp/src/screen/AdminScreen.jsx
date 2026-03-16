import { useNavigate } from "react-router-dom";

import {
Container,
Typography,
Grid,
Card,
CardActionArea,
CardContent,
Stack
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";

export default function AdminScreen(){

 const navigate = useNavigate();

 const adminOptions = [
  {
   title:"Usuarios",
   description:"Crear y administrar usuarios",
   icon:<PersonIcon sx={{fontSize:50}} />,
   route:"/admin/users"
  },
  {
   title:"Ejercicios",
   description:"Crear ejercicios",
   icon:<FitnessCenterIcon sx={{fontSize:50}} />,
   route:"/admin/exercises"
  },
  {
   title:"Plantillas",
   description:"Crear plantillas de entrenamiento",
   icon:<AssignmentIcon sx={{fontSize:50}} />,
   route:"/admin/workout-templates"
  },
  {
   title:"Planillas",
   description:"Crear planillas de entrenamiento",
   icon:<DescriptionIcon sx={{fontSize:50}} />,
   route:"/admin/workouts"
  }
 ];

 return(

  <Container maxWidth="md" sx={{mt:6,mb:6}}>

   <Typography
    variant="h4"
    align="center"
    sx={{fontWeight:700,mb:4}}
   >
    Panel de Administración
   </Typography>

   <Grid container spacing={3}>

    {adminOptions.map((option,index)=>(
     
     <Grid item xs={12} sm={6} key={index}>

      <Card
       sx={{
        height:"100%",
        borderRadius:3,
        transition:"all 0.25s ease",
        boxShadow:3,
        "&:hover":{
         transform:"translateY(-6px)",
         boxShadow:8
        }
       }}
      >

       <CardActionArea
        sx={{height:"100%"}}
        onClick={()=>navigate(option.route)}
       >

        <CardContent>

         <Stack
          spacing={2}
          alignItems="center"
          textAlign="center"
          sx={{py:2}}
         >

          {option.icon}

          <Typography variant="h6" sx={{fontWeight:600}}>
           {option.title}
          </Typography>

          <Typography
           variant="body2"
           color="text.secondary"
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

 );
}