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
import {
  TokenSendContainer,
  TokenSendTab,
  TokenSendTabsGroup,
  TokenSendContent,
} from "./TokenSend.components";
import { Button, ButtonVariant } from "components/Button";
import { Icon, IconName } from "components/Icon";

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
  const { derived, shieldedAccounts: allShieldedAccounts } =
    useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >();

  const [selectedShieldedAccountId, setSelectedShieldedAccountId] = useState<
    string | undefined
  >();

  const accounts = derived[chainId] || {};

  const shieldedAccounts = allShieldedAccounts[chainId] || {};

  const accountsData = Object.values(accounts).map((account) => ({
    value: account.id,
    label: `${account.alias} (${account.tokenType})`,
  }));

  const shieldedAccountsData = Object.values(shieldedAccounts).map(
    (shieldedAccount) => ({
      value: shieldedAccount.id,
      label: `${shieldedAccount.alias} (${shieldedAccount.tokenType})`,
    })
  );

  const tabs = ["Shielded", "Transparent"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    if (!selectedAccountId && accountsData.length > 0) {
      setSelectedAccountId(accountsData[0].value);
    }
  }, [accountsData, selectedAccountId]);

  return (
    <TokenSendContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Send</Heading>
      </NavigationContainer>

      <TokenSendTabsGroup>
        {tabs.map((tab) => (
          <TokenSendTab
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </TokenSendTab>
        ))}
      </TokenSendTabsGroup>

      {activeTab === "Shielded" && (
        <TokenSendContent>
          {shieldedAccountsData.length > 0 && (
            <Select
              data={shieldedAccountsData || []}
              value={selectedShieldedAccountId}
              label="Select an account to transfer from:"
              onChange={(e) => setSelectedShieldedAccountId(e.target.value)}
            />
          )}
        </TokenSendContent>
      )}

      {activeTab === "Transparent" && (
        <TokenSendContent>
          {accountsData.length > 0 && (
            <Select
              data={accountsData || []}
              value={selectedAccountId}
              label="Token:"
              onChange={(e) => setSelectedAccountId(e.target.value)}
            />
          )}
          {selectedAccountId && <TokenSendForm accountId={selectedAccountId} />}
        </TokenSendContent>
      )}

      {/* TODO: No button, just chevron with appropriate color! */}
      <Button
        onClick={() => navigate(TopLevelRoute.Wallet)}
        variant={ButtonVariant.Contained}
        style={{ padding: 4 }}
      >
        <Icon iconName={IconName.ChevronLeft} />
      </Button>
    </TokenSendContainer>
  );
};

export default TokenSend;
