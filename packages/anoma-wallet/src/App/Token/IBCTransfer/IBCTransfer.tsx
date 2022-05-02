import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AccountsState, fetchBalanceByAccount } from "slices/accounts";
import { useAppDispatch, useAppSelector } from "store";
import Config from "config";

import { Input, InputVariants } from "components/Input";
import { isMemoValid, MAX_MEMO_LENGTH } from "../TokenSend/TokenSendForm";
import {
  ButtonsContainer,
  InputContainer,
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
import { addChannel, ChannelsState } from "slices/channels";

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

  const { chain } = Config;
  const defaultChain = Object.values(chain)[0];

  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [selectedChainId, setSelectedChain] = useState(defaultChain.id);
  const [selectedChannelId, setSelectedChannel] = useState("");
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);
  const [channelId, setChannelId] = useState<string>();

  const account = derived[id] || {};
  const { balance = 0, tokenType } = account;

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const chains = Object.values(chain);
  const selectChainData = chains.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const channels = channelsByChain[selectedChainId] || [];
  const selectChannelsData = channels.map((channel: string) => ({
    value: channel,
    label: `${chain[selectedChainId].name} - ${channel}`,
  }));

  useEffect(() => {
    if (account) {
      // fetch latest balance
      dispatch(fetchBalanceByAccount(account));
    }
  }, []);

  const handleAddChannel = (): void => {
    if (channelId) {
      dispatch(
        addChannel({
          chainId: selectedChainId,
          channelId,
        })
      );
      setShowAddChannelForm(false);
      setSelectedChannel(channelId);
      setChannelId("");
    }
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

        {channels.length > 0 ? (
          <Select<string>
            data={selectChannelsData}
            value={selectedChannelId}
            label="IBC Transfer Channel"
            onChange={(e) => setSelectedChannel(e.target.value)}
          />
        ) : (
          <p>No IBC Channels</p>
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
            label="Channel ID"
            value={channelId}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setChannelId(value);
            }}
            onFocus={handleFocus}
            error={amount <= balance ? undefined : "Invalid amount!"}
          />
          <Button variant={ButtonVariant.Small} onClick={handleAddChannel}>
            Add
          </Button>
          <Button
            variant={ButtonVariant.Small}
            onClick={() => setShowAddChannelForm(false)}
          >
            Cancel
          </Button>
        </InputContainer>
      )}
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

      <ButtonsContainer>
        <Button
          variant={ButtonVariant.Contained}
          disabled={amount > balance || amount === 0 || !isMemoValid(memo)}
          onClick={() => console.log("submit")}
        >
          Send
        </Button>
      </ButtonsContainer>
    </IBCTransferFormContainer>
  );
};

export default IBCTransfer;
