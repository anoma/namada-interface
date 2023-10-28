import { container, spacement, color, borderRadius } from "@namada/utils";
import styled from "styled-components";
import { ContainerSize } from "@namada/utils";

export const Page = styled.div`
  background-color: ${color("utility3", "black")};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding-top: ${spacement(8)};
  padding-bottom: ${spacement(8)};
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
  padding: ${spacement(5)} 0;
  border-bottom: 1px solid ${color("utility3", "black")};
`;

export const ReturnButton = styled.button``;
