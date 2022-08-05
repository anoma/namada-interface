import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import IBCConfig from "config/ibc";

const { REACT_APP_LOCAL, NODE_ENV } = process.env;
const ENV = REACT_APP_LOCAL || NODE_ENV ? "development" : "production";

export type Channel = string;

type ChannelsByChain = {
  [chainId: string]: Channel[];
};

export type ChannelsState = {
  channelsByChain: ChannelsByChain;
};

const CHANNELS_ACTIONS_BASE = "channels";
const initialState: ChannelsState = {
  channelsByChain: IBCConfig[ENV].reduce(
    (channelsByChain: ChannelsByChain, ibcConfig) => {
      const { chainId, defaultChannel } = ibcConfig;
      channelsByChain[chainId] = [defaultChannel];
      return channelsByChain;
    },
    {}
  ),
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
