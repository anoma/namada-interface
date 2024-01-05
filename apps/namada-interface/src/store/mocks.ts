import BigNumber from "bignumber.js";

import { chains, defaultChainId } from "@namada/chains";
import { AccountType } from "@namada/types";
import { StakingOrUnstakingState } from "slices/StakingAndGovernance";
import { RootState } from "./store";

export const mockAppState: RootState = {
  accounts: {
    derived: {
      "namada-masp-1.5.32ccad5356012a7": {
        tnam1q8gpzlamqksqjagt2xs3p6tnfcldy0fcd53fs4jh: {
          details: {
            chainId: "namada-masp-1.5.32ccad5356012a7",
            alias: "Namada",
            address: "tnam1q8gpzlamqksqjagt2xs3p6tnfcldy0fcd53fs4jh",
            isShielded: false,
            type: AccountType.PrivateKey,
          },
          balance: {
            NAM: new BigNumber(1000),
            DOT: new BigNumber(1000),
            ETH: new BigNumber(1000),
          },
        },
      },
      "namada-test.1e670ba91369ec891fc": {
        "39UL18": {
          details: {
            chainId: "namada-test.1e670ba91369ec891fc",
            alias: "Namada",
            address: "tnam1qz4sdx5jlh909j44uz46pf29ty0ztftfzc98s8dx",
            type: AccountType.PrivateKey,
            isShielded: false,
          },
          balance: {
            NAM: new BigNumber(1000),
            DOT: new BigNumber(1000),
            ETH: new BigNumber(1000),
          },
        },
      },
      "namada-test.89060614ce340f4baae": {
        "2MLGVA": {
          details: {
            chainId: "namada-test.89060614ce340f4baae",
            alias: "Namada",
            address: "L1qDtV8TRwYLSHdMDW518hgRw9nWnRjFTenkcBYNJruyYoLjaj8F",
            type: AccountType.PrivateKey,
            isShielded: false,
          },
          balance: {
            NAM: new BigNumber(1000),
            DOT: new BigNumber(1000),
            ETH: new BigNumber(1000),
          },
        },
      },
    },
  },
  chain: { config: chains[defaultChainId] },
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
  coins: {
    rates: {},
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
