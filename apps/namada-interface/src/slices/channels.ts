import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Channel = string;

type ChannelsByChain = {
  [chainKey: string]: Record<string, Channel[]>;
};

export type ChannelsState = {
  channelsByChain: ChannelsByChain;
};

const CHANNELS_ACTIONS_BASE = "channels";
const initialState: ChannelsState = {
  channelsByChain: {},
};

const channelsSlice = createSlice({
  name: CHANNELS_ACTIONS_BASE,
  initialState,
  reducers: {
    addChannel: (
      state,
      action: PayloadAction<{
        sourceChainKey: string;
        channelId: string;
        destinationChainKey: string;
      }>
    ) => {
      const { sourceChainKey, channelId, destinationChainKey } = action.payload;

      if (!state.channelsByChain[sourceChainKey]) {
        state.channelsByChain[sourceChainKey] = {};
      }

      if (!state.channelsByChain[sourceChainKey][destinationChainKey]) {
        state.channelsByChain[sourceChainKey][destinationChainKey] = [];
      }

      const channels =
        state.channelsByChain[sourceChainKey][destinationChainKey];

      if (channels.indexOf(channelId) === -1) {
        channels.push(channelId);
        state.channelsByChain[sourceChainKey][destinationChainKey] = channels;
      }
    },
  },
});

const { actions, reducer } = channelsSlice;
export const { addChannel } = actions;

export default reducer;
