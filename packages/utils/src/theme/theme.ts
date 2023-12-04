// the tokens in this file should always reflect the content of
// our Figma, which is considered to be the source of truth.
// https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9102%3A8806

const ColorModeStorageKey = "com.namada.color-mode";

export type Colors = {
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
    main75: string;
    main70: string;
    main60: string;
    main50: string;
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
    black: string;
    white: string;
  };
};

export type ThemeColor = keyof Omit<Colors, "utility3">;

export type BorderRadius = {
  sm: string;
  md: string;
  lg: string;
  full: string;
  textField: string;
  mainContainer: string;
  buttonBorderRadius: string;
};

const defaultSizes = {
  px: "1px",
  0.5: "2px",
  1.5: "6px",
  2.5: "10px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  11: "44px",
  12: "48px",
  13: "52px",
  14: "56px",
  15: "60px",
  16: "64px",
  17: "68px",
  18: "72px",
  19: "76px",
  20: "80px",
  21: "84px",
  22: "88px",
  23: "92px",
  24: "96px",
  25: "100px",
  26: "104px",
  27: "108px",
  28: "112px",
  29: "116px",
  30: "120px",
  31: "124px",
  32: "128px",
  33: "132px",
  34: "136px",
  35: "140px",
  36: "144px",
  37: "148px",
  38: "152px",
  39: "156px",
  40: "160px",
  41: "164px",
  42: "168px",
  43: "172px",
  44: "176px",
  45: "180px",
  46: "184px",
  47: "188px",
  48: "192px",
  49: "196px",
  50: "200px",
  51: "204px",
  52: "208px",
  53: "212px",
  54: "216px",
  55: "220px",
  56: "224px",
  57: "228px",
  58: "232px",
  59: "236px",
  60: "240px",
  61: "244px",
  62: "248px",
  63: "252px",
  64: "256px",
};

export type Sizing = typeof defaultSizes;

type Type = {
  size: string;
  weight: string;
  fontFamily: string;
};

export type Typography = {
  h1: Type;
  h2: Type;
  h3: Type;
  h4: Type;
  h5: Type;
  h6: Type;
  body: Type;
};

export type ContainerSize = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  popup: string;
};

export type FontSize = {
  xs: string;
  sm: string;
  base: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
  "5xl": string;
  "6xl": string;
  "7xl": string;
};

export type ColorMode = "light" | "dark";

export type DesignConfiguration = {
  colors: Colors;
  spacers: Sizing;
  containers: ContainerSize;
  borderRadius: BorderRadius;
  typography: Typography;
  fontSize: FontSize;
  themeConfigurations: {
    colorMode: ColorMode;
    isLightMode?: boolean;
    themeName: ThemeName;
  };
};

// NAMADA
const namadaDarkColors: Colors = {
  primary: {
    main: "#FFFF00",
    main80: "#CCCC00",
    main60: "#999900",
    main40: "#666600",
    main20: "#333300",
  },
  secondary: {
    main: "#00FFFF",
    main80: "#00C7C7",
    main60: "#008F8F",
    main40: "#005757",
    main20: "#000303",
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
    main80: "#1A1A1A",
    main75: "#212121",
    main70: "#292929",
    main60: "#545454",
    main50: "#787878",
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
    black: "#000000",
    white: "#FFFFFF",
  },
};

const namadaLightColors: Colors = {
  primary: {
    main: "#FFFF00",
    main80: "#CCCC00",
    main60: "#999900",
    main40: "#666600",
    main20: "#333300",
  },
  secondary: {
    main: "#11DFDF",
    main80: "#11DFDF",
    main60: "#0DABAB",
    main40: "#097777",
    main20: "#054343",
  },
  tertiary: {
    main: "#11DFDF",
    main80: "#41E5E5",
    main60: "#70ECEC",
    main40: "#A0F2F2",
    main20: "#CFF9F9",
  },
  utility1: {
    main: "#FFFFFF",
    main80: "#F8F8F8",
    main75: "#F8F8F8",
    main70: "#F8F8F8",
    main60: "#F3F3F3",
    main50: "#F1F1F1",
    main40: "#F0F0F0",
    main20: "#D9D9D9",
  },
  utility2: {
    main: "#000000",
    main80: "#333333",
    main60: "#666666",
    main40: "#999999",
    main20: "#CCCCCC",
  },
  utility3: {
    success: "#61C454",
    warning: "#F5BF50",
    error: "#ED695D",
    highAttention: "#FF0000",
    lowAttention: "#FAFF00",
    black: "#000000",
    white: "#FFFFFF",
  },
};

const placeholderThemeColors: Colors = {
  primary: {
    main: "#FFFF00",
    main80: "#CCCC00",
    main60: "#999900",
    main40: "#666600",
    main20: "#333300",
  },
  secondary: {
    main: "#1D44A7",
    main80: "#1D44A7",
    main60: "#1D44A7",
    main40: "#1D44A7",
    main20: "#1D44A7",
  },
  tertiary: {
    main: "#1D44A7",
    main80: "#1D44A7",
    main60: "#1D44A7",
    main40: "#1D44A7",
    main20: "#1D44A7",
  },
  utility1: {
    main: "#FFFFFF",
    main80: "#eaf3fe",
    main75: "#eaf3fe",
    main70: "#F8F8F8",
    main60: "#F3F3F3",
    main50: "#F2F2F2",
    main40: "#F0F0F0",
    main20: "#D9D9D9",
  },
  utility2: {
    main: "#000000",
    main80: "#333333",
    main60: "#666666",
    main40: "#999999",
    main20: "#CCCCCC",
  },
  utility3: {
    success: "#61C454",
    warning: "#F5BF50",
    error: "#ED695D",
    highAttention: "#FF0000",
    lowAttention: "#FAFF00",
    black: "#FFFFFF",
    white: "#FFFFFF",
  },
};

const placeholderBorderRadius: BorderRadius = {
  sm: "8px",
  md: "10px",
  lg: "16px",
  full: "100%",
  mainContainer: "8px",
  textField: "8px",
  buttonBorderRadius: "8px",
};

const namadaBorderRadius: BorderRadius = {
  sm: "5px",
  md: "10px",
  lg: "18px",
  full: "100%",
  mainContainer: "24px",
  textField: "8px",
  buttonBorderRadius: "200px",
};

const namadaSpacers = {
  ...defaultSizes,
};

const namadaTypography = {
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

const baseFontSizes: FontSize = {
  xs: "0.8rem",
  sm: "0.9rem",
  base: "1rem",
  xl: "1.15rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  "4xl": "2.25rem",
  "5xl": "2.85rem",
  "6xl": "3.25rem",
  "7xl": "4rem",
};

const containerSizes: ContainerSize = {
  sm: "320px",
  md: "540px",
  lg: "768px",
  xl: "1024px",
  full: "100%",
  popup: "100%",
};

// we want to have the name as we might alter the usage
// of style tokens in styling files based on the theme name
export enum ThemeName {
  Namada,
  Placeholder,
}

export const loadColorMode = (): ColorMode => {
  return (localStorage.getItem(ColorModeStorageKey) || "dark") as ColorMode;
};

export const storeColorMode = (mode: ColorMode): void => {
  localStorage.setItem(ColorModeStorageKey, mode);
};

export const getTheme = (
  colorMode: ColorMode,
  shouldUsePlaceholderTheme?: boolean
): DesignConfiguration => {
  if (shouldUsePlaceholderTheme) {
    const placeholderTheme: DesignConfiguration = {
      colors: placeholderThemeColors,
      spacers: namadaSpacers,
      borderRadius: placeholderBorderRadius,
      typography: namadaTypography,
      fontSize: baseFontSizes,
      containers: containerSizes,
      themeConfigurations: {
        colorMode,
        themeName: ThemeName.Placeholder,
      },
    };
    return placeholderTheme;
  }

  const namadaTheme: DesignConfiguration = {
    colors: colorMode === "dark" ? namadaDarkColors : namadaLightColors,
    spacers: namadaSpacers,
    borderRadius: namadaBorderRadius,
    fontSize: baseFontSizes,
    typography: namadaTypography,
    containers: containerSizes,
    themeConfigurations: {
      colorMode,
      themeName: ThemeName.Namada,
    },
  };
  return namadaTheme;
};
