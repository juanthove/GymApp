import { createTheme } from "@mui/material/styles";

const theme = createTheme({

 palette:{

  primary:{
   main:"#1976d2"
  },

  success:{
   main:"#2e7d32"
  },

  error:{
   main:"#d32f2f"
  },

  background:{
   default:"#f5f5f5"
  }

 },

 typography:{
  fontFamily:"Roboto, Arial"
 },

 components:{

  MuiButton:{
   styleOverrides:{
    root:{
     borderRadius:8,
     textTransform:"none",
     fontWeight:600
    }
   }
  },

  MuiTextField:{
   defaultProps:{
    variant:"outlined"
   }
  }

 }

});

export default theme;