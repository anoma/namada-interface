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

export const ImageContainer = styled.div`
  margin: 0 0 48px;
`;
