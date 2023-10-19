import styled, { css } from "styled-components";

export const MainContainerNavigationContainer = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 70px;
`;

export const Title = css`
  color: ${(props) => props.theme.colors.utility2.main};
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-content: center;
  margin: 0;
`;

export const MainTitle = styled.h1<{ center?: boolean }>`
  ${Title}
  ${(props) => (props.center ? "text-align: center;" : "")}
  font-size: 28px;
  padding: 0 0 2px 12px;

  @media screen and (max-width: 860px) {
    font-size: 18px;
  }
`;
export const SecondaryTitle = styled.h1`
  ${Title}
  text-align: end;
  padding: 0 12px 4px 0;
  color: ${(props) => props.theme.colors.utility2.main40};

  @media screen and (max-width: 860px) {
    font-size: 18px;
  }
`;

export const BackButtonContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100px;
  height: 100%;
  padding: 0 0 4px;
  color: ${(props) => props.theme.colors.secondary.main};
  ${(props) => (props.disabled ? "" : "cursor: pointer;")};

  path {
    stroke: ${(props) => props.theme.colors.secondary.main};
  }
`;

export const TitleContainer = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% - 200px);
  height: 100%;

  path {
    stroke: ${(props) => props.theme.colors.utility2.main40};
  }
`;
