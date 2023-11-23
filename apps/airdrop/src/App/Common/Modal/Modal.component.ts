import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const ModalOverlay = styled.div`
  cursor: pointer;
  filter: blur(10px);
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  transition: all 100ms ease-out;
  width: 100%;
  z-index: 20;
`;

export const ModalContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid ${color("primary", "main")};
  border-radius: 50%;
  min-height: 732px;
  box-sizing: content-box;
  min-width: 732px;
  background-color: black;
  position: fixed;
  left: 50%;
  top: 50%;
  aspect-ratio: 1 / 1;
  padding: ${spacement(12)};
  transform: translateX(-50%) translateY(-50%);
  z-index: 100;
`;

export const ModalContentWrapper = styled.div`
  max-width: 520px;
  margin: 0 auto;
`;

export const ModalHeader = styled.header`
  color: ${color("primary", "main")};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacement(8)};
`;

export const ModalCloseIcon = styled.button`
  all: unset;
  background: transparent;
  color: ${color("primary", "main")};
  cursor: pointer;
`;

export const ModalContent = styled.article``;
