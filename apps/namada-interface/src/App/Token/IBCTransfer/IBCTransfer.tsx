import { useEffect, useState } from "react";

import { chains } from "@anoma/chains";
import { BridgeType, Chain, Tokens, TokenType } from "@anoma/types";
import { useAppDispatch, useAppSelector } from "store";
import { Account, AccountsState, fetchBalances } from "slices/accounts";
import { addChannel, ChannelsState } from "slices/channels";
import {
  clearErrors,
  clearEvents,
  submitIbcTransferTransaction,
  TransfersState,
} from "slices/transfers";
import { SettingsState } from "slices/settings";

import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  Input,
  InputVariants,
  Option,
  Select,
} from "@anoma/components";
import {
  ButtonsContainer,
  InputContainer,
  StatusMessage,
} from "../TokenSend/TokenSendForm.components";
import {
  AddChannelButton,
  IBCTransferFormContainer,
} from "./IBCTransfer.components";
import { Address } from "../Transfers/TransferDetails.components";

const IBCTransfer = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { channelsByChain = {} } = useAppSelector<ChannelsState>(
    (state) => state.channels
  );
  const { isBridgeTransferSubmitting, transferError, events } =
    useAppSelector<TransfersState>((state) => state.transfers);

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

  const channels =
    channelsByChain[chainId] && channelsByChain[chainId][selectedChainId]
      ? channelsByChain[chainId][selectedChainId]
      : [];

  const selectChannelsData = channels.map((channel: string) => ({
    value: channel,
    label: channel,
  }));

  const [amount, setAmount] = useState(0);
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);
  const [channelId, setChannelId] = useState<string>();
  const [recipient, setRecipient] = useState("");
  const accounts = Object.values(derived[chainId]);

  const destinationAccounts = Object.values(derived[selectedChainId]).filter(
    (account) => !account.details.isShielded
  );
  const destinationAccountsData = destinationAccounts.map(
    ({ details: { alias, address } }) => ({
      label: alias || "",
      value: address,
    })
  );

  const sourceAccounts = accounts.filter(({ details }) => !details.isShielded);

  const [sourceAccount, setSourceAccount] = useState(sourceAccounts[0]);

  const tokenData: Option<string>[] = sourceAccounts.flatMap(
    ({ balance, details }) => {
      const { address, alias } = details;

      return Object.entries(balance).map(([tokenType, amount]) => ({
        value: `${address}|${tokenType}`,
        label: `${alias !== "Namada" ? alias + " - " : ""}${
          Tokens[tokenType as TokenType].coin
        } (${amount} ${tokenType})`,
      }));
    }
  );

  const [token, setToken] = useState<TokenType>("NAM");

  const currentBalance =
    sourceAccounts.find(
      ({ details }) => details.address === sourceAccount?.details.address
    )?.balance[token] || 0;

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const { portId = "transfer" } = sourceChain.ibc || {};

  useEffect(() => {
    return () => {
      dispatch(clearEvents());
      dispatch(clearErrors());
    };
  }, []);

  useEffect(() => {
    if (destinationAccounts.length > 0) {
      setRecipient(destinationAccounts[0].details.address);
    }
  }, [selectedChainId]);

  useEffect(() => {
    if (bridgedChains.length > 0) {
      const selectedChain = bridgedChains[0].chainId;
      setSelectedChainId(selectedChain);
      setSourceAccount(sourceAccounts[0]);
    }
  }, [chainId]);

  useEffect(() => {
    if (sourceAccount && !isBridgeTransferSubmitting) {
      dispatch(fetchBalances());
    }
  }, [isBridgeTransferSubmitting]);

  useEffect(() => {
    // Set a default selectedChannelId if none are selected, but channels are available
    if (selectedChainId && !selectedChannelId) {
      const chains = channelsByChain[chainId] || {};
      const channels = chains[selectedChainId] || [];
      if (channels && channels.length > 0) {
        setSelectedChannelId(channels[0]);
      }
    }
  }, [selectedChainId, channelsByChain]);

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
    dispatch(
      submitIbcTransferTransaction({
        account: sourceAccount.details,
        token,
        amount,
        chainId,
        target: recipient,
        channelId: selectedChannelId,
        portId,
      })
    );
  };

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

          <InputContainer>
            {destinationAccounts.length > 0 && (
              <Select
                label={"Recipient"}
                data={destinationAccountsData}
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
              value={amount}
              onChangeCallback={(e) => {
                const { value } = e.target;
                setAmount(parseFloat(`${value}`));
              }}
              onFocus={handleFocus}
              error={amount <= currentBalance ? undefined : "Invalid amount!"}
            />
          </InputContainer>

          {isBridgeTransferSubmitting && <p>Submitting bridge transfer...</p>}
          {transferError && (
            <pre style={{ overflow: "auto" }}>{transferError}</pre>
          )}
          {events && (
            <>
              <StatusMessage>
                Successfully submitted bridge transfer! It will take some time
                for the receiver to see an updated balance.
              </StatusMessage>
              <StatusMessage>Gas used: {events.gas}</StatusMessage>
              <StatusMessage>Applied hash:</StatusMessage>
              <Address>{events.appliedHash}</Address>
            </>
          )}
          <ButtonsContainer>
            <Button
              variant={ButtonVariant.Contained}
              disabled={
                amount > currentBalance ||
                amount === 0 ||
                !recipient ||
                isBridgeTransferSubmitting ||
                !(destinationChain.bridgeType.indexOf(BridgeType.IBC) > -1
                  ? selectedChannelId
                  : true)
              }
              onClick={handleSubmit}
            >
              Continue
            </Button>
          </ButtonsContainer>
        </>
      )}
    </IBCTransferFormContainer>
  );
};

export default IBCTransfer;
