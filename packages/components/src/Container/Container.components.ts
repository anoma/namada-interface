import { container, spacement, color, borderRadius } from "@namada/utils";
import styled from "styled-components";
import { ContainerSize } from "@namada/utils";

export const Page = styled.div<{ isPopup: boolean }>`
  align-items: ${(props) => (props.isPopup ? "stretch" : "center")};
  background-color: ${color("utility3", "black")};
  display: flex;
  justify-content: center;
  margin: 0;
  min-height: 100vh;
  padding-bottom: ${(props) => (props.isPopup ? 0 : spacement(8)(props))};
  padding-top: ${(props) => (props.isPopup ? 0 : spacement(8)(props))};
  width: ${(props) => (props.isPopup ? "420px" : "auto")};
`;

export const ContainerWrapper = styled.section<{ maxW: keyof ContainerSize }>`
  background-color: ${color("utility1", "main70")};
  border-radius: ${(props) =>
    props.maxW === "popup" ? 0 : borderRadius("md")(props)};
  min-width: ${(props) => container(props.maxW)};
  position: relative;
  display: flex;
  flex-basis: min-content;
  flex-direction: column;
  flex-grow: 0;
  max-width: 100%;
  transition: all 100ms ease-out;
`;

export const ContainerBody = styled.div`
  padding: ${spacement(6)} ${spacement(7)};
  flex: 1;

  @media (min-width: 480px) {
    padding: ${spacement(8)} ${spacement(10)};
  }
`;

export const Header = styled.header`
  border-bottom: 1px solid ${color("utility3", "black")};
  padding: ${spacement(5)} 0;
  position: relative;
`;

export const ReturnButton = styled.button``;
