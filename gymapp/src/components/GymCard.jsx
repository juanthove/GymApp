import { Card, CardActionArea, CardContent, Typography } from "@mui/material";

export default function GymCard({ title, subtitle, onClick, children, sx }){

 return(

  <Card
   sx={{
    borderRadius:4,
    height:140,
    transition:"0.2s",
    "&:hover":{
     transform:"translateY(-4px)",
     boxShadow:6
    },
    ...sx
   }}
  >

   <CardActionArea
    sx={{
     height:"100%",
     display:"flex",
     alignItems:"center",
     justifyContent:"center"
    }}
    onClick={onClick}
   >

    <CardContent sx={{textAlign:"center"}}>

     {title && (
      <Typography variant="h6" sx={{fontWeight:600}}>
       {title}
      </Typography>
     )}

     {subtitle && (
      <Typography color="text.secondary">
       {subtitle}
      </Typography>
     )}

     {children}

    </CardContent>

   </CardActionArea>

  </Card>

 );

}