import styled from "styled-components";

export const StakingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 32px;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.utility2.main};
  background-color: ${(props) => props.theme.colors.utility1.main80};
`;
