import { colors } from "@namada/components/theme";
import { Color } from "@namada/components/types";

export const getDefaultColorString = (color: Color): string => {
  if (!colors.hasOwnProperty(color)) {
    throw `Unable to find color ${color}`;
  }

  const colorValue = colors[color];

  if (typeof colorValue === "string") {
    return colors[color] as string;
  }

  if (typeof colorValue === "object" && "DEFAULT" in colorValue) {
    return colorValue.DEFAULT;
  }

  return "";
};
