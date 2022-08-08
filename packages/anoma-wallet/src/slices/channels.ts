import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Channel = string;

type ChannelsByChain = {
  [chainId: string]: Record<string, Channel[]>;
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
        chainId: string;
        channelId: string;
        destinationChainId: string;
      }>
    ) => {
      const { chainId, channelId, destinationChainId } = action.payload;

      if (!state.channelsByChain[chainId]) {
        state.channelsByChain[chainId] = {};
      }

      if (!state.channelsByChain[chainId][destinationChainId]) {
        state.channelsByChain[chainId][destinationChainId] = [];
      }

      const channels = state.channelsByChain[chainId][destinationChainId];

      if (channels.indexOf(channelId) === -1) {
        channels.push(channelId);
        state.channelsByChain[chainId][destinationChainId] = channels;
      }
    },
  },
});

const { actions, reducer } = channelsSlice;
export const { addChannel } = actions;

export default reducer;
