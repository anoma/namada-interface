import styled from "styled-components/macro";

export const NavigationContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  background-color: ${(props) => props.theme.colors.headingBackground};

  h1 {
    color: ${(props) => props.theme.colors.headingColor};
  }
`;

export const MainRow = styled.div<{ center?: boolean }>`
  display: flex;
  width: 100%;
  ${(props) => (props.center ? "justify-content: center;" : "")}
`;
