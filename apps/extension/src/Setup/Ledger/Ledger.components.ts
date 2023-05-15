import styled from "styled-components";

export const LedgerViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

export const LedgerError = styled.div`
  color: ${(props) => props.theme.colors.utility3.highAttention};
  padding: 8px 0;
`;
