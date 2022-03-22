import { useParams, useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsAccountSettingsContainer } from "./SettingsAccountSettings.components";

type SettingsAccountSettingsParams = {
  // account alias of the account to set up
  accountAlias?: string;
};

/**
 * lists the account settings and allows user to change them
 */
export const SettingsAccountSettings = (): JSX.Element => {
  const params = useParams<SettingsAccountSettingsParams>();
  const navigate = useNavigate();
  return (
    <SettingsAccountSettingsContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Account Settings</Heading>
      </NavigationContainer>

      <div> {params.accountAlias}</div>
      <a
        href="https://github.com/anoma/spec/blob/master/src/architecture/namada/web-wallet/user-interfaces.md#accountoverview-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        SettingsAccountSettings
      </a>
    </SettingsAccountSettingsContainer>
  );
};
