import { setChainId, SettingsState } from "slices/settings";

import { useAppDispatch, useAppSelector } from "store";
import Config, { Chain } from "config";
import { ColorModeContainer, OnlyInMedium } from "./topNavigation.components";
import { Toggle } from "components/Toggle";
import { useNavigate } from "react-router-dom";
import { Icon, IconName } from "components/Icon";
import { TopLevelRoute } from "App/types";
import { Select } from "components/Select";
import {
  SettingsButton,
  TopNavigationLoggedInContainer,
  TopNavigationLoggedInControlsContainer,
  TopNavigationLoggedInSelectContainer,
} from "./topNavigationLoggedIn.components";

type Props = {
  isLightMode: boolean;
  setIsLightMode: (isLightMode: boolean) => void;
};

const TopNavigationLoggedIn = ({
  isLightMode,
  setIsLightMode,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const chains = Object.values(Config.chain);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  const networks = Object.values(chains).map(({ id, alias }: Chain) => ({
    label: alias,
    value: id,
  }));

  const handleNetworkSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value } = e.target;

    dispatch(setChainId(value));
  };

  return (
    <TopNavigationLoggedInContainer>
      <OnlyInMedium>
        <TopNavigationLoggedInControlsContainer>
          <SettingsButton
            onClick={() => {
              navigate(`${TopLevelRoute.Settings}`);
            }}
          >
            <Icon iconName={IconName.Settings} />
          </SettingsButton>
          <ColorModeContainer>
            <Toggle
              checked={isLightMode}
              onClick={() => {
                setIsLightMode(!isLightMode);
              }}
            />
          </ColorModeContainer>
        </TopNavigationLoggedInControlsContainer>
      </OnlyInMedium>

      <TopNavigationLoggedInSelectContainer>
        <Select
          value={chainId}
          data={networks}
          onChange={handleNetworkSelect}
          style={{
            borderColor: isLightMode ? undefined : "#444",
            borderRadius: 24,
            height: 30,
            padding: "0 8px",
          }}
        />
      </TopNavigationLoggedInSelectContainer>
    </TopNavigationLoggedInContainer>
  );
};

export default TopNavigationLoggedIn;
