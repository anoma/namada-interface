import styled from "styled-components";

export const ExtraSettingsContainer = styled.div`
  padding-top: 10px;
`;

export const CloseLink = styled.a`
  display: flex;
  justify-content: right;
  padding-right: 10px;
  text-decoration: underline;
  color: ${(props) => props.theme.colors.primary.main};
  font-size: 11px;
`;
