import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { AccountOverviewContainer } from "./AccountOverview.components";

export const AccountOverview = (): JSX.Element => {
  return (
    <AccountOverviewContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>AccountOverview</Heading>
      </NavigationContainer>
      <a
        href="https://github.com/anoma/spec/blob/master/src/architecture/namada/web-wallet/user-interfaces.md#accountoverview-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        AccountOverview
      </a>
    </AccountOverviewContainer>
  );
};
