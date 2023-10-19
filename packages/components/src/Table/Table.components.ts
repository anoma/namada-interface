import styled from "styled-components";

export const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  margin-bottom: 32px;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const TableElement = styled.table`
  max-height: 1px;
`;

export const TableLink = styled.span`
  cursor: pointer;
  color: ${(props) => props.theme.colors.secondary.main};
  display: block;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
`;

export const TableDimmedCell = styled.span`
  color: ${(props) => props.theme.colors.utility2.main40};
`;
