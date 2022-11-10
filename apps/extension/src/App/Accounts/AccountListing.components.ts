import styled from "styled-components";

export const AccountListingContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  font-family: "Space Grotesk", sans-serif;
  background-color: ${(props) => props.theme.colors.utility1.main};
  font-size: 11px;
  color: ${(props) => props.theme.colors.utility1.main40};
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility1.main};
  border-radius: 8px;
  box-sizing: border-box;
  padding: 4px 8px;
`;

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 3;
`;

export const DerivationPath = styled.div``;

export const Address = styled.div`
  font-family: monospace;
  font-size: 10px;
  padding: 0 0 4px;
}
`;

export const Alias = styled.div`
  color: ${(props) => props.theme.colors.utility1.main20};
  font-weight: 500;
  padding: 4px 0;
`;

export const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
`;

export const Button = styled.a`
  text-decoration: underline;
  padding: 5px;
  transition: "1 sec";
  border-radius: 4px;

  & > div > svg > path {
    fill: ${(props) => props.theme.colors.utility1.main40};
    stroke: ${(props) => props.theme.colors.utility1.main40};
  }

  &:active {
    border: 1px solid ${(props) => props.theme.colors.primary.main};
    background-color: ${(props) => props.theme.colors.primary.main};
  }
`;
