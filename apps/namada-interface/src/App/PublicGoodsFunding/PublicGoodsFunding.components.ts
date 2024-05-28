import styled from "styled-components";

export const PublicGoodsFundingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  color: ${(props) => props.theme.colors.utility2.main};
  background-color: ${(props) => props.theme.colors.utility1.main80};
`;
