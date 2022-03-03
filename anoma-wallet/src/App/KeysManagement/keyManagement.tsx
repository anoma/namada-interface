import { useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  MainSectionContainer,
  TopSection,
  HeadlineSectionContainer,
  Headline,
} from "./keyManagement.components";
import { useNavigate } from "react-router-dom";
import { Button } from "components/Button";
import { Icon, IconName } from "components/Icon";

function KeyManagement(): JSX.Element {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const backButtonIconStrokeColor = themeContext.themeConfigurations.isLightMode
    ? themeContext.colors.border
    : "black";
  return (
    <MainSectionContainer>
      <TopSection>
        <Button
          onClick={() => {
            navigate("/");
          }}
          style={{ padding: "0" }}
        >
          <Icon
            iconName={IconName.ChevronLeft}
            strokeColorOverride={backButtonIconStrokeColor}
          />
        </Button>
      </TopSection>
      <HeadlineSectionContainer>
        <Headline>Key Management</Headline>
      </HeadlineSectionContainer>
    </MainSectionContainer>
  );
}

export default KeyManagement;
