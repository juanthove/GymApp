import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to, sx }){

 const navigate = useNavigate();

 return(
  <IconButton onClick={()=>navigate(to)} sx={sx}>
   <ArrowBackIcon/>
  </IconButton>
 );

}