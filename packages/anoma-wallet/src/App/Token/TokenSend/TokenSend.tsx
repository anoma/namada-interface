import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TransferType } from "slices/transfers";
import { useAppSelector } from "store";
import { TopLevelRoute } from "App/types";
import {
  PAYMENT_ADDRESS_LENGTH,
  PAYMENT_ADDRESS_PREFIX,
  ESTABLISHED_ADDRESS_LENGTH,
  ESTABLISHED_ADDRESS_PREFIX,
} from "./types";

import TokenSendForm from "./TokenSendForm";

import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { Select } from "components/Select";
import { TokenSendContainer } from "./TokenSend.components";

export const parseTarget = (target: string): TransferType | undefined => {
  if (
    target.startsWith(PAYMENT_ADDRESS_PREFIX) &&
    target.length === PAYMENT_ADDRESS_LENGTH
  ) {
    return TransferType.Shielded;
  } else if (
    target.startsWith(ESTABLISHED_ADDRESS_PREFIX) &&
    target.length === ESTABLISHED_ADDRESS_LENGTH
  ) {
    return TransferType.NonShielded;
  }

  // likely we can unify the form errors and return an object describing the error here
  return undefined;
};

const TokenSend = (): JSX.Element => {
  const navigate = useNavigate();
  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >();

  const derivedAccounts = derived[chainId] || {};

  const transparentAndShieldedAccounts = {
    ...derivedAccounts,
    ...(shieldedAccounts[chainId] || {}),
  };

  const accountsData = Object.values(transparentAndShieldedAccounts).map(
    (account) => ({
      value: account.id,
      label: `${account.alias} (${account.tokenType})`,
    })
  );

  useEffect(() => {
    if (!selectedAccountId && accountsData.length > 0) {
      setSelectedAccountId(accountsData[0].value);
    }
  }, [accountsData, selectedAccountId]);

  return (
    <TokenSendContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(TopLevelRoute.Wallet);
        }}
      >
        <Heading level={HeadingLevel.One}>Token Send</Heading>
      </NavigationContainer>

      {accountsData.length > 0 && (
        <Select
          data={accountsData || []}
          value={selectedAccountId}
          label="Select an account to transfer from:"
          onChange={(e) => setSelectedAccountId(e.target.value)}
        />
      )}
      {selectedAccountId && <TokenSendForm accountId={selectedAccountId} />}
    </TokenSendContainer>
  );
};

export default TokenSend;
