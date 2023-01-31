import styled from "styled-components";

export const UnstakePositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  margin: 16px 0 16px;
  overflow-y: scroll;
  color: ${(props) => props.theme.colors.utility2.main};
`;
