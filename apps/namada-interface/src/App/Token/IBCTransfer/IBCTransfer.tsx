import { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";

import { chains } from "@namada/chains";
import {
  Account as AccountType,
  BridgeType,
  Chain,
  CosmosTokens,
  CosmosTokenType,
  ExtensionKey,
  Extensions,
  TokenType,
  Tokens,
  ChainKey,
} from "@namada/types";
import {
  Alert,
  ActionButton,
  Icon,
  Input,
  Option,
  Select,
  Stack,
} from "@namada/components";
import {
  getIntegration,
  useIntegrationConnection,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { useAppDispatch, useAppSelector } from "store";
import { Account, AccountsState, addAccounts } from "slices/accounts";
import { ChannelsState, addChannel } from "slices/channels";
import { setIsConnected } from "slices/settings";

import {
  ButtonsContainer,
  InputContainer,
} from "../TokenSend/TokenSendForm.components";
import { TxIbcTransferArgs } from "../types";
import {
  AddChannelButton,
  IBCTransferFormContainer,
} from "./IBCTransfer.components";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
  tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export const submitIbcTransfer = async (
  chainKey: ChainKey,
  ibcArgs: TxIbcTransferArgs
): Promise<void> => {
  const {
    account: { address, chainId, publicKey, type },
    token,
    target,
    amount,
    portId,
    channelId,
    nativeToken,
  } = ibcArgs;
  const integration = getIntegration(chainKey);

  return await integration.submitBridgeTransfer(
    {
      ibcProps: {
        source: address,
        receiver: target,
        token,
        amount,
        portId,
        channelId,
      },
      txProps: {
        token: nativeToken || tokenAddress,
        feeAmount: new BigNumber(0),
        gasLimit: new BigNumber(20_000),
        publicKey,
        chainId,
      },
    },
    type
  );
};

const IBCTransfer = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const chain = useAppSelector<Chain>((state) => state.chain.config);
  const [memo, setMemo] = useState<string>();
  const [error, setError] = useState<string>();
  const [currentBalance, setCurrentBalance] = useState(new BigNumber(0));
  const { channelsByChain = {} } = useAppSelector<ChannelsState>(
    (state) => state.channels
  );
  const [isExtensionConnected, setIsExtensionConnected] = useState<
    Record<ExtensionKey, boolean>
  >({
    namada: false,
    keplr: false,
    metamask: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const [sourceChainId, setSourceChainId] = useState(chains.namada.chainId)
  const sourceChain: Chain = Object.values(chains)
    .find((chain: Chain) => chain.chainId === sourceChainId) || chains.namada;

  const ibcChains = Object.values(chains).filter(
    (chain: Chain) => chain.chainId !== sourceChainId && chain.bridgeType.includes(BridgeType.IBC)
  );

  const [destinationChainId, setDestinationChainId] = useState(ibcChains[0].chainId);
  const destinationChain = ibcChains[0];

  const selectDestinationChainData = ibcChains.map((chain) => ({
    value: chain.chainId,
    label: chain.alias,
  }));

  const [sourceIntegration, _isSourceConnectingToExtension, withSourceConnection] =
    useIntegrationConnection(sourceChain.id);

  const [destinationIntegration, _isDestinationConnectingToExtension, withDestinationConnection] =
    useIntegrationConnection(destinationChain.id);

  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0));
  // TODO: Clean this up:
  const defaultChannelId = channelsByChain[sourceChain.id]
    && channelsByChain[sourceChain.id][destinationChain.id].length > 0
    ? channelsByChain[sourceChain.id][destinationChain.id][0] : ""
  const [selectedChannelId, setSelectedChannelId] = useState(defaultChannelId);
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);
  const [channelId, setChannelId] = useState<string>();
  const [recipient, setRecipient] = useState("");
  const [destinationAccounts, setDestinationAccounts] = useState<Account[]>([]);
  const [destinationAccountData, setDestinationAccountData] = useState<
    Option<string>[]
  >([]);

  const [sourceAccount, setSourceAccount] = useState<Account>();
  const [token, setToken] = useState<TokenType>(chains.namada.currency.symbol as TokenType);

  const extensionAttachStatus = useUntilIntegrationAttached(sourceChain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[sourceChain.extension.id];

  const channels =
    channelsByChain[sourceChain.id] && channelsByChain[sourceChain.id][destinationChain.id]
      ? [...channelsByChain[sourceChain.id][destinationChain.id]].reverse()
      : [];

  const selectChannelsData = channels.map((channel: string) => ({
    value: channel,
    label: channel,
  }));

  const accounts = Object.values(derived[sourceChain.id]);
  const sourceAccounts = accounts.filter(({ details }) => !details.isShielded);

  const tokenData: Option<string>[] = sourceAccounts.flatMap(
    ({ details, balance }) => {
      const { address, alias } = details;

      return Object.entries(balance)
        .filter(([_, amount]) => amount.isGreaterThan(0))
        .map(([tokenType, amount]) => {
          return {
            value: `${address}|${tokenType}`,
            label: `${alias} (${Tokens[tokenType as TokenType].symbol}): ${amount}`,
          };
        });
    }
  );

  useEffect(() => {
    if (sourceAccounts.length > 0) {
      setSourceAccount(sourceAccounts[0]);
    }
  }, [sourceAccounts]);

  useEffect(() => {
    if (sourceAccount && token) {
      setCurrentBalance(sourceAccount.balance[token as TokenType] || new BigNumber(0));
      setToken(token)
    }
  }, [sourceAccount, token]);

  useEffect(() => {
    const chain = Object.values(chains).find((chain) => chain.chainId === destinationChainId);
    if (!chain) return;

    const destinationAccounts = Object.values(derived[chain.id]).filter(
      (account) => !account.details.isShielded
    );
    setDestinationAccounts(destinationAccounts);
    const destinationAccountsData = destinationAccounts.map(
      ({ details: { alias, address } }) => ({
        label: alias || "",
        value: address,
      })
    );
    setDestinationAccountData(destinationAccountsData);
  }, [derived, destinationChainId]);

  useEffect(() => {
    // Set recipient to first destination account
    if (destinationAccounts?.length > 0) {
      setRecipient(destinationAccounts[0].details.address);
    }
  }, [destinationChainId, destinationAccounts]);

  useEffect(() => {
    if (ibcChains.length > 0) {
      setDestinationChainId(ibcChains[0].chainId);
      setSourceAccount(sourceAccounts[0]);
    }
  }, [sourceChainId]);

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  // transform for select component
  const networks = Object.values(chains)
    .filter((chain) => chain.bridgeType.includes(BridgeType.IBC))
    .map(({ chainId, alias }: Chain) => ({
      label: alias,
      value: chainId,
    }));

  const handleNetworkSelect = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value: chainId } = event.target;
    setSourceChainId(chainId)
    setToken(sourceChain.currency.symbol as TokenType)
  };

  const { portId = "transfer" } = sourceChain.ibc || {};
  const handleAddChannel = (): void => {
    if (channelId) {
      dispatch(
        addChannel({
          sourceChainKey: sourceChain.id,
          destinationChainKey: destinationChain.id,
          channelId,
        })
      );
      setShowAddChannelForm(false);
      setSelectedChannelId(channelId);
      setChannelId("");
    }
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
    setError(undefined)
    const tokens = sourceChain.id === "namada" ? Tokens : CosmosTokens;
    if (sourceAccount && token) {
      submitIbcTransfer(sourceChain.id, {
        account: sourceAccount.details,
        token: tokens[token as TokenType & CosmosTokenType],
        amount,
        chainId: sourceChainId,
        target: recipient,
        channelId: selectedChannelId,
        portId,
        nativeToken: chain.currency.address || tokenAddress,
        memo,
      }).catch((e) => {
        setError(`${e}`)
      })
    }
  };

  const handleConnectSourceExtension = useCallback(async (): Promise<void> => {
    withSourceConnection(
      async () => {
        const accounts = await sourceIntegration?.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts as AccountType[]));
          dispatch(setIsConnected(sourceChain.id));
        }

        setIsExtensionConnected({
          ...isExtensionConnected,
          [sourceChain.extension.id]: true,
        });
      },
      async () => {
        setIsExtensionConnected({
          ...isExtensionConnected,
          [sourceChain.extension.id]: false,
        });
      }
    );
  }, [sourceChain]);

  const handleConnectDestinationExtension = useCallback(async (): Promise<void> => {
    withDestinationConnection(
      async () => {
        const accounts = await destinationIntegration?.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts as AccountType[]));
          dispatch(setIsConnected(destinationChain.id));
        }

        setIsExtensionConnected({
          ...isExtensionConnected,
          [destinationChain.extension.id]: true,
        });
      },
      async () => {
        setIsExtensionConnected({
          ...isExtensionConnected,
          [destinationChain.extension.id]: false,
        });
      }
    );
  }, [sourceChain]);

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isAmountValid = (amount: BigNumber, balance: BigNumber): boolean =>
    amount.isLessThan(
      token === "DOT" ? balance.multipliedBy(1_000_000) : balance
    );

  const validateForm = (): boolean => {
    // Validate IBC requirements if selected as bridge type
    if (destinationChain.bridgeType.includes(BridgeType.IBC)) {
      if (!selectedChannelId) {
        return false;
      }
    }

    if (!isAmountValid(amount, currentBalance) || amount.isZero()) {
      return false;
    }

    // Validate recipient
    if (!recipient) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [
    amount,
    currentBalance,
    destinationChain,
    recipient,
    sourceChainId,
    destinationChainId,
    selectedChannelId,
    sourceAccount,
  ]);

  return (
    <IBCTransferFormContainer>
      {sourceChain && (
        <>
          {error && <Alert type="error">{error}</Alert>}
          <InputContainer>
            <Select
              value={sourceChainId}
              data={networks}
              label="Source chain"
              onChange={handleNetworkSelect}
            />
          </InputContainer>
          {!isExtensionConnected[sourceChain.extension.id] &&
            sourceAccounts.length === 0 && (
              <ActionButton
                onClick={
                  currentExtensionAttachStatus === "attached"
                    ? handleConnectSourceExtension
                    : handleDownloadExtension.bind(
                      null,
                      destinationChain.extension.url
                    )
                }
                style={
                  currentExtensionAttachStatus === "pending"
                    ? { color: "transparent" }
                    : {}
                }
              >
                {currentExtensionAttachStatus === "attached" ||
                  currentExtensionAttachStatus === "pending"
                  ? `Load accounts from ${Extensions[sourceChain.extension.id].alias} Extension`
                  : "Click to download the extension"}
              </ActionButton>
            )}

          {tokenData.length > 0
            ? <InputContainer>
              <Select
                data={tokenData}
                value={`${sourceAccount?.details?.address}|${token}`}
                label="Token"
                onChange={handleTokenChange}
              />
            </InputContainer>
            : sourceAccounts.length > 0
              ? <Alert type="warning">You have no token balances</Alert>
              : null
          }

          <InputContainer>
            <Select<string>
              data={selectDestinationChainData}
              value={destinationChainId}
              label="Destination Chain"
              onChange={(e) => {
                setRecipient("");
                setDestinationChainId(e.target.value);
              }}
            />
          </InputContainer>
          {destinationChain.bridgeType.indexOf(BridgeType.IBC) > -1 && (
            <InputContainer>
              {channels.length > 0 && (
                <Select<string>
                  data={selectChannelsData}
                  value={selectedChannelId}
                  label="IBC Transfer Channel"
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                />
              )}

              {!showAddChannelForm && (
                <AddChannelButton onClick={() => setShowAddChannelForm(true)}>
                  <Icon name="PlusCircle" />
                  <span>Add IBC Transfer Channel</span>
                </AddChannelButton>
              )}
            </InputContainer>
          )}

          {destinationChain.bridgeType.indexOf(BridgeType.IBC) > -1 &&
            showAddChannelForm && (
              <Stack direction="vertical" gap={8} style={{ marginBottom: 20 }}>
                <Input
                  label="Add Channel ID"
                  value={channelId}
                  onChange={(e) => {
                    const { value } = e.target;
                    setChannelId(value);
                  }}
                  onFocus={handleFocus}
                  error={
                    channels.includes(`${channelId}`)
                      ? "Channel exists!"
                      : undefined
                  }
                />
                <Stack direction="horizontal" gap={6} >
                  <ActionButton
                    onClick={handleAddChannel}
                    disabled={!channelId}
                  >
                    Add
                  </ActionButton>
                  <ActionButton
                    onClick={() => setShowAddChannelForm(false)}
                  >
                    Cancel
                  </ActionButton>
                </Stack>

              </Stack>
            )}
          {!isExtensionConnected[destinationChain.extension.id] &&
            destinationAccounts.length === 0 && (
              <ActionButton
                onClick={
                  currentExtensionAttachStatus === "attached"
                    ? handleConnectDestinationExtension
                    : handleDownloadExtension.bind(
                      null,
                      destinationChain.extension.url
                    )
                }
                style={
                  currentExtensionAttachStatus === "pending"
                    ? { color: "transparent" }
                    : {}
                }
              >
                {currentExtensionAttachStatus === "attached" ||
                  currentExtensionAttachStatus === "pending"
                  ? `Load accounts from ${Extensions[destinationChain.extension.id].alias} Extension`
                  : "Click to download the extension"}
              </ActionButton>
            )}

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
                label="Recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            )}
          </InputContainer>

          <InputContainer>
            <Input
              type="number"
              label={"Amount"}
              value={amount.toString()}
              onChange={(e) => {
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

          <InputContainer>
            <Input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} label="Memo" />
          </InputContainer>

          <ButtonsContainer>
            <ActionButton
              disabled={!isFormValid}
              onClick={handleSubmit}
            >
              Submit
            </ActionButton>
          </ButtonsContainer>
        </>
      )
      }
    </IBCTransferFormContainer >
  );
};

export default IBCTransfer;
