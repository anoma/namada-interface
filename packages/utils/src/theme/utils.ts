import { ThemeProps } from "styled-components";
import {
  BorderRadius,
  Colors,
  ContainerSize,
  DesignConfiguration,
  FontSize,
  Sizing,
} from "./theme";

export const color =
  <BaseColor extends keyof Colors>(
    base: BaseColor,
    variation: keyof Colors[BaseColor]
  ) =>
  (props: ThemeProps<DesignConfiguration>) =>
    props.theme.colors[base][variation];

export const spacement =
  (size: keyof Sizing) => (props: ThemeProps<DesignConfiguration>) =>
    props.theme.spacers[size];

export const container =
  (size: keyof ContainerSize) => (props: ThemeProps<DesignConfiguration>) => {
    return props.theme.containers[size];
  };

export const borderRadius =
  (size: keyof BorderRadius) => (props: ThemeProps<DesignConfiguration>) =>
    props.theme.borderRadius[size];

export const fontSize =
  (size: keyof FontSize) => (props: ThemeProps<DesignConfiguration>) =>
    props.theme.fontSize[size];
