import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { AccountOverviewContainer } from "./AccountOverview.components";

import { useAppSelector, store } from "store";

const persistor = persistStore(store);

export const AccountOverview = (): JSX.Element => {
  const { derived } = useAppSelector((state) => state.accounts);

  return (
    <AccountOverviewContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>AccountOverview</Heading>
      </NavigationContainer>
      <a
        // eslint-disable-next-line max-len
        href="https://github.com/anoma/spec/blob/master/src/architecture/namada/web-wallet/user-interfaces.md#accountoverview-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        AccountOverview
      </a>
      <PersistGate loading={null} persistor={persistor}>
        {Object.keys(derived).map((key: string, i: number) => {
          return <p key={i}>{key}</p>;
        })}
      </PersistGate>
    </AccountOverviewContainer>
  );
};
