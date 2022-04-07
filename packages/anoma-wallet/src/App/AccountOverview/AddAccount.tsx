import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  setEstablishedAddress,
  DerivedAccount,
  AccountsState,
} from "slices/accounts";
import { NewBlockEvents, SubscriptionEvents } from "lib/rpc/types";
import { useAppDispatch } from "store";
import { Config } from "config";

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

const { network, wsNetwork } = new Config();
const rpcClient = new RpcClient(network);
const socketClient = new SocketClient(wsNetwork);

const MIN_ALIAS_LENGTH = 2;

export const AddAccount = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const [alias, setAlias] = useState<string>("");
  const [aliasError, setAliasError] = useState<string>();
  const [tokenType, setTokenType] = useState<TokenType>("NAM");
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState("");
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
    setAlias(value);
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

  const aliasExists = (alias: string): boolean =>
    Object.values(derived).some((account) => account.alias === alias);

  const validateAlias = (alias: string): boolean =>
    alias.length > MIN_ALIAS_LENGTH &&
    !aliasExists(alias) &&
    !!alias.match(/^[a-z0-9\-\s]+$/i);

  useEffect(() => {
    // Ignore length validation for error messages as it's rather obvious
    if (alias.length > MIN_ALIAS_LENGTH && !validateAlias(alias)) {
      if (aliasExists(alias)) {
        setAliasError("Alias already exists. Please choose a different alias.");
      } else {
        setAliasError("Invalid characters in alias");
      }
    } else {
      setAliasError(undefined);
    }
  }, [alias]);

  // For development only:
  const loadFromFaucet = async (
    tokenType: TokenType,
    establishedAddress: string,
    privateKey: string
  ): Promise<void> => {
    setStatus("Loading tokens from faucet");
    const epoch = await rpcClient.queryEpoch();
    const transfer = await new Transfer().init();
    const { hash: transferHash, bytes: transferBytes } =
      await transfer.makeTransfer({
        source: FAUCET_ADDRESS,
        target: establishedAddress,
        amount: 1000,
        epoch,
        privateKey,
        token: `${Tokens[tokenType].address}`,
      });

    await socketClient.broadcastTx(transferHash, transferBytes, {
      onBroadcast: () => setStatus("Successfully connected to ledger"),
      onNext: () => {
        socketClient.disconnect();
        navigate(TopLevelRoute.Wallet);
      },
    });
  };

  const handleAddClick = async (): Promise<void> => {
    const trimmedAlias = alias.trim();

    if (!trimmedAlias || !validateAlias(trimmedAlias)) {
      return setAliasError("Invalid alias. Choose a different account alias.");
    }
    setStatus("Initializing new account...");
    setIsInitializing(true);
    const mnemonic = await new Session().seed();

    if (mnemonic && trimmedAlias) {
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
          alias: trimmedAlias,
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

          dispatch(
            setEstablishedAddress({
              alias: trimmedAlias,
              establishedAddress,
            })
          );
          socketClient.disconnect();

          // TODO: Preferably we should set a NODE_ENV variable on Netlify
          // to specify testing environments. This is a temporary measure:
          if (network.network.match(/testnet/)) {
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
          value={alias}
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
      {isInitializing && <p>{status}</p>}
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
