import { colors } from "./theme";
import { Color } from "./types";

export const getDefaultColorString = (color: Color): string => {
  if (!colors.hasOwnProperty(color)) {
    throw `Unable to find color`;
  }

  const colorValue = colors[color];

  if (typeof colorValue === "string") {
    return colorValue;
  }

  if (typeof colorValue === "object" && "DEFAULT" in colorValue) {
    return colorValue.DEFAULT;
  }

  return "";
};
