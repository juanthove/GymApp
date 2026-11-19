import { useEffect, useState } from "react";
import { IconButton, Fade } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function ScrollToTopButton({ bottom = 80, right = 24, scrollContainerRef = null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef?.current ?? window;

    const handleScroll = () => {
      const scrollPosition = container === window ? window.scrollY : container.scrollTop;

      const threshold = container === window ? window.innerHeight * 1.2 : container.clientHeight * 1.5;

      setVisible(scrollPosition > threshold);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainerRef]);

  const scrollToTop = () => {
    const container = scrollContainerRef?.current ?? window;

    container.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Fade in={visible} timeout={700} unmountOnExit>
      <IconButton
        onClick={scrollToTop}
        sx={{
          position: "fixed",
          bottom,
          right,
          zIndex: 1500,

          backgroundColor: "rgba(255, 255, 255, 0.68)",
          color: "#444",

          width: 50,
          height: 50,

          border: "1px solid rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",

          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25)",

          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <KeyboardArrowUpIcon fontSize="large" />
      </IconButton>
    </Fade>
  );
}
