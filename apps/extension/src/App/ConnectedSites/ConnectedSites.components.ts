import styled from "styled-components";

export const ConnectedSitesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 8px;
  width: 100%;
`;

export const ConnectedSiteListItemContainer = styled.li`
  padding: 0;
  margin: 4px 0;
  display: flex;
  flex-direction: row;
`;

export const ConnectedSiteDetails = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
  font-family: "Space Grotesk", sans-serif;
  background-color: ${(props) => props.theme.colors.utility1.main};
  font-size: 11px;
  color: ${(props) => props.theme.colors.utility1.main40};
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility1.main};
  border-radius: 8px;
  box-sizing: border-box;
  padding: 8px 8px;
`;

export const ConnectedSiteSideButton = styled.div`
  display: flex;
  flex-direction: row;
  width: 10%;
  font-family: "Space Grotesk", sans-serif;
  background-color: ${(props) => props.theme.colors.utility1.main};
  font-size: 11px;
  color: ${(props) => props.theme.colors.utility1.main40};
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility1.main};
  border-radius: 8px;
  box-sizing: border-box;
  padding: 8px 8px;
  cursor: pointer;
  text-align: center;

  &::before {
    content: "x";
    transform: translate(50%);
  }

  &:hover {
    color: ${(props) => props.theme.colors.utility1.main};
    background-color: ${(props) => props.theme.colors.utility2.main};
  }
`;
