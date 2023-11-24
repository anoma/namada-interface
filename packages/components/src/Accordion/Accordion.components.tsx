import {
  ThemeColor,
  borderRadius,
  color,
  fontSize,
  spacement,
} from "@namada/utils";
import { Icon } from "../Icon";
import styled from "styled-components";

export const AccordionTitle = styled.div``;
export const AccordionTitleChevron = styled(Icon)``;

export const AccordionTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75em ${spacement(6)};
  width: 100%;
  cursor: pointer;
`;

export const AccordionContentContainer = styled.div`
  padding: 0 ${spacement(6)} 0.75em;
`;

export const AccordionContainer = styled.div<{
  variant: ThemeColor;
  solid: boolean;
}>`
  align-items: center;
  all: unset;

  background-color: ${(props) => {
    if (props.solid) {
      return color(props.variant, "main")(props);
    }
    return "transparent";
  }};

  border: ${(props) => {
    if (props.solid) {
      return "";
    }
    return `1px solid ${color(props.variant, "main")(props)}`;
  }};

  border-radius: ${borderRadius("sm")};
  box-sizing: border-box;

  color: ${(props) => {
    if (props.solid) {
      return color("utility2", "main")(props);
    }
    return color(props.variant, "main")(props);
  }};

  display: flex;
  flex-direction: column;
  font-size: ${fontSize("base")};
  font-weight: 500;
  min-height: 2em;
  width: 100%;

  & ${AccordionTitleChevron} path {
    stroke: ${(props) => {
      if (props.solid) {
        return color("utility2", "main")(props);
      }
      return color(props.variant, "main")(props);
    }};
  }
`;

// &:hover:not(:disabled) {
//   color: ${(props) => {
//     if (props.outlined) {
//       return color(props.variant, "main20")(props);
//     }
//     return color(props.variant, "main")(props);
//   }};
// }

// &:not(:disabled):active {
//   top: ${spacement("px")};
// }

// &:disabled {
//   background-color: ${(props) => {
//     if (!props.outlined) {
//       return color("utility1", "main50");
//     }
//   }};

//   color: ${(props) => {
//     if (!props.outlined) {
//       return color("utility3", "white");
//     }
//   }};

//   cursor: auto;
//   opacity: 0.25;
// }

// ${ButtonHover} {
//   background-color: ${(props) => {
//     if (props.outlined) {
//       return color("primary", "main")(props);
//     }
//     return "black";
//   }};
// }

// &:hover:not(:disabled) ${ButtonHover} {
//   transform: translateY(0);
// }
