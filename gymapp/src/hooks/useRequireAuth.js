import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, isTokenValid, redirectToLogin } from "../services/apiClient";

export default function useRequireAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token || !isTokenValid(token)) {
      // redirectToLogin clears storage and navigates
      redirectToLogin();
    }
  }, [navigate]);
}
