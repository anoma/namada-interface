import { useEffect, useState } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist/lib/types";

import { useAppDispatch, useAppSelector } from "store";
import {
  AccountsState,
  submitInitAccountTransaction,
  addAccount,
} from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TopLevelRoute } from "App/types";

import { DerivedAccounts } from "./DerivedAccounts";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import {
  AccountOverviewContainer,
  AccountOverviewContent,
  AccountTab,
  AccountTabsContainer,
  ButtonsWrapper,
  HeadingContainer,
  NoAccountsContainer,
  TotalAmount,
  TotalAmountFiat,
  TotalAmountValue,
  TotalContainer,
  TotalHeading,
} from "./AccountOverview.components";
import { ButtonsContainer } from "App/AccountCreation/Steps/Completion/Completion.components";
import Config from "config";
import { Session, Wallet } from "lib";

type Props = {
  password: string;
  persistor: Persistor;
};

export const AccountOverview = ({
  persistor,
  password,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const currency = useAppSelector<SettingsState>(
    (state) => state.settings.fiatCurrency
  );

  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { faucet, accountIndex } = Config.chain[chainId] || {};

  const [total, setTotal] = useState(0);
  const [runCreateAccount, setRunCreateAccount] = useState(false);

  const derivedAccounts = derived[chainId] || {};
  const accounts = Object.values(derivedAccounts);

  useEffect(() => {
    // If a faucet is defined for this chain, run the account
    // create process (which will detect if any accounts are
    // available, then create one if not):
    if (faucet) {
      setRunCreateAccount(true);
    }
  }, []);

  useEffect(() => {
    // If there are no accounts for this chain, and a faucet is defined,
    // create one now:
    if (runCreateAccount && accounts.length === 0 && faucet) {
      (async () => {
        const mnemonic = await Session.getSeed(password);
        const wallet = await new Wallet(mnemonic || "", "NAM").init();
        const account = wallet.new(accountIndex, 0);
        const { public: publicKey, secret: signingKey, wif: address } = account;

        dispatch(
          addAccount({
            address,
            alias: "Namada",
            chainId,
            publicKey,
            signingKey,
            tokenType: "NAM",
            isInitial: true,
          })
        );
      })();
      // NOTE: This can occur when a new config is pushed to an existing app
      // containing new chain definitions, as they didn't exist during the
      // initial account creation process.
    }
  }, [chainId, accounts, runCreateAccount]);

  // Collect uninitialized transparent accounts
  const uninitializedAccounts = accounts.filter(
    (account) => !account.establishedAddress && !account.isInitializing
  );

  useEffect(() => {
    // Initialize accounts sequentially
    // Each rerender will initialize the next in this batch
    if (uninitializedAccounts.length > 0) {
      dispatch(submitInitAccountTransaction(uninitializedAccounts[0]));
    }
  }, [uninitializedAccounts]);

  return (
    <AccountOverviewContainer>
      <PersistGate loading={"Loading accounts..."} persistor={persistor}>
        <AccountTabsContainer>
          <AccountTab className={"active"}>Fungible</AccountTab>
          <AccountTab className={"disabled"}>Non-Fungible</AccountTab>
        </AccountTabsContainer>
        <AccountOverviewContent>
          <HeadingContainer>
            <div>
              <Heading level={HeadingLevel.Four}>Your wallet</Heading>
              <TotalHeading>
                <Heading level={HeadingLevel.One}>Total Balance</Heading>
              </TotalHeading>
            </div>
            <TotalContainer>
              {(derived[chainId] || shieldedAccounts[chainId]) && (
                <TotalAmount>
                  <TotalAmountFiat>{currency}</TotalAmountFiat>
                  <TotalAmountValue>{total}</TotalAmountValue>
                </TotalAmount>
              )}
            </TotalContainer>
          </HeadingContainer>

          {derived[chainId] || shieldedAccounts[chainId] ? (
            <ButtonsContainer>
              <ButtonsWrapper>
                <Button
                  variant={ButtonVariant.Contained}
                  onClick={() => navigate(TopLevelRoute.TokenSend)}
                >
                  Send
                </Button>
                <Button
                  variant={ButtonVariant.Contained}
                  onClick={() => navigate(TopLevelRoute.TokenReceive)}
                >
                  Receive
                </Button>
              </ButtonsWrapper>
            </ButtonsContainer>
          ) : (
            <div />
          )}
          {!derived[chainId] && !shieldedAccounts[chainId] && (
            <NoAccountsContainer>
              <p>You have no accounts on this chain!</p>

              <Button
                variant={ButtonVariant.Contained}
                onClick={() => navigate(TopLevelRoute.WalletAddAccount)}
              >
                Create an Account
              </Button>
            </NoAccountsContainer>
          )}
          <DerivedAccounts setTotal={setTotal} />
        </AccountOverviewContent>
      </PersistGate>
    </AccountOverviewContainer>
  );
};
