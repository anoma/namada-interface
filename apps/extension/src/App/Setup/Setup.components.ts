import { spacement } from "@namada/utils";
import styled from "styled-components";

export const SetupContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  min-height: 330px;
  margin-top: -${spacement(6)};
`;
