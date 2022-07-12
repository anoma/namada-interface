export type ThemeConfigurations = {
  isLightMode: boolean;
};

type Colors = {
  background1: string;
  background2: string;
  background3: string;
  titleColor: string;
  border: string;
  borderShadow: string;
  textPrimary: string;
  buttonText1: string;
  buttonText2: string;
  buttonText3: string;
  buttonBackground1: string;
  buttonBackground2: string;
  buttonBackground3: string;
  buttonBorder1: string;
  buttonBorder2: string;
  buttonBorder3: string;
  buttonHover1: string;
  buttonHover2: string;
  buttonHover3: string;
  buttonTextSmall: string;
  inputText: string;
  inputBorder: string;
  inputPlaceholder: string;
  inputError: string;
  inputFocus: string;
  wordchip: string;
  wordchipText: string;
  textSecondary: string;
  yellow1: string;
  yellow1Hover: string;
  buttonBorder: string;
  buttonShadow: string;
  buttonShadowHover: string;
  buttonDisabledBackground: string;
  buttonDisabledBorder: string;
  buttonOutlineStyleHoverBackground: string;
};

export type Theme = {
  themeConfigurations: ThemeConfigurations;
  colors: Colors;
};

export const darkColors: Colors = {
  background1: "#000000",
  background2: "#444444",
  background3: "#ffffff",
  titleColor: "#ffffff",
  border: "#3E3E3E",
  borderShadow: "#727273",
  buttonText1: "#F5DD81",
  buttonText2: "#17171D",
  buttonText3: "#17171D",
  buttonBackground1: "#242427",
  buttonBackground2: "#FFFF00",
  buttonBackground3: "#444444",
  buttonBorder1: "#F5DD81",
  buttonBorder2: "#CEB44F",
  buttonBorder3: "#b9b9bb",
  buttonHover1: "#CEB44F",
  buttonHover2: "#9A851F",
  buttonHover3: "#747477",
  buttonTextSmall: "#F5DD81",
  inputBorder: "#727273",
  inputText: "#e8e8e8",
  inputPlaceholder: "#a2a2a5",
  inputError: "#CF6679",
  inputFocus: "#F5DD81",
  wordchip: "#000000",
  wordchipText: "#e8e8e8",
  textPrimary: "#727273",
  textSecondary: "#8F9FB2",
  yellow1: "#F5DD81",
  yellow1Hover: "#ffdc55",
  buttonBorder: "#CEB44F",
  buttonShadow: "#CEB44F",
  buttonShadowHover: "#CEB44F",
  buttonDisabledBackground: "#c7c7c7",
  buttonDisabledBorder: "#747474",
  buttonOutlineStyleHoverBackground: "#393939",
};

export const darkColorsLoggedIn: Colors = {
  ...darkColors,
  background1: "#FFFF00",
  background2: "#1F1F1F",
};

export const lightColors: Colors = {
  background1: "#ffffff",
  background2: "#ffffff",
  background3: "#f2f2f2",
  titleColor: "#011F43",
  border: "#DADADA",
  borderShadow: "#002046",
  textPrimary: "#002046",
  buttonText1: "#011F43",
  buttonText2: "#FFFFFF",
  buttonText3: "#FFFFFF",
  buttonBackground1: "#FFFFFF",
  buttonBackground2: "#11DFDF",
  buttonBackground3: "#D9D9D9",
  buttonBorder1: "#011F43",
  buttonBorder2: "#11DFDF",
  buttonBorder3: "#011F43",
  buttonHover1: "#67798e",
  buttonHover2: "#f5cf67",
  buttonHover3: "#7f97b2",
  buttonTextSmall: "#EEAF02",
  inputBorder: "#011F43",
  inputText: "#011F43",
  inputPlaceholder: "#8F9FB2",
  inputError: "#EC4236",
  inputFocus: "#2A517E",
  wordchip: "#11DFDF",
  wordchipText: "#011F43",
  textSecondary: "#8F9FB2",
  yellow1: "#EEAF02",
  yellow1Hover: "#f8bf24",
  buttonBorder: "#002046",
  buttonShadow: "#002046",
  buttonShadowHover: "#002046",
  buttonDisabledBackground: "#c7c7c7",
  buttonDisabledBorder: "#747474",
  buttonOutlineStyleHoverBackground: "#ffeaaf",
};
