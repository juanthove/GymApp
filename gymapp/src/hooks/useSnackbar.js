import { useState } from "react";

export default function useSnackbar() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const showMessage = (message, type = "info") => {
    setMessage(message);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage("");
  };

  return {
    message,
    messageType,
    showMessage,
    clearMessage,
  };
}
