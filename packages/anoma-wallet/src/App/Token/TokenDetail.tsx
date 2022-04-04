import { TopLevelRoute } from "App/types";
import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { useParams, useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { DerivedAccount, DerivedAccountsState } from "slices/accounts";
import { BalancesState } from "slices/balances";
import { useAppSelector } from "store";
import { formatRoute } from "utils/helpers";
import { TokenDetailContainer } from "./TokenDetail.components";

type Props = {
  persistor: Persistor;
};

type TokenDetailsParams = {
  hash: string;
};

const TokenDetail = ({ persistor }: Props): JSX.Element => {
  const navigate = useNavigate();
  const { hash = "" } = useParams<TokenDetailsParams>();
  const { derived } = useAppSelector<DerivedAccountsState>(
    (state) => state.accounts
  );
  const { accountBalances } = useAppSelector<BalancesState>(
    (state) => state.balances
  );

  const account: DerivedAccount = derived[hash] || {};
  const { alias, address, establishedAddress } = account;
  const { token } = accountBalances;

  return (
    <TokenDetailContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Token Details</Heading>
      </NavigationContainer>
      <PersistGate loading={"Loading token details..."} persistor={persistor}>
        <p>Alias:</p>
        <pre>{alias}</pre>
        <p>Address:</p>
        <pre>{address}</pre>
        <p>Established Address:</p>
        <pre style={{ width: "100%", overflow: "auto" }}>
          {establishedAddress}
        </pre>
        <p>Balance:</p>
        <pre>{token}</pre>
        <Button
          onClick={() => {
            navigate(
              formatRoute(TopLevelRoute.SettingsAccountSettings, { hash })
            );
          }}
          variant={ButtonVariant.Contained}
        >
          Settings
        </Button>
      </PersistGate>
    </TokenDetailContainer>
  );
};

export default TokenDetail;
