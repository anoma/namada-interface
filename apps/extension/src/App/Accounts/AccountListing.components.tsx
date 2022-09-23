import styled from "styled-components";

export const AccountListingContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${(props) => props.theme.colors.utility1.main};
  color: ${(props) => props.theme.colors.utility1.main20}
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility1.main}
  border-radius: 8px;
  padding: 8px 0 8px;
  box-sizing: border-box;
`;

export const DerivationPath = styled.div`
  padding: 4px 8px;
  margin: 4px 8px;
  background-color: ${(props) => props.theme.colors.utility1.main80};
`;

export const Address = styled.div`
  padding: 4px 8px;
  margin: 4px 8px;
  background-color: ${(props) => props.theme.colors.utility1.main80};
`;

export const Description = styled.div``;
