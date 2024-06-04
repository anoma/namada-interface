import { useEffect, useState } from "react";

export const useSmallScreen = (): boolean | undefined => {
  const [isSmallScreen, setIsSmallScreen] = useState<boolean | undefined>();

  useEffect(() => {
    const checkSmallScreen = (): void => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener("resize", checkSmallScreen);
    checkSmallScreen();
    return () => document.removeEventListener("resize", checkSmallScreen);
  }, []);

  return isSmallScreen;
};
