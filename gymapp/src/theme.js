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
  },

  mainRed:{
    main:"#e53935",
    hover:"#d32f2f"
  }

 },

 typography:{
  fontFamily:"Roboto, Arial"
 },

 components:{

  MuiTextField:{
   defaultProps:{
    variant:"outlined"
   }
  },

  MuiDialog: {
      defaultProps: {
        fullWidth: true,
        maxWidth: "sm", // 👈 más chico que md (esto arregla el ancho excesivo)
      },
      styleOverrides: {
        paper: {
          borderRadius: 16,
          padding: 16,
          width: "100%",
          maxWidth: 600, // 👈 control fino del ancho REAL
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "2rem",
          fontWeight: 700,
          textAlign: "center",
          paddingBottom: 8,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px 32px",
          textAlign: "center",
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 32px 24px",
          gap: 16,
          justifyContent: "center",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1.1rem",
          fontWeight: 700,
          padding: "14px 24px",
          borderRadius: 12,
        },
      },
    },

 }

});

export default theme;