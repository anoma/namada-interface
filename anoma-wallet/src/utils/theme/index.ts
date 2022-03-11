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
  textSecondary: string;
  yellow1: string;
  yellow1Hover: string;
  buttonBorder: string;
  buttonShadow: string;
  buttonShadowHover: string;
  buttonDisabledBackground: string;
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
  textPrimary: "#727273",
  textSecondary: "#8F9FB2",
  yellow1: "#F5DD81",
  yellow1Hover: "#ffdc55",
  buttonBorder: "#CEB44F",
  buttonShadow: "#CEB44F",
  buttonShadowHover: "#CEB44F",
  buttonDisabledBackground: "#c7c7c7",
};

export const lightColors: Colors = {
  background1: "#ffffff",
  background2: "#ffffff",
  background3: "#ffffff",
  border: "#002046",
  borderShadow: "#002046",
  textPrimary: "#002046",
  textSecondary: "#8F9FB2",
  yellow1: "#EEAF02",
  yellow1Hover: "#f8bf24",
  buttonBorder: "#002046",
  buttonShadow: "#002046",
  buttonShadowHover: "#002046",
  buttonDisabledBackground: "#c7c7c7",
};
