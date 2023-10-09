import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";

import { chains } from "@namada/chains";
import {
  Account as AccountType,
  BridgeType,
  Chain,
  ExtensionKey,
  Extensions,
  Tokens,
  TokenType,
} from "@namada/types";
import {
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
  useIntegrationConnection,
  useUntilIntegrationAttached,
} from "@namada/hooks";
import { useAppDispatch, useAppSelector } from "store";
import { Account, AccountsState, addAccounts } from "slices/accounts";
import { addChannel, ChannelsState } from "slices/channels";
import { setIsConnected, SettingsState } from "slices/settings";

import {
  ButtonsContainer,
  InputContainer,
} from "../TokenSend/TokenSendForm.components";
import {
  AddChannelButton,
  IBCTransferFormContainer,
} from "./IBCTransfer.components";
import { TxIbcTransferArgs } from "../types";
import { extensions } from "@namada/integrations";

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
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
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

  const bridgedChains = Object.values(chains).filter(
    (chain: Chain) => chain.chainId !== chainId
  );

  const sourceChain = chains[bridgedChains[0]?.chainId] || null;
  const [selectedChainId, setSelectedChainId] = useState(
    sourceChain ? sourceChain.chainId : ""
  );
  const destinationChain = chains[selectedChainId];

  const selectDestinationChainData = bridgedChains.map((chain) => ({
    value: chain.chainId,
    label: chain.alias,
  }));

  const [integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection("namada");

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
  const [token, setToken] = useState<TokenType>();

  const chain = chains[chainId];
  const extensionAlias = Extensions[destinationChain.extension.id].alias;

  const extensionAttachStatus = useUntilIntegrationAttached("namada");
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
    ({ balance, details }) => {
      const { address, alias } = details;

      return Object.entries(balance).map(([tokenType, amount]) => {
        // If token isn't set, set it now
        if (!token && tokenType) {
          setToken(tokenType as TokenType);
        }
        return {
          value: `${address}|${tokenType}`,
          label: `${alias !== "Namada" ? alias + " - " : ""}${
            Tokens[tokenType as TokenType].coin
          } (${amount} ${tokenType})`,
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
      setCurrentBalance(sourceAccount.balance[token] || new BigNumber(0));
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
    if (sourceAccount && token) {
      submitIbcTransfer({
        account: sourceAccount.details,
        token: Tokens[token as TokenType],
        amount,
        chainId,
        target: recipient,
        channelId: selectedChannelId,
        portId,
      });
    }
  };

  const handleConnectExtension = async (): Promise<void> => {
    withConnection(
      async () => {
        const accounts = await integration?.accounts();
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
  };

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isAmountValid = (amount: BigNumber, balance: BigNumber): boolean =>
    amount.isLessThan(
      token === "ATOM" ? balance.multipliedBy(1_000_000) : balance
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
          <InputContainer>
            <Select
              data={tokenData}
              value={`${sourceAccount?.details?.address}|${token}`}
              label="Token"
              onChange={handleTokenChange}
            />
          </InputContainer>

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
                  onChangeCallback={(e) => {
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
                    ? handleConnectExtension
                    : handleDownloadExtension.bind(
                        null,
                        destinationChain.extension.url
                      )
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
                  ? `Load accounts from ${extensionAlias} Extension`
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
