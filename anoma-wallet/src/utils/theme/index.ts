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
  buttonText1: "#F5DD81",
  buttonText2: "#17171D",
  buttonText3: "#17171D",
  buttonBackground1: "#242427",
  buttonBackground2: "#F5DD81",
  buttonBackground3: "#FFFFFF",
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
};

export const lightColors: Colors = {
  background1: "#ffffff",
  background2: "#ffffff",
  background3: "#ffffff",
  border: "#002046",
  borderShadow: "#002046",
  textPrimary: "#002046",
  buttonText1: "#011F43",
  buttonText2: "#FFFFFF",
  buttonText3: "#FFFFFF",
  buttonBackground1: "#FFFFFF",
  buttonBackground2: "#EEAF02",
  buttonBackground3: "#2A517E",
  buttonBorder1: "#011F43",
  buttonBorder2: "#E0A400",
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
};
