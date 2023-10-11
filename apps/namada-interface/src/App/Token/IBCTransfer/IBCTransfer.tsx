import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";

import { chains, cosmos, namada } from "@namada/chains";
import {
  Account as AccountType,
  BridgeType,
  Chain,
  Tokens,
  TokenType,
} from "@namada/types";
import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
  Option,
  Select,
} from "@namada/components";

import {
  useIntegrationConnection,
  useUntilIntegrationAttached,
} from "@namada/hooks";
import { useAppDispatch, useAppSelector } from "store";
import {
  Account,
  AccountsState,
  addAccounts,
  fetchBalances,
} from "slices/accounts";
import { ChannelsState } from "slices/channels";
import { SettingsState, setIsConnected } from "slices/settings";

import {
  ButtonsContainer,
  InputContainer,
} from "../TokenSend/TokenSendForm.components";
import { IBCTransferFormContainer } from "./IBCTransfer.components";
import { TxIbcTransferArgs } from "../types";
import { extensions } from "@namada/integrations";
import { IBCTransferChannelsForm } from "./IBCTransferChannelsForm";

export const submitIbcTransfer = async (
  ibcArgs: TxIbcTransferArgs
): Promise<void> => {
  const {
    account: { address, chainId, publicKey, type },
    token,
    target,
    amount,
    portId,
    channelId,
  } = ibcArgs;

  await extensions.namada.submitBridgeTransfer(
    {
      ibcProps: {
        tx: {
          token: Tokens.NAM.address || "",
          feeAmount: new BigNumber(0),
          gasLimit: new BigNumber(20_000),
          publicKey,
          chainId,
        },
        source: address,
        receiver: target,
        token,
        amount,
        portId,
        channelId,
      },
    },
    type
  );
};

const IBCTransfer = (): JSX.Element => {
  const dispatch = useAppDispatch();
  // State
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { selectedChannel } = useAppSelector<ChannelsState>(
    (state) => state.channels
  );
  const { connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );

  const [{ source, destination }, setChains] = useState<{
    source: Chain;
    destination: Chain;
  }>({
    source: namada,
    destination: cosmos,
  });
  const sourceChainId = source.chainId;
  const destinationChainId = destination.chainId;
  const sourceAccounts = Object.values(derived[sourceChainId]).filter(
    (account) => !account.details.isShielded
  );
  const destinationAccounts = Object.values(derived[destinationChainId]).filter(
    (account) => !account.details.isShielded
  );

  const [isFormValid, setIsFormValid] = useState(false);
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0));
  const [recipient, setRecipient] = useState("");
  const [sourceAccount, setSourceAccount] = useState<Account>(
    sourceAccounts[0]
  );
  const [token, setToken] = useState<TokenType>("NAM");

  const chainData = Object.values(chains)
    .filter((chain) => chain.bridgeType.includes(BridgeType.IBC))
    .map((chain) => ({
      value: chain.chainId,
      label: chain.alias,
    }));
  const [isKeplrConnected, setIsKeplrConnected] = useState(
    connectedChains.includes(source.chainId) &&
      connectedChains.includes(destination.chainId)
  );

  const currentBalance =
    sourceAccount?.balance[token as TokenType] || new BigNumber(0);

  const sourceTokenData: Option<string>[] = sourceAccounts.flatMap(
    ({ balance, details }) => {
      const { address, alias } = details;

      return Object.entries(balance).map(([tokenType, amount]) => {
        return {
          value: `${address}|${tokenType}`,
          label: `${alias !== "Namada" ? alias + " - " : ""}${
            Tokens[tokenType as TokenType].coin
          } (${amount} ${tokenType})`,
        };
      });
    }
  );
  const destinationAccountData = destinationAccounts.map(
    ({ details: { alias, address } }) => ({
      label: alias || "",
      value: address,
    })
  );

  // Integrations connection
  const [integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection(cosmos.extension.id);
  const extensionAttachStatus = useUntilIntegrationAttached(
    cosmos.extension.id
  );
  const currentExtensionAttachStatus =
    extensionAttachStatus[cosmos.extension.id];

  // Handlers
  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const handleChainChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    isSource: boolean
  ): void => {
    const target = chains[e.target.value];
    const other = Object.values(chains).filter((chain) => chain !== target)[0];
    const result = isSource
      ? { source: target, destination: other }
      : { source: other, destination: target };
    const { source, destination } = result;

    setChains(result);

    // Setting source information
    setToken(source.currency.symbol);
    setSourceAccount(Object.values(derived[source.chainId])[0]);

    // Setting target information
    setRecipient(
      Object.values(derived[destination.chainId])[0].details.address
    );
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;

    const [accountId, tokenSymbol] = value.split("|");
    const account = sourceAccounts.find(
      (account) => account?.details?.address === accountId
    ) as Account;

    setSourceAccount(account);
    setToken(tokenSymbol as TokenType);
  };

  const handleSubmit = (): void => {
    if (sourceAccount && token && selectedChannel && source.ibc) {
      submitIbcTransfer({
        account: sourceAccount.details,
        token: Tokens[token as TokenType],
        amount,
        chainId: sourceChainId,
        target: recipient,
        channelId: selectedChannel,
        portId: source.ibc.portId,
      });
    }
  };

  const handleConnectExtension = async (): Promise<void> => {
    withConnection(
      async () => {
        const accounts = await integration?.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts as AccountType[]));
          dispatch(fetchBalances(destinationChainId));
          dispatch(setIsConnected(destinationChainId));
        }
        setIsKeplrConnected(true);
      },
      async () => {
        setIsKeplrConnected(true);
      }
    );
  };

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Validation
  const isAmountValid = (amount: BigNumber, balance: BigNumber): boolean =>
    amount.isLessThan(balance);

  const validateForm = (): boolean => {
    return (
      (isAmountValid(amount, currentBalance) || amount.isZero()) &&
      Boolean(recipient) &&
      Boolean(selectedChannel)
    );
  };

  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [amount, recipient, destinationChainId, sourceAccount]);

  // Query Keplr accounts if connected
  useEffect(() => {
    const queryKeplr = async (): Promise<void> => {
      const accounts = await integration?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts as AccountType[]));
        dispatch(fetchBalances(destinationChainId));
        dispatch(setIsConnected(destinationChainId));
        // We are setting recipient after we query destination accounts
        setRecipient(accounts[0].address);
      }
    };
    if (isKeplrConnected) {
      queryKeplr();
    }
  }, []);

  return (
    <IBCTransferFormContainer>
      {!isKeplrConnected && (
        <Button
          variant={ButtonVariant.Contained}
          onClick={
            currentExtensionAttachStatus === "attached"
              ? handleConnectExtension
              : handleDownloadExtension.bind(null, cosmos.extension.url)
          }
          loading={
            currentExtensionAttachStatus === "pending" ||
            isConnectingToExtension
          }
          style={
            currentExtensionAttachStatus === "pending"
              ? { color: "transparent" }
              : {}
          }
        >
          {currentExtensionAttachStatus === "attached" ||
          currentExtensionAttachStatus === "pending"
            ? source.extension.id === "namada"
              ? `Load accounts from Keplr Extension`
              : `Connect to Keplr to perform a transfer`
            : `Click to download the Keplr extension`}
        </Button>
      )}
      <InputContainer>
        <Select<string>
          data={chainData}
          value={sourceChainId}
          label="Source Chain"
          onChange={(e) => handleChainChange(e, true)}
        />
      </InputContainer>

      {/* We only show the following section if we are doing a transfer from Namada or we are connected to Keplr */}
      {(source.extension.id === "namada" || isKeplrConnected) && (
        <>
          <InputContainer>
            <Select
              data={sourceTokenData}
              value={`${sourceAccount?.details?.address}|${token}`}
              label="Token"
              onChange={handleTokenChange}
            />
          </InputContainer>

          <InputContainer>
            <Select<string>
              data={chainData}
              value={destinationChainId}
              label="Destination Chain"
              onChange={(e) => handleChainChange(e, false)}
            />
          </InputContainer>
          <IBCTransferChannelsForm
            sourceChainId={sourceChainId}
            destinationChainId={destinationChainId}
          ></IBCTransferChannelsForm>

          <InputContainer>
            {destinationAccounts.length > 0 && (
              <Select
                label={"Recipient"}
                data={destinationAccountData}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            )}
            {destinationAccounts.length === 0 && (
              <Input
                variant={InputVariants.Text}
                label="Recipient"
                value={recipient}
                onChangeCallback={(e) => setRecipient(e.target.value)}
              />
            )}
          </InputContainer>

          <InputContainer>
            <Input
              variant={InputVariants.Number}
              label={"Amount"}
              value={amount.toString()}
              onChangeCallback={(e) => {
                const { value } = e.target;
                setAmount(new BigNumber(`${value}`));
              }}
              onFocus={handleFocus}
              error={
                isAmountValid(amount, currentBalance) || amount.isZero()
                  ? undefined
                  : "Invalid amount!"
              }
            />
          </InputContainer>

          <ButtonsContainer>
            <Button
              variant={ButtonVariant.Contained}
              disabled={!isFormValid}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </ButtonsContainer>
        </>
      )}
    </IBCTransferFormContainer>
  );
};

export default IBCTransfer;
