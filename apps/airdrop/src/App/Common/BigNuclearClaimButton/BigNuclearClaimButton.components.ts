import { color, fontSize } from "@namada/utils";
import styled from "styled-components";

export const InactiveButton = styled.div`
  border: 1px solid ${color("primary", "main")};
  border-radius: 100%;
  color: ${color("primary", "main")};
  height: 145px;
  font-size: ${fontSize("3xl")};
  text-transform: uppercase;
  width: 420px;
  text-align: center;
  line-height: 1;
  margin: 0 auto;
  position: relative;
  cursor: default;
  overflow: hidden;
`;

export const TextContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const ButtonText = styled.div`
  position: absolute;
  width: 420px;
`;

export const TextContainerLeft = styled(TextContainer)`
  overflow: hidden;
  position: relative;
  width: 50%;

  ${ButtonText} {
    left: 0;
  }
`;

export const TextContainerRight = styled(TextContainer)`
  overflow: hidden;
  position: relative;
  width: 50%;

  ${ButtonText} {
    right: 0;
  }
`;
