export type ThemeConfigurations = {
  isLightMode: boolean;
};

type Colors = {
  background1: string;
  background2: string;
  background3: string;
  border: string;
  borderShadow: string;
  textPrimary: string;
};

export type Theme = {
  themeConfigurations: ThemeConfigurations;
  colors: Colors;
};

export const darkColors: Colors = {
  background1: "#17171d",
  background2: "#242427",
  background3: "#ffffff",
  border: "#727273",
  borderShadow: "#727273",
  textPrimary: "#ffffff",
};

export const lightColors: Colors = {
  background1: "#ffffff",
  background2: "#ffffff",
  background3: "#ffffff",
  border: "#002046",
  borderShadow: "#002046",
  textPrimary: "#002046",
};
