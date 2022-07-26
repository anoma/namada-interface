import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import Config from "config";

const chains = Object.values(Config.chain);

export type Channel = string;

type ChannelsByChain = {
  [chainId: string]: Channel[];
};

export type ChannelsState = {
  channelsByChain: ChannelsByChain;
};

const CHANNELS_ACTIONS_BASE = "channels";
const initialState: ChannelsState = {
  channelsByChain: chains.reduce((channelsByChain: ChannelsByChain, chain) => {
    const { id, ibc } = chain;

    if (ibc && ibc.length > 0) {
      channelsByChain[id] = ibc.map((ibcConfig) => ibcConfig.defaultChannel);
    }

    return channelsByChain;
  }, {}),
};

const channelsSlice = createSlice({
  name: CHANNELS_ACTIONS_BASE,
  initialState,
  reducers: {
    addChannel: (
      state,
      action: PayloadAction<{ chainId: string; channelId: string }>
    ) => {
      const { chainId, channelId } = action.payload;

      const channels = state.channelsByChain[chainId] || [];

      if (channels.indexOf(channelId) === -1) {
        channels.push(channelId);
        state.channelsByChain[chainId] = channels;
      }
    },
  },
});

const { actions, reducer } = channelsSlice;
export const { addChannel } = actions;

export default reducer;
