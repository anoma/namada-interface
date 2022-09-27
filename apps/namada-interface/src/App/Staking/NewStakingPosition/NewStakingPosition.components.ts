import styled from "styled-components/macro";

export const NewStakingPositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 16px 0 16px;
  overflow-y: scroll;
  color: ${(props) => props.theme.colors.utility2.main};
`;
