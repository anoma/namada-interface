import { useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import {
  AccountOverviewContainer,
  InputContainer,
} from "./AccountOverview.components";
import { useAppSelector } from "store";
import { Button, ButtonVariant } from "components/Button";
import { TopLevelRoute } from "App/types";
import { Select, Option } from "components/Select";
import { Input, InputVariants } from "components/Input";
import { useState } from "react";
import { TokenType, Tokens, TxResponse } from "constants/";
import { Wallet, Account, RpcClient, SocketClient, Session } from "lib";
import {
  addAccount,
  DerivedAccount,
  DerivedAccountsState,
  setEstablishedAddress,
} from "slices/accounts";
import { NewBlockEvents, SubscriptionEvents } from "lib/rpc/types";
import { useAppDispatch } from "store";
import { Symbols } from "constants/tokens";
import { Config } from "config";

export const AddAccount = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { derived } = useAppSelector<DerivedAccountsState>(
    (state) => state.accounts
  );
  const [alias, setAlias] = useState<string>("");
  const [aliasError, setAliasError] = useState<string>();
  const [tokenType, setTokenType] = useState<TokenType>("NAM");
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string>();

  const tokensData: Option<string>[] = Symbols.map((symbol: string) => {
    const token = Tokens[symbol];

    return {
      label: `${token.coin} - ${token.symbol}`,
      value: symbol,
    };
  });

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setAlias(value.trim());
  };

  const handleTokenSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    setTokenType(value as TokenType);
  };

  const getAccountIndex = (
    accounts: DerivedAccount[],
    tokenType: string
  ): number =>
    accounts.filter(
      (account: DerivedAccount) => account.tokenType === tokenType
    ).length;

  const validateAlias = (alias: string): boolean =>
    alias.length > 2 && !derived[alias] && alias.match(/^[a-z0-9\s]+$/i);

  const handleAddClick = async (): Promise<void> => {
    if (!alias || !validateAlias(alias)) {
      return setAliasError("Invalid alias. Choose a different account alias.");
    }

    const mnemonic = await new Session().seed();

    if (mnemonic && alias) {
      setAliasError(undefined);
      const wallet = await new Wallet(mnemonic, tokenType).init();
      const index = getAccountIndex(
        Object.keys(derived).map((key: string) => derived[key]),
        tokenType
      );

      const account = wallet.new(index);
      const { public: publicKey, secret: privateKey, wif: address } = account;

      dispatch(
        addAccount({
          alias,
          tokenType,
          address,
          publicKey,
          signingKey: privateKey,
        })
      );

      // Query epoch:
      const { network, wsNetwork } = new Config();
      const rpcClient = new RpcClient(network);
      const epoch = await rpcClient.queryEpoch();

      // Create init-account transaction:
      const anomaAccount = await new Account().init();
      const { hash, bytes } = await anomaAccount.initialize({
        token: Tokens[tokenType].address,
        privateKey,
        epoch,
      });

      // Broadcast transaction to ledger:
      const socketClient = new SocketClient(wsNetwork);

      await socketClient.broadcastTx(hash, bytes, {
        onBroadcast: () => setIsInitializing(true),
        onNext: (subEvent) => {
          const { events }: { events: NewBlockEvents } =
            subEvent as SubscriptionEvents;
          const initializedAccounts = events[TxResponse.InitializedAccounts];

          const establishedAddress = initializedAccounts
            .map((account: string) => JSON.parse(account))
            .find((account: string[]) => account.length > 0)[0];

          dispatch(setEstablishedAddress({ alias, establishedAddress }));
          navigate(TopLevelRoute.Wallet);
          socketClient.disconnect();
        },
        onError: (error) => {
          console.error(error);
          setError(error.toString());
          setIsInitializing(false);
        },
      });
    }
  };

  return (
    <AccountOverviewContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(TopLevelRoute.Wallet);
        }}
      >
        <Heading level={HeadingLevel.One}>Add Account</Heading>
      </NavigationContainer>
      <InputContainer>
        <Input
          variant={InputVariants.Text}
          label="Account Alias"
          onChangeCallback={handleAliasChange}
          error={aliasError}
        />
      </InputContainer>

      <InputContainer>
        <Select
          data={tokensData}
          label={"Select Token"}
          value={tokenType}
          onChange={handleTokenSelect}
        ></Select>
      </InputContainer>
      {isInitializing && <p>Initializing new account...</p>}
      {error && <p>{error}</p>}
      <Button
        variant={ButtonVariant.Contained}
        onClick={handleAddClick}
        disabled={!validateAlias(alias)}
      >
        Add
      </Button>
    </AccountOverviewContainer>
  );
};
