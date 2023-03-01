import { useEffect, useState } from "react";

import { chains } from "@anoma/chains";
import { Chain, Tokens, TokenType } from "@anoma/types";
import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, fetchBalances } from "slices/accounts";
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
  const { isIbcTransferSubmitting, transferError, events } =
    useAppSelector<TransfersState>((state) => state.transfers);

  /* const chain = Object.values(chains).find((chain: Chain) => chain.chainId === chainId); */
  const ibc = Object.values(chains).filter(
    (chain: Chain) => chain.chainId !== chainId
  );

  const defaultIbcChain = chains[ibc[0]?.chainId] || null;
  const [selectedChainId, setSelectedChainId] = useState(
    defaultIbcChain ? defaultIbcChain.chainId : ""
  );

  const selectDestinationChainData = ibc.map((ibcChain) => ({
    value: ibcChain.chainId,
    label: ibcChain.alias,
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

  const accountsWithBalance = Object.values(derived[chainId]).filter(
    ({ account }) => account.isShielded
  );

  const { account } = accountsWithBalance[0] || { account: {} };
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    account.address || ""
  );

  const tokenData: Option<string>[] = accountsWithBalance.flatMap(
    ({ balance, account }) => {
      const { address, alias } = account;

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
    accountsWithBalance.find(
      ({ account }) => account.address === selectedAccountAddress
    )?.balance[token] || 0;

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const { portId = "transfer" } = defaultIbcChain.ibc || {};

  useEffect(() => {
    return () => {
      dispatch(clearEvents());
      dispatch(clearErrors());
    };
  }, []);

  useEffect(() => {
    if (ibc.length > 0) {
      const selectedChain = ibc[0].chainId;
      setSelectedChainId(selectedChain);
    }
  }, [chainId]);

  useEffect(() => {
    if (account && !isIbcTransferSubmitting) {
      dispatch(fetchBalances());
    }
  }, [isIbcTransferSubmitting]);

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

    setSelectedAccountAddress(accountId);
    setToken(tokenSymbol as TokenType);
  };

  const handleSubmit = (): void => {
    dispatch(
      submitIbcTransferTransaction({
        account,
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
      {!defaultIbcChain && (
        <p>This chain is not configured to connect over IBC!</p>
      )}
      {defaultIbcChain && (
        <>
          <InputContainer>
            <Select
              data={tokenData}
              value={`${selectedAccountAddress}|${token}`}
              label="Token"
              onChange={handleTokenChange}
            />
          </InputContainer>

          <InputContainer>
            <Select<string>
              data={selectDestinationChainData}
              value={selectedChainId}
              label="Destination Chain"
              onChange={(e) => setSelectedChainId(e.target.value)}
            />
          </InputContainer>
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

          {showAddChannelForm && (
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
            <Input
              variant={InputVariants.Text}
              label={"Recipient"}
              value={recipient}
              onChangeCallback={(e) => {
                const { value } = e.target;
                setRecipient(value);
              }}
            />
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

          {isIbcTransferSubmitting && <p>Submitting IBC Transfer</p>}
          {transferError && (
            <pre style={{ overflow: "auto" }}>{transferError}</pre>
          )}
          {events && (
            <>
              <StatusMessage>
                Successfully submitted IBC transfer! It will take some time for
                the receiver to see an updated balance.
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
                isIbcTransferSubmitting ||
                !selectedChannelId
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
