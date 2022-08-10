type Colors = {
  background1?: string;
  background2?: string;
  background3?: string;
  titleColor?: string;
  border?: string;
  borderShadow?: string;
  textPrimary?: string;
  buttonText1?: string;
  buttonText2?: string;
  buttonText3?: string;
  buttonBackground1?: string;
  buttonBackground2?: string;
  buttonBackground3?: string;
  buttonBackground4?: string;
  buttonBorder1?: string;
  buttonBorder2?: string;
  buttonBorder3?: string;
  buttonHover1?: string;
  buttonHover2?: string;
  buttonHover3?: string;
  buttonTextSmall?: string;
  inputText?: string;
  inputBorder?: string;
  inputPlaceholder?: string;
  inputError?: string;
  inputFocus?: string;
  inputBackground?: string;
  wordchip?: string;
  wordchipText?: string;
  textSecondary?: string;
  yellow1?: string;
  yellow1Hover?: string;
  buttonBorder?: string;
  buttonShadow?: string;
  buttonShadowHover?: string;
  buttonDisabledBackground?: string;
  buttonDisabledBorder?: string;
  buttonOutlineStyleHoverBackground?: string;
  tabActiveColor?: string;
  tabActiveBackground?: string;
  tabInactiveColor?: string;
  tabInactiveBackground?: string;
  toggleCircle?: string;
  toggleBackground?: string;
  toggleBorder?: string;
  headingBackground?: string;
  headingColor?: string;
  logoColor?: string;
  labelBorder?: string;
};

type PrimitiveColors = {
  primary: {
    main: string;
    main80: string;
    main60: string;
    main40: string;
    main20: string;
  };
  secondary: {
    main: string;
    main80: string;
    main60: string;
    main40: string;
    main20: string;
  };
  tertiary: {
    main: string;
    main80: string;
    main60: string;
    main40: string;
    main20: string;
  };
  utility1: {
    main: string;
    main80: string;
    main60: string;
    main40: string;
    main20: string;
  };
  utility2: {
    main: string;
    main80: string;
    main60: string;
    main40: string;
    main20: string;
  };
  utility3: {
    success: string;
    warning: string;
    error: string;
    highAttention: string;
    lowAttention: string;
  };
} & Colors;

type BorderRadius = {
  s: string;
  m: string;
};

type Spacers = {
  horizontal: {
    xs: string;
    s: string;
    m: string;
    l: string;
    xl: string;
    xxl: string;
  };
  vertical: {
    xs: string;
    s: string;
    m: string;
    l: string;
    xl: string;
    xxl: string;
  };
};

type Type = {
  size: string;
  weight: string;
  fontFamily: string;
};
type TypeAndFont = {
  h1: Type;
  h2: Type;
  h3: Type;
  h4: Type;
  h5: Type;
  h6: Type;
  body: Type;
};

type VectorAsset = Record<string, never>;

type RasterAsset = Record<string, never>;

export type DesignConfiguration = {
  colors: PrimitiveColors;
  spacers: Spacers;
  borderRadius: BorderRadius;
  typeAndFont: TypeAndFont;
  themeConfigurations: { isLightMode?: boolean };
};

// NAMADA
const namadaDarkColors: PrimitiveColors = {
  primary: {
    main: "#FFFF00",
    main80: "#FFFF33",
    main60: "#FFFF66",
    main40: "#FFFF99",
    main20: "#FFFFCC",
  },
  secondary: {
    main: "#11DFDF",
    main80: "#41E5E5",
    main60: "#70ECEC",
    main40: "#A0F2F2",
    main20: "#CFF9F9",
  },
  tertiary: {
    main: "#11DFDF",
    main80: "#41E5E5",
    main60: "#70ECEC",
    main40: "#A0F2F2",
    main20: "#CFF9F9",
  },
  utility1: {
    main: "#0e0e0e",
    main80: "#181818",
    main60: "#666666",
    main40: "#999999",
    main20: "#CCCCCC",
  },
  utility2: {
    main: "#FFFFFF",
    main80: "#CCCCCC",
    main60: "#999999",
    main40: "#666666",
    main20: "#333333",
  },
  utility3: {
    success: "#61C454",
    warning: "#F5BF50",
    error: "#ED695D",
    highAttention: "#FF0000",
    lowAttention: "#FAFF00",
  },
};

const namadaLightColors: PrimitiveColors = namadaDarkColors;

const namadaSpacers = {
  horizontal: {
    xs: "aaa",
    s: "aaa",
    m: "aaa",
    l: "aaa",
    xl: "fff",
    xxl: "fff",
  },
  vertical: {
    xs: "aaa",
    s: "aaa",
    m: "aaa",
    l: "aaa",
    xl: "fff",
    xxl: "fff",
  },
};

const namadaBorderRadius = { s: "12px", m: "24px" };

const namadaTypeAndFont = {
  body: {
    fontFamily: "Space Grotesk",
    size: "48px",
    weight: "700",
  },
  h1: {
    fontFamily: "Space Grotesk",
    size: "48px",
    weight: "700",
  },
  h2: {
    fontFamily: "Space Grotesk",
    size: "48px",
    weight: "700",
  },
  h3: {
    fontFamily: "Space Grotesk",
    size: "48px",
    weight: "700",
  },
  h4: {
    fontFamily: "Space Grotesk",
    size: "48px",
    weight: "700",
  },
  h5: {
    fontFamily: "Space Grotesk",
    size: "48px",
    weight: "700",
  },
  h6: {
    fontFamily: "Space Grotesk",
    size: "48px",
    weight: "700",
  },
};

enum Brand {
  Namada,
}

const getIsDarkMode = (): boolean => {
  return true;
};

const getBrand = (): Brand => {
  return Brand.Namada;
};

export type ThemeConfigurations = {
  isLightMode: boolean;
};

export const getTheme = (isLightMode: boolean): DesignConfiguration => {
  // check mode
  const isDarkMode = getIsDarkMode();
  // branding mode
  const brand = getBrand();

  // return the correct theming configuration
  switch (brand) {
    case Brand.Namada:
      const namadaTheme: DesignConfiguration = {
        colors: isDarkMode ? namadaDarkColors : namadaLightColors,
        spacers: namadaSpacers,
        borderRadius: namadaBorderRadius,
        typeAndFont: namadaTypeAndFont,
        themeConfigurations: {},
      };
      return namadaTheme;
  }
};

export type Theme = {
  themeConfigurations: ThemeConfigurations;
  colors: Colors;
};

export const darkColors: Colors = {
  background1: "#000000",
  background2: "#1f1f1f",
  background3: "#ffffff",
  titleColor: "#ffffff",
  border: "#1F1F1F",
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
  textPrimary: "#FFFFFF",
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
  tabInactiveColor: "rgba(0, 0, 0, 0.5)",
  tabInactiveBackground: "#676767",
  toggleCircle: "#FFFF00",
  toggleBackground: "#444444",
  toggleBorder: "#444444",
  headingBackground: "#3E3E3E",
  headingColor: "#FFFF00",
  logoColor: "#FFFF00",
  labelBorder: "#FFFFFF",
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
  logoColor: "#000000",
  labelBorder: "#DADADA",
};

// this sets the dark/light colors to theme
export const getTheme_old = (isLightMode: boolean): Theme => {
  const colors = isLightMode ? lightColors : darkColors;
  const theme: Theme = {
    themeConfigurations: {
      isLightMode: isLightMode,
    },
    colors: colors,
  };
  return theme;
};
