import styled from "styled-components/macro";

export const MainSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  // TODO: maybe this is too hacky? maybe there could be just another div
  // behind the main one with transform: translate(-4px, 4px);
  box-sizing: border-box;
  background-color: ${(props) => props.theme.colors.background2};
  padding: ${(props) =>
    props.theme.themeConfigurations.isLightMode ? "0 32px" : "4px 36px 0 32px"};
  height: 620px;
  width: 480px;
  border-radius: 24px;
  ${(props) =>
    props.theme.themeConfigurations.isLightMode
      ? `border: solid 4px ${props.theme.colors.border}`
      : ""};
  border-left: solid 8px ${(props) => props.theme.colors.border};
  border-bottom: solid 8px ${(props) => props.theme.colors.border};
  transition: background-color 0.3s linear;
`;

export const ImageSectionContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 60px 0 0 0;
`;
export const HeadlineSectionContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 60px 0 0 0;
`;

export const Headline = styled.h1`
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: 30px;
  font-weight: bold;
`;

export const BodyTextContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0 0 0;
  color: ${(props) => props.theme.colors.textPrimary};
`;
