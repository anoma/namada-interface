import { RootState } from "./store";

export const mockAppState: RootState = {
  channels: {
    channelsByChain: {
      "namada-test.1e670ba91369ec891fc": {
        "namada-test.89060614ce340f4baae": ["channel-0"],
      },
      "namada-test.89060614ce340f4baae": {
        "namada-test.1e670ba91369ec891fc": ["channel-0"],
      },
    },
  },
  settings: {
    connectedChains: [],
  },
};
