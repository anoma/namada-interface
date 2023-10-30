import { container, spacement, color, borderRadius } from "@namada/utils";
import styled from "styled-components";
import { ContainerSize } from "@namada/utils";

export const Page = styled.div`
  align-items: center;
  background-color: ${color("utility3", "black")};
  display: flex;
  justify-content: center;
  margin: 0;
  min-height: 100vh;
  padding-bottom: ${spacement(8)};
  padding-top: ${spacement(8)};
`;

export const ContainerWrapper = styled.section<{ maxW: keyof ContainerSize }>`
  background-color: ${color("utility1", "main70")};
  border-radius: ${borderRadius("md")};
  max-width: ${(props) => container(props.maxW)};
  position: relative;
  width: 100%;
`;

export const ContainerBody = styled.div`
  padding: ${spacement(8)} ${spacement(10)};
`;

export const Header = styled.header`
  border-bottom: 1px solid ${color("utility3", "black")};
  padding: ${spacement(5)} 0;
  position: relative;
`;

export const ReturnButton = styled.button``;
