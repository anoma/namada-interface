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
  buttonBackground4: string;
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
  inputBackground: string;
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
  tabActiveColor: string;
  tabActiveBackground: string;
  tabInactiveColor: string;
  tabInactiveBackground: string;
  toggleCircle: string;
  toggleBackground: string;
  toggleBorder: string;
  headingBackground: string;
  headingColor: string;
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
  buttonText1: "#FFFF00",
  buttonText2: "#17171D",
  buttonText3: "#17171D",
  buttonBackground1: "#11DFDF",
  buttonBackground2: "#FFFF00",
  buttonBackground3: "#444444",
  buttonBackground4: "#FFFF00",
  buttonBorder1: "#F5DD81",
  buttonBorder2: "#CEB44F",
  buttonBorder3: "#b9b9bb",
  buttonHover1: "#CEB44F",
  buttonHover2: "#9A851F",
  buttonHover3: "#747477",
  buttonTextSmall: "#F5DD81",
  inputBorder: "#FFFF00",
  inputText: "#e8e8e8",
  inputPlaceholder: "#a2a2a5",
  inputError: "#CF6679",
  inputFocus: "#F5DD81",
  inputBackground: "#3E3E3E",
  wordchip: "#000000",
  wordchipText: "#e8e8e8",
  textPrimary: "#000000",
  textSecondary: "#8F9FB2",
  yellow1: "#F5DD81",
  yellow1Hover: "#ffdc55",
  buttonBorder: "#CEB44F",
  buttonShadow: "#CEB44F",
  buttonShadowHover: "#CEB44F",
  buttonDisabledBackground: "#c7c7c7",
  buttonDisabledBorder: "#747474",
  buttonOutlineStyleHoverBackground: "#393939",
  tabActiveColor: "#00FFFF",
  tabActiveBackground: "#1f1f1f",
  tabInactiveColor: "#000000",
  tabInactiveBackground: "#676767",
  toggleCircle: "#FFFF00",
  toggleBackground: "#444444",
  toggleBorder: "#444444",
  headingBackground: "#2D2D2D",
  headingColor: "#FFFF00",
};

export const darkColorsLoggedIn: Colors = {
  ...darkColors,
  background1: "#FFFF00",
  background2: "#1F1F1F",
  buttonBackground4: "#444444",
};

export const lightColors: Colors = {
  background1: "#ffffff",
  background2: "#ffffff",
  background3: "#f2f2f2",
  titleColor: "#011F43",
  border: "#DADADA",
  borderShadow: "#002046",
  textPrimary: "#000000",
  buttonText1: "#011F43",
  buttonText2: "#FFFFFF",
  buttonText3: "#FFFFFF",
  buttonBackground1: "#FFFF00",
  buttonBackground2: "#11DFDF",
  buttonBackground3: "#444444",
  buttonBackground4: "#11DFDF",
  buttonBorder1: "#011F43",
  buttonBorder2: "#11DFDF",
  buttonBorder3: "#011F43",
  buttonHover1: "#67798e",
  buttonHover2: "#f5cf67",
  buttonHover3: "#7f97b2",
  buttonTextSmall: "#EEAF02",
  inputBorder: "#11DFDF",
  inputText: "#011F43",
  inputPlaceholder: "#8F9FB2",
  inputError: "#EC4236",
  inputFocus: "#2A517E",
  inputBackground: "#F8F8F8",
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
  tabActiveColor: "#000",
  tabActiveBackground: "#fff",
  tabInactiveColor: "rgba(0, 0, 0, 0.5)",
  tabInactiveBackground: "#F8F8F8",
  toggleCircle: "#11DFDF",
  toggleBackground: "#FFFFFF",
  toggleBorder: "#DADADA",
  headingBackground: "#ECECEC",
  headingColor: "#000000",
};
