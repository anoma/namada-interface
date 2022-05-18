import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "store";
import Config from "config";
import { AccountsState, fetchBalanceByAccount } from "slices/accounts";
import { addChannel, ChannelsState } from "slices/channels";
import {
  clearErrors,
  clearEvents,
  submitIbcTransferTransaction,
  TransfersState,
} from "slices/transfers";

import { Input, InputVariants } from "components/Input";
import { isMemoValid, MAX_MEMO_LENGTH } from "../TokenSend/TokenSendForm";
import {
  ButtonsContainer,
  InputContainer,
  StatusMessage,
} from "../TokenSend/TokenSendForm.components";
import {
  AddChannelButton,
  IBCTransferFormContainer,
} from "./IBCTransfer.components";
import { Select } from "components/Select";
import { TopLevelRoute } from "App/types";
import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { Icon, IconName } from "components/Icon";
import { Button, ButtonVariant } from "components/Button";
import { Address } from "../Transfers/TransferDetails.components";

type UrlParams = {
  id: string;
};

const IBCTransfer = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id = "" } = useParams<UrlParams>();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { channelsByChain = {} } = useAppSelector<ChannelsState>(
    (state) => state.channels
  );
  const { isIbcTransferSubmitting, transferError, events } =
    useAppSelector<TransfersState>((state) => state.transfers);
  const { chain } = Config;
  const defaultChain = Object.values(chain)[0];
  const [selectedChainId, setSelectedChain] = useState(defaultChain.id);
  const channels = channelsByChain[selectedChainId] || [];
  const selectChannelsData = channels.map((channel: string) => ({
    value: channel,
    label: channel,
  }));

  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);
  const [channelId, setChannelId] = useState<string>();
  const [recipient, setRecipient] = useState("");
  const account = derived[id] || {};
  const { balance = 0, tokenType } = account;

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const chains = Object.values(chain);
  const selectChainData = chains.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const { ibcPortId: portId = "transfer" } = chain[selectedChainId];

  useEffect(() => {
    return () => {
      dispatch(clearEvents());
      dispatch(clearErrors());
    };
  }, []);

  useEffect(() => {
    if (account && !isIbcTransferSubmitting) {
      dispatch(fetchBalanceByAccount(account));
    }
  }, [isIbcTransferSubmitting]);

  useEffect(() => {
    // Set a default selectedChannelId if none are selected, but channels are available
    if (selectedChainId && !selectedChannelId) {
      const channels = channelsByChain[selectedChainId];
      if (channels && channels.length > 0) {
        setSelectedChannelId(channels[0]);
      }
    }
  }, [selectedChainId, channelsByChain]);

  const handleAddChannel = (): void => {
    if (channelId) {
      dispatch(
        addChannel({
          chainId: selectedChainId,
          channelId,
        })
      );
      setShowAddChannelForm(false);
      setSelectedChannelId(channelId);
      setChannelId("");
    }
  };

  const handleSubmit = (): void => {
    dispatch(
      submitIbcTransferTransaction({
        account,
        amount,
        memo,
        target: recipient,
        channelId: selectedChannelId,
        portId,
      })
    );
  };

  return (
    <IBCTransferFormContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          if (id) {
            return navigate(-1);
          }
          navigate(TopLevelRoute.Wallet);
        }}
      >
        <Heading level={HeadingLevel.One}>IBC Transfer</Heading>
      </NavigationContainer>
      <p>
        <strong>
          {balance} {tokenType}
        </strong>
      </p>
      <InputContainer>
        <Select<string>
          data={selectChainData}
          value={selectedChainId}
          label="Destination Chain"
          onChange={(e) => setSelectedChain(e.target.value)}
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
            error={amount <= balance ? undefined : "Invalid amount!"}
          />
          <Button
            variant={ButtonVariant.Small}
            style={{ width: 160 }}
            onClick={handleAddChannel}
            disabled={!channelId}
          >
            Add
          </Button>
          <Button
            variant={ButtonVariant.Small}
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
          label="Recipient"
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
          label="Amount"
          value={amount}
          onChangeCallback={(e) => {
            const { value } = e.target;
            setAmount(parseFloat(`${value}`));
          }}
          onFocus={handleFocus}
          error={amount <= balance ? undefined : "Invalid amount!"}
        />
      </InputContainer>

      <InputContainer>
        <Input
          variant={InputVariants.Textarea}
          label="Memo (Optional)"
          value={memo}
          error={
            isMemoValid(memo)
              ? ""
              : `Must be less than ${MAX_MEMO_LENGTH} characters`
          }
          onChangeCallback={(e) => setMemo(e.target.value)}
        />
      </InputContainer>

      {isIbcTransferSubmitting && <p>Submitting IBC Transfer</p>}
      {transferError && <p>{transferError}</p>}
      {events && (
        <>
          <StatusMessage>
            Successfully submitted IBC transfer! It will take some time for the
            receiver to see an updated balance.
          </StatusMessage>
          <StatusMessage>Gas used: {events.gas}</StatusMessage>
          <StatusMessage>
            Applied hash: <Address>{events.appliedHash}</Address>
          </StatusMessage>
        </>
      )}
      <ButtonsContainer>
        <Button
          variant={ButtonVariant.Contained}
          disabled={
            amount > balance ||
            amount === 0 ||
            !isMemoValid(memo) ||
            !recipient ||
            isIbcTransferSubmitting ||
            !selectedChannelId
          }
          onClick={handleSubmit}
        >
          Send
        </Button>
      </ButtonsContainer>
    </IBCTransferFormContainer>
  );
};

export default IBCTransfer;
