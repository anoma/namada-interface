import { useState } from "react";
import { ChannelsState, addChannel, selectChannel } from "slices/channels";
import { useAppDispatch, useAppSelector } from "store";
import { InputContainer } from "../TokenSend/TokenSendForm.components";
import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  Input,
  InputVariants,
  Select,
} from "@namada/components";
import { AddChannelButton } from "./IBCTransfer.components";

type Props = {
  sourceChainId: string;
  destinationChainId: string;
};

export const IBCTransferChannelsForm = ({
  sourceChainId,
  destinationChainId,
}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { channelsByChain, selectedChannel } = useAppSelector<ChannelsState>(
    (state) => state.channels
  );
  const [channelId, setChannelId] = useState<string>();
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);

  const channels = channelsByChain?.[sourceChainId]?.[destinationChainId]
    ? [...channelsByChain[sourceChainId][destinationChainId]].reverse()
    : [];

  const selectChannelsData = channels.map((channel: string) => ({
    value: channel,
    label: channel,
  }));

  const handleAddChannel = (): void => {
    if (channelId) {
      dispatch(
        addChannel({
          chainId: sourceChainId,
          destinationChainId,
          channelId,
        })
      );
      dispatch(selectChannel(channelId));
      setShowAddChannelForm(false);
      setChannelId("");
    }
  };

  const handleSelectChannel = (channelId: string): void => {
    dispatch(selectChannel(channelId));
  };

  return (
    <>
      <InputContainer>
        {channels.length > 0 && (
          <Select<string>
            data={selectChannelsData}
            value={selectedChannel || channels[0]}
            label="IBC Transfer Channel"
            onChange={(e) => handleSelectChannel(e.target.value)}
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
            onFocus={(e) => e.target.select()}
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
    </>
  );
};
