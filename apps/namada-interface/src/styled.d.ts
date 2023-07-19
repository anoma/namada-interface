import "styled-components";
import { DesignConfiguration } from "@namada/utils";
interface IPalette {
  main: string;
  contrastText: string;
}
declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends DesignConfiguration {}
}
