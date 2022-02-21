import React from "react";
import { Image, ImageName } from "../../components/Image";
import { Icon, IconName } from "../../components/Icon";
import { Toggle } from "../../components/Toggle";
import {
  TopNavigationContainer,
  LeftSection,
  RightSection,
  HelpButton,
  HelpIconContainer,
  HelpTextContainer,
  ColorModeContainer,
} from "./styledComponents";

type TopNavigationProps = {
  isLightMode: boolean;
  setIsLightMode: React.Dispatch<React.SetStateAction<boolean>>;
};

function TopNavigation(props: TopNavigationProps): JSX.Element {
  const { isLightMode, setIsLightMode } = props;
  const circleElementEnabled = (
    <Icon iconName={IconName.Sun} strokeColor="#17171d" />
  );
  const circleElementDisabled = (
    <Icon iconName={IconName.Moon} strokeColor="#17171d" fillColor="#17171d" />
  );

  return (
    <TopNavigationContainer className="App">
      <LeftSection>
        <Image
          imageName={ImageName.Logo}
          styleOverrides={{ maxWidth: "128px" }}
        />
      </LeftSection>

      <RightSection>
        {/* TODO: extract to Button component*/}
        <HelpButton
          onClick={() => {
            alert("Help not implemented yet");
          }}
        >
          <HelpIconContainer>
            <Icon iconName={IconName.HelpCircle} />
          </HelpIconContainer>
          <HelpTextContainer>Help</HelpTextContainer>
        </HelpButton>
        <ColorModeContainer>
          <Toggle
            checked={isLightMode}
            onClick={() => {
              setIsLightMode((isLightMode) => !isLightMode);
            }}
            circleElementEnabled={circleElementEnabled}
            circleElementDisabled={circleElementDisabled}
          />
        </ColorModeContainer>
      </RightSection>
    </TopNavigationContainer>
  );
}

export default TopNavigation;
