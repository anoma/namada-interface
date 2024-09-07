import { DesignConfiguration } from "@namada/utils";
import "styled-components";
interface IPalette {
  main: string;
  contrastText: string;
}
declare module "styled-components" {
  // eslint-disable-next-line
  export interface DefaultTheme extends DesignConfiguration {}
}
