import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import { Spinner } from "App/App.components";
import styled from "styled-components";

export const CompletionViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

export const BodyText = styled.p`
  text-align: center;
  font-weight: 300;
  color: ${(props) => props.theme.colors.utility2.main80};
`;

export const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StatusLoader = styled.div`
  position: relative;
  width: 20px;
  height: 20px;

  &.is-loading::after {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    ${Spinner}
  }
`;

export const DownloadPanel = styled.div`
  color: ${color("utility2", "main")};
  display: flex;
  flex-direction: column;
  font-size: ${fontSize("base")};
  font-weight: 500;
  gap: ${spacement(3)};
  text-align: center;
`;

export const WarningPanel = styled.aside`
  background-color: ${color("utility1", "main75")};
  border-radius: ${borderRadius("md")};
  color: ${color("utility2", "main")};
  font-weight: 500;
  font-size: ${fontSize("base")};
  line-height: 1.25;
  padding: ${spacement(5)} ${spacement(8)};

  p {
    margin: 0;
  }
`;

export const WarningPanelTitle = styled.strong`
  color: ${color("primary", "main")};
  display: block;
  font-weight: 600;
  margin-bottom: ${spacement(2)};
  text-transform: uppercase;
`;

export const ImageContainer = styled.div`
  margin: 0 0 48px;
`;
