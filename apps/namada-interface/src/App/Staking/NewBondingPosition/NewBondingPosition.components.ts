import {
  KeyValueData,
  Select,
  Table,
  Props as TableProps,
} from "@namada/components";
import { FC } from "react";
import styled from "styled-components";

export const BondingPositionContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, auto);
  align-items: center;
  width: 100%;
  margin: 16px 0 16px;
  overflow-y: scroll;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const NewBondingTable = styled<FC<TableProps<KeyValueData, never>>>(
  Table
)`
  width: auto;
  grid-area: 2 / 1 / 3 / 3;
  padding: 0 20px;
`;

export const BondingAmountInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 20px;
`;

export const BondingAddressSelect = styled(Select)`
  padding: 0 20px;
  width: auto;
`;
