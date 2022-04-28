type Chain = {
  chainId: string;
  portId: string;
  channelId: string;
};

type IBCConfig = {
  chains: Record<string, Chain>;
};

const IBCConfig: IBCConfig = {
  chains: {
    default: {
      // TODO: Set this per testnet or production values:
      chainId: "anoma-test.dad7978021a160c616d",
      portId: "transfer",
      channelId: "channel-0",
    },
  },
};

export default IBCConfig;
