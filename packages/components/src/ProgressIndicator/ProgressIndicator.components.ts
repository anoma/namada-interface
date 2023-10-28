import { borderRadius, color } from "@namada/utils";
import styled from "styled-components";

export const ProgressIndicatorContainer = styled.div`
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;

export const ProgressListItem = styled.li<{ active: boolean }>`
  background-color: ${color("utility1", "main80")};
  border-radius: ${borderRadius("full")};
  height: 14px;
  overflow: hidden;
  position: relative;
  width: 14px;

  &::before {
    background-color: ${color("primary", "main")};
    content: "";
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transform: ${(props) =>
      props.active ? "translateX(0)" : "translateX(-100%)"};
    transition: transform 100ms ease-out;
    width: 100%;
  }

  &[aria-current="true"]::before {
    transform: translateX(0);
  }
`;
