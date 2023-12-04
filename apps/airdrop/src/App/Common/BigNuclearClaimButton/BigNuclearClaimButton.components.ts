import { color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const TheBigButton = styled.button`
  all: unset;
  display: block;
  position: relative;
  margin: 0 auto;
  overflow: hidden;
  padding: ${spacement(8)} ${spacement(4)} 0;
  border-radius: 0 0 100% 100%;
  width: 420px;
  cursor: not-allowed;

  &:not(:disabled) {
    cursor: pointer;
  }

  svg {
    visibility: hidden;
  }

  &:active .yellow-button {
    transform: scaleY(0.95);
    transform-origin: center !important;
  }
`;

export const ButtonContainer = styled.div`
  background: ${color("primary", "main")};
  border: 1px solid ${color("primary", "main")};
  border-radius: 100%;
  color: ${color("primary", "main")};
  height: 145px;
  font-size: ${fontSize("3xl")};
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  line-height: 1;
  position: relative;
  overflow: hidden;
`;

export const TextContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const InactiveButtonContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 100;
`;

export const Edge = styled.i<{ right?: boolean }>`
  height: 100%;
  width: 1px;
  background-color: black;
  position: absolute;
  left: ${(props) => (props.right ? "" : "40px")};
  right: ${(props) => (props.right ? "40px" : "")};
`;

export const ButtonText = styled.div`
  position: absolute;
  width: 420px;
`;

export const TextContainerLeft = styled(TextContainer)`
  overflow: hidden;
  position: relative;
  width: 50%;
  background: ${color("utility1", "main")};

  ${ButtonText} {
    left: 0;
  }
`;

export const TextContainerRight = styled(TextContainer)`
  overflow: hidden;
  position: relative;
  width: 50%;
  background: ${color("utility1", "main")};

  ${ButtonText} {
    right: 0;
  }
`;

export const TheButtonContainer = styled.div`
  width: 180px;
  margin: 0 auto;
  position: absolute;
  bottom: 0;
  left: calc(50% - 90px);
  line-height: 0;
`;
