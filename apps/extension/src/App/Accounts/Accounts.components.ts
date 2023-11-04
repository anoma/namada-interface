import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const AccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 420px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 8px;
  margin-bottom: 20px;
`;

export const AccountsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 8px;
  width: 100%;
`;

export const AccountsListItem = styled.li`
  padding: 2px 0;
  background-color: ${(props) => props.theme.colors.utility1.main80};
  color: ${(props) => props.theme.colors.utility1.main60};
`;

export const ThemedScrollbarContainer = styled.div`
  overflow-y: auto;

  /* Custom CSS Scrollbar for div containers*/
  /* NOTE - Firefox will only show max width on hover, otherwise is thin profile */
  scrollbar-width: ${spacement(2)};
  scrollbar-color: ${color("primary", "main")};

  &::-webkit-scrollbar {
    height: 12px;
    width: ${spacement(2)};
    background: transparent;
    box-shadow: none;
    -webkit-box-shadow: none;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${color("primary", "main")};
    border-radius: 1ex;
    -webkit-border-radius: 1ex;
    box-shadow: none;
    -webkit-box-shadow: none;
  }
`;
