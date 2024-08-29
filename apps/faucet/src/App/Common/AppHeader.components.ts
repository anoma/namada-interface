import styled from "styled-components";

export const AppHeaderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SettingsButton = styled.a`
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: ${(props) => props.theme.colors.primary.main20};
  cursor: pointer;
`;
