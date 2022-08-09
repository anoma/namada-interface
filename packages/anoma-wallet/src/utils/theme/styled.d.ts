import "styled-components";
import { DesignConfiguration } from "./theme";
interface IPalette {
  main: string;
  contrastText: string;
}
declare module "styled-components" {
  export type DefaultTheme = DesignConfiguration;
}
