import styled from "styled-components";

export const TokenSendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  padding: 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const TokenSendContent = styled.div`
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  box-sizing: border-box;
`;
