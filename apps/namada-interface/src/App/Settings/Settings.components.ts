import styled from "styled-components";

export const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const SettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 450px;
  padding: 40px;
  margin: 0 0 20px 0;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 0 40px;
  margin: 0 0 20px 0;
  box-sizing: border-box;
`;
