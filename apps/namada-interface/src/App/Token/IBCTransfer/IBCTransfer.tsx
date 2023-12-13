import { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";

import { chains, defaultChainId } from "@namada/chains";
import {
  Account as AccountType,
  BridgeType,
  Chain,
  CosmosTokens,
  CosmosTokenType,
  ExtensionKey,
  Extensions,
  Tokens,
  TokenType,
} from "@namada/types";
import {
  Alert,
  Button,
  ButtonVariant,
  Icon,
  IconName,
  Input,
  InputVariants,
  Option,
  Select,
} from "@namada/components";

import {
  getIntegration,
  useIntegrationConnection,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { useAppDispatch, useAppSelector } from "store";
import { Account, AccountsState, addAccounts } from "slices/accounts";
import { addChannel, ChannelsState } from "slices/channels";
import { setIsConnected } from "slices/settings";

import {
  ButtonsContainer,
  InputContainer,
} from "../TokenSend/TokenSendForm.components";
import {
  AddChannelButton,
  IBCTransferFormContainer,
} from "./IBCTransfer.components";
import { TxIbcTransferArgs } from "../types";

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
  const integration = getIntegration(chainId);

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
        token: Tokens.NAM.address || "",
        feeAmount: new BigNumber(0),
        gasLimit: new BigNumber(20_000),
        publicKey,
        chainId: chainId || defaultChainId,
      },
    },
    type
  );
};

const IBCTransfer = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const [error, setError] = useState<string>();
  const [currentBalance, setCurrentBalance] = useState(new BigNumber(0));
  const [chainId, setChainId] = useState(defaultChainId)
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

  const bridgedChains = Object.values(chains).filter(
    (chain: Chain) => chain.chainId !== chainId
  );

  const sourceChain = chains[chainId] || null;
  const [selectedChainId, setSelectedChainId] = useState(defaultChainId);
  const destinationChain = bridgedChains[0];

  const selectDestinationChainData = bridgedChains.map((chain) => ({
    value: chain.chainId,
    label: chain.alias,
  }));

  const [destinationIntegration, isDestinationConnectingToExtension, withDestinationConnection] =
    useIntegrationConnection(destinationChain.chainId);

  const [sourceIntegration, isSourceConnectingToExtension, withSourceConnection] =
    useIntegrationConnection(sourceChain.chainId);

  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0));
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);
  const [channelId, setChannelId] = useState<string>();
  const [recipient, setRecipient] = useState("");
  const [destinationAccounts, setDestinationAccounts] = useState<Account[]>([]);
  const [destinationAccountData, setDestinationAccountData] = useState<
    Option<string>[]
  >([]);

  const [sourceAccount, setSourceAccount] = useState<Account>();
  const [token, setToken] = useState<TokenType>(chains[defaultChainId].currency.symbol as TokenType);

  const chain = chains[chainId];
  const sourceExtensionAlias = Extensions[sourceChain.extension.id].alias;
  const destinationExtensionAlias = Extensions[destinationChain.extension.id].alias;

  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const channels =
    channelsByChain[chainId] && channelsByChain[chainId][selectedChainId]
      ? [...channelsByChain[chainId][selectedChainId]].reverse()
      : [];

  const selectChannelsData = channels.map((channel: string) => ({
    value: channel,
    label: channel,
  }));

  const accounts = Object.values(derived[chainId]);
  const sourceAccounts = accounts.filter(({ details }) => !details.isShielded);

  const tokenData: Option<string>[] = sourceAccounts.flatMap(
    ({ details, balance }) => {
      const { address, alias } = details;

      return Object.entries(balance)
        .filter(([_, amount]) => amount.isGreaterThan(0))
        .map(([tokenType, amount]) => {
          return {
            value: `${address}|${tokenType}`,
            label: `${alias} (${tokenType}): ${amount}`,
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
    const destinationAccounts = Object.values(derived[selectedChainId]).filter(
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
  }, [derived, selectedChainId]);

  useEffect(() => {
    // Set recipient to first destination account
    if (destinationAccounts?.length > 0) {
      setRecipient(destinationAccounts[0].details.address);
    }
  }, [selectedChainId, destinationAccounts]);

  useEffect(() => {
    if (bridgedChains.length > 0) {
      const selectedChain = bridgedChains[0].chainId;
      setSelectedChainId(selectedChain);
      setSourceAccount(sourceAccounts[0]);
    }
  }, [chainId]);

  useEffect(() => {
    // Set a default selectedChannelId if none are selected, but channels are available
    if (selectedChainId && !selectedChannelId) {
      const chains = channelsByChain[chainId] || {};
      const channels = chains[selectedChainId] || [];
      if (channels && channels.length > 0) {
        setSelectedChannelId(channels[channels.length - 1]);
      }
    }
  }, [selectedChainId, channelsByChain]);

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  // transform for select component
  const networks = Object.values(chains).map(({ chainId, alias }: Chain) => ({
    label: alias,
    value: chainId,
  }));

  const handleNetworkSelect = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value: chainId } = event.target;
    setChainId(chainId)
    setToken(chains[chainId].currency.symbol as TokenType)
  };

  const { portId = "transfer" } = sourceChain.ibc || {};
  const handleAddChannel = (): void => {
    if (channelId) {
      dispatch(
        addChannel({
          chainId,
          destinationChainId: selectedChainId,
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
    const tokens = sourceChain.chainId === defaultChainId ? Tokens : CosmosTokens;
    if (sourceAccount && token) {
      submitIbcTransfer({
        account: sourceAccount.details,
        token: tokens[token as TokenType & CosmosTokenType],
        amount,
        chainId,
        target: recipient,
        channelId: selectedChannelId,
        portId,
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
          dispatch(setIsConnected(chain.chainId));
        }

        setIsExtensionConnected({
          ...isExtensionConnected,
          [chain.extension.id]: true,
        });
      },
      async () => {
        setIsExtensionConnected({
          ...isExtensionConnected,
          [chain.extension.id]: false,
        });
      }
    );
  }, [chain]);

  const handleConnectDestinationExtension = useCallback(async (): Promise<void> => {
    withDestinationConnection(
      async () => {
        const accounts = await destinationIntegration?.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts as AccountType[]));
          dispatch(setIsConnected(chainId));
        }

        setIsExtensionConnected({
          ...isExtensionConnected,
          [chain.extension.id]: true,
        });
      },
      async () => {
        setIsExtensionConnected({
          ...isExtensionConnected,
          [chain.extension.id]: false,
        });
      }
    );
  }, [chain]);

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
    selectedChainId,
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
              value={chainId}
              data={networks}
              label="Source chain"
              onChange={handleNetworkSelect}
            />
          </InputContainer>
          {!isExtensionConnected[sourceChain.extension.id] &&
            sourceAccounts.length === 0 && (
              <Button
                variant={ButtonVariant.Contained}
                onClick={
                  currentExtensionAttachStatus === "attached"
                    ? handleConnectSourceExtension
                    : handleDownloadExtension.bind(
                      null,
                      destinationChain.extension.url
                    )
                }
                loading={
                  currentExtensionAttachStatus === "pending" ||
                  isSourceConnectingToExtension
                }
                style={
                  currentExtensionAttachStatus === "pending"
                    ? { color: "transparent" }
                    : {}
                }
              >
                {currentExtensionAttachStatus === "attached" ||
                  currentExtensionAttachStatus === "pending"
                  ? `Load accounts from ${sourceExtensionAlias} Extension`
                  : "Click to download the extension"}
              </Button>
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
              value={selectedChainId}
              label="Destination Chain"
              onChange={(e) => {
                setRecipient("");
                setSelectedChainId(e.target.value);
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
                  <Icon iconName={IconName.Plus} />
                  <span>Add IBC Transfer Channel</span>
                </AddChannelButton>
              )}
            </InputContainer>
          )}

          {destinationChain.bridgeType.indexOf(BridgeType.IBC) > -1 &&
            showAddChannelForm && (
              <InputContainer>
                <Input
                  variant={InputVariants.Text}
                  label="Add Channel ID"
                  value={channelId}
                  onChange={(e) => {
                    const { value } = e.target;
                    setChannelId(value);
                  }}
                  onFocus={handleFocus}
                  error={
                    channels.indexOf(`${channelId}`) > -1
                      ? "Channel exists!"
                      : undefined
                  }
                />
                <Button
                  variant={ButtonVariant.Contained}
                  style={{ width: 160 }}
                  onClick={handleAddChannel}
                  disabled={!channelId}
                >
                  Add
                </Button>
                <Button
                  variant={ButtonVariant.Contained}
                  style={{ width: 160 }}
                  onClick={() => setShowAddChannelForm(false)}
                >
                  Cancel
                </Button>
              </InputContainer>
            )}
          {!isExtensionConnected[chain.extension.id] &&
            destinationAccounts.length === 0 && (
              <Button
                variant={ButtonVariant.Contained}
                onClick={
                  currentExtensionAttachStatus === "attached"
                    ? handleConnectDestinationExtension
                    : handleDownloadExtension.bind(
                        null,
                        destinationChain.extension.url
                      )
                }
                loading={
                  currentExtensionAttachStatus === "pending" ||
                  isDestinationConnectingToExtension
                }
                style={
                  currentExtensionAttachStatus === "pending"
                    ? { color: "transparent" }
                    : {}
                }
              >
                {currentExtensionAttachStatus === "attached" ||
<<<<<<< HEAD
                  currentExtensionAttachStatus === "pending"
                  ? `Load accounts from ${destinationExtensionAlias} Extension`
=======
                currentExtensionAttachStatus === "pending"
                  ? `Load accounts from ${extensionAlias} Extension`
>>>>>>> 2512b43d (feat: reduce bundle size #1)
                  : "Click to download the extension"}
              </Button>
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
                variant={InputVariants.Text}
                label="Recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            )}
          </InputContainer>

          <InputContainer>
            <Input
              variant={InputVariants.Number}
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
