/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const DarkModeContext = createContext(null);

export function useDarkMode() {
  const context = useContext(DarkModeContext);

  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }

  return context;
}

export default DarkModeContext;
