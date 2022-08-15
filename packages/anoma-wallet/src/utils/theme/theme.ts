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
    main75: string;
    main70: string;
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
};

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
    main80: "#CCCC00",
    main60: "#999900",
    main40: "#666600",
    main20: "#333300",
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
    main75: "#2D2D2D",
    main70: "#282828",
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

export const getTheme = (_isLightMode: boolean): DesignConfiguration => {
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
};

// this sets the dark/light colors to theme
export const getTheme_old = (isLightMode: boolean): Theme => {
  const theme: Theme = {
    themeConfigurations: {
      isLightMode: isLightMode,
    },
  };
  return theme;
};
