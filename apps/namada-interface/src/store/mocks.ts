import BigNumber from "bignumber.js";

import { AccountType } from "@namada/types";
import { RootState } from "./store";
import { StakingOrUnstakingState } from "slices/StakingAndGovernance";

export const mockAppState: RootState = {
  accounts: {
    derived: {
      "namada-masp-1.5.32ccad5356012a7": {
        atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp:
          {
            details: {
              chainId: "namada-masp-1.5.32ccad5356012a7",
              alias: "Namada",
              address:
                "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
              isShielded: false,
              type: AccountType.PrivateKey,
            },
            balance: {
              NAM: new BigNumber(1000),
              ATOM: new BigNumber(1000),
              ETH: new BigNumber(1000),
            },
          },
      },
      "namada-test.1e670ba91369ec891fc": {
        "39UL18": {
          details: {
            chainId: "namada-test.1e670ba91369ec891fc",
            alias: "Namada",
            address:
              "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
            type: AccountType.PrivateKey,
            isShielded: false,
          },
          balance: {
            NAM: new BigNumber(1000),
            ATOM: new BigNumber(1000),
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
            ATOM: new BigNumber(1000),
            ETH: new BigNumber(1000),
          },
        },
      },
    },
  },
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
    chainId: "namada-masp-1.5.32ccad5356012a7",
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
  proposals: {
    proposals: [],
  },
};
