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
import {
  Symbols,
  TokenType,
  Tokens,
  TxResponse,
  FAUCET_ADDRESS,
} from "constants/";
import {
  Wallet,
  Account,
  Transfer,
  RpcClient,
  SocketClient,
  Session,
} from "lib";
import {
  addAccount,
  DerivedAccount,
  DerivedAccountsState,
  setEstablishedAddress,
} from "slices/accounts";
import { NewBlockEvents, SubscriptionEvents } from "lib/rpc/types";
import { useAppDispatch } from "store";
import { Config } from "config";
import { stringToHash } from "utils/helpers";

const { NODE_ENV, REACT_APP_ENV } = process.env;
const { network, wsNetwork } = new Config();
const rpcClient = new RpcClient(network);
const socketClient = new SocketClient(wsNetwork);

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

  const tokensData: Option<string>[] = Symbols.map((symbol: TokenType) => {
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
    alias.length > 2 &&
    !derived[stringToHash(alias)] &&
    alias.match(/^[a-z0-9\s]+$/i);

  // For development only:
  const loadFromFaucet = async (
    tokenType: TokenType,
    establishedAddress: string,
    privateKey: string
  ): Promise<void> => {
    const epoch = await rpcClient.queryEpoch();
    const transfer = await new Transfer().init();
    const { hash: transferHash, bytes: transferBytes } =
      await transfer.makeTransfer({
        source: FAUCET_ADDRESS,
        target: establishedAddress,
        amount: 10,
        epoch,
        privateKey,
        token: `${Tokens[tokenType].address}`,
      });

    await socketClient.broadcastTx(transferHash, transferBytes, {
      onNext: () => {
        socketClient.disconnect();
        navigate(TopLevelRoute.Wallet);
      },
    });
  };

  const handleAddClick = async (): Promise<void> => {
    if (!alias || !validateAlias(alias)) {
      return setAliasError("Invalid alias. Choose a different account alias.");
    }

    setIsInitializing(true);
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
      const epoch = await rpcClient.queryEpoch();

      // Create init-account transaction:
      const anomaAccount = await new Account().init();
      const { hash, bytes } = await anomaAccount.initialize({
        token: Tokens[tokenType].address,
        privateKey,
        epoch,
      });

      // Broadcast transaction to ledger:
      await socketClient.broadcastTx(hash, bytes, {
        onNext: (subEvent) => {
          const { events }: { events: NewBlockEvents } =
            subEvent as SubscriptionEvents;
          const initializedAccounts = events[TxResponse.InitializedAccounts];
          const establishedAddress = initializedAccounts
            .map((account: string) => JSON.parse(account))
            .find((account: string[]) => account.length > 0)[0];

          dispatch(setEstablishedAddress({ alias, establishedAddress }));
          socketClient.disconnect();

          if (NODE_ENV === "development" || REACT_APP_ENV === "development") {
            // LOAD SOME TOKENS FROM FAUCET
            loadFromFaucet(tokenType, establishedAddress, privateKey);
          } else {
            navigate(TopLevelRoute.Wallet);
          }
        },
        onError: (error) => {
          console.error(error);
          setError(error.toString());
          setIsInitializing(false);
        },
      });
    } else {
      setIsInitializing(false);
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
        disabled={!validateAlias(alias) || isInitializing}
      >
        Add
      </Button>
    </AccountOverviewContainer>
  );
};
