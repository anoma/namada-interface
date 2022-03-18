import styled from "styled-components/macro";
import { HeadingLevel } from "./types";

export type HeadingProps = {
  level: HeadingLevel;
};

export const Heading = styled.h2.attrs<HeadingProps>(({ level }) => ({
  as: `h${level + 1}`,
}))`
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
`;
