import styled from "styled-components/macro";

export const StyledSelectWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding: 12px 0;
  margin: 0;

  & > div {
    margin: 0;
    padding: 0;
    pointer-events: none;
    z-index: 1000;
    margin-right: 8px;

    & > svg > path {
      stroke: ${(props) => props.theme.colors.primary.main};
    }
  }
`;

export const StyledSelect = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  padding: 0.875em 1em;
  border-radius: 8px;
  position: absolute;
  left: 0;
  font-family: "Space Grotesk", sans-serif;
  background-color: ${(props) => props.theme.colors.utility1.main70};
  border: none;
  border-radius: 24px;
  height: 30px;
  padding: 0 8px 0 16px;
  cursor: pointer;
  color: ${(props) =>
    props.theme.themeConfigurations.isLightMode ? "#002046" : "#ccc"};
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.utility2.main60};
  width: 100%;

  & > p {
    padding-bottom: 4px;
    margin: 0;
  }
`;
