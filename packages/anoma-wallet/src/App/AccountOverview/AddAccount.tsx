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
import { useContext, useState } from "react";
import { TokenType, Tokens, TxResponse } from "constants/";
import { AppContext } from "App/App";
import { Wallet, Account, RpcClient, SocketClient } from "lib";
import {
  addAccount,
  DerivedAccount,
  setEstablishedAddress,
} from "slices/accounts";
import { NewBlockEvents, SubscriptionEvents } from "lib/rpc/types";
import { useAppDispatch } from "store/store";

export const AddAccount = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { derived } = useAppSelector((state) => state.accounts);
  const navigate = useNavigate();
  const [alias, setAlias] = useState<string | undefined>();
  const [tokenType, setTokenType] = useState<TokenType>("BTC");
  const context = useContext(AppContext) || {};
  const { seed } = context;

  const tokensData: Option<string>[] = Object.keys(Tokens).map(
    (type: string) => {
      const token = Tokens[type];

      return {
        label: `${token.coin} - ${token.symbol}`,
        value: type,
      };
    }
  );

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
  ): number => {
    const accountsForType = accounts.filter(
      (account: DerivedAccount) => account.tokenType === tokenType
    );
    return accountsForType.length;
  };

  const validateAlias = (alias: string): boolean => !derived[alias];

  const handleAddClick = async (): Promise<void> => {
    if (seed && alias && validateAlias(alias)) {
      const wallet = await new Wallet(seed, tokenType).init();
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
      const network = {
        network: "localhost",
        port: 26657,
      };
      const rpcClient = new RpcClient(network);
      const epoch = await rpcClient.queryEpoch();

      // Create init-account transaction:
      const anomaAccount = await new Account().init();
      const { hash, bytes } = await anomaAccount.initialize({
        token: Tokens[tokenType].address,
        publicKey,
        privateKey,
        epoch,
      });

      // Broadcast transaction to ledger:
      const socketClient = new SocketClient({ ...network, protocol: "ws" });

      await socketClient.broadcastTx(hash, bytes, {
        onNext: (subEvent) => {
          const { events }: { events: NewBlockEvents } =
            subEvent as SubscriptionEvents;
          const initializedAccounts = events[TxResponse.InitializedAccounts];
          const establishedAddress = initializedAccounts[0].replaceAll(
            /\[|\]|"/g,
            ""
          );
          dispatch(setEstablishedAddress({ alias, establishedAddress }));
          navigate(TopLevelRoute.Wallet);
          socketClient.disconnect();
        },
        onError: (error) => console.error(error),
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
        />
      </InputContainer>

      <InputContainer>
        <Select
          data={tokensData}
          onChange={handleTokenSelect}
          value={tokenType}
        ></Select>
      </InputContainer>
      <Button variant={ButtonVariant.Contained} onClick={handleAddClick}>
        Add
      </Button>
    </AccountOverviewContainer>
  );
};
