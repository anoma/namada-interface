import styled from "styled-components/macro";

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;

  height: 100%;

  background-color: ${(props) => props.theme.colors.background1};
  transition: all 0.3s linear;
`;

export const TopSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 100%;
`;

export const MainSectionContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;
