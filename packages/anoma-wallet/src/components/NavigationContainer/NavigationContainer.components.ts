import styled from "styled-components/macro";

export const NavigationContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 0 16px 0;
`;
export const MainRow = styled.div<{ center?: boolean }>`
  display: flex;
  width: 100%;
  ${(props) => (props.center ? "justify-content: center;" : "")}
`;
