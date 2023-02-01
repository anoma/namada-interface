import styled from "styled-components";

export const NavigationContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  background-color: ${(props) => props.theme.colors.utility1.main75};
  height: 52px;
  align-items: center;
  justify-content: center;

  h1 {
    color: ${(props) => props.theme.colors.utility2.main};
    padding: 0;
    margin: 0;
  }
`;

export const MainRow = styled.div<{ center?: boolean }>`
  display: flex;
  width: 100%;
  ${(props) => (props.center ? "justify-content: center;" : "")}
`;
