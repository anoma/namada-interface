import BigNumber from "bignumber.js";

import { chains } from "@namada/chains";
import { AccountType } from "@namada/types";
import { StakingOrUnstakingState } from "slices/StakingAndGovernance";
import { RootState } from "./store";

export const mockAppState: RootState = {
  accounts: {
    derived: {
      namada: {
        tnam1q8gpzlamqksqjagt2xs3p6tnfcldy0fcd53fs4jh: {
          details: {
            chainId: "namada-masp-1.5.32ccad5356012a7",
            alias: "Namada",
            address: "tnam1q8gpzlamqksqjagt2xs3p6tnfcldy0fcd53fs4jh",
            isShielded: false,
            type: AccountType.PrivateKey,
            chainKey: "namada",
          },
          balance: {
            NAM: new BigNumber(1000),
            DOT: new BigNumber(1000),
            ETH: new BigNumber(1000),
          },
        },
      },
      cosmos: {},
      ethereum: {},
    },
  },
  chain: { config: chains.namada },
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
    fiatCurrency: "USD",
    connectedChains: [],
  },
  stakingAndGovernance: {
    validators: [],
    validatorAssets: {},
    myValidators: [],
    myStakingPositions: [],
    stakingOrUnstakingState: StakingOrUnstakingState.Idle,
  },
  notifications: {
    toasts: {},
    pendingActions: [],
  },
  proposals: { proposals: [] },
};
