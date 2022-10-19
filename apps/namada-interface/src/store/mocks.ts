import { RootState } from "./store";
import { TransferType } from "slices/transfers";

export const mockAppState: RootState = {
  accounts: {
    derived: {
      "anoma-masp-1.5.32ccad5356012a7": {
        atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp:
          {
            chainId: "anoma-masp-1.5.32ccad5356012a7",
            alias: "Namada",
            address:
              "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
            isShielded: false,
          },
      },
      "anoma-test.1e670ba91369ec891fc": {
        "39UL18": {
          chainId: "anoma-test.1e670ba91369ec891fc",
          alias: "Namada",
          address:
            "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
          isShielded: false,
        },
      },
      "anoma-test.89060614ce340f4baae": {
        "2MLGVA": {
          chainId: "anoma-test.89060614ce340f4baae",
          alias: "Namada",
          address: "L1qDtV8TRwYLSHdMDW518hgRw9nWnRjFTenkcBYNJruyYoLjaj8F",
          isShielded: false,
        },
      },
    },
  },
  balances: {
    "anoma-masp-1.5.32ccad5356012a7": {
      "12RF8L": {
        NAM: 1000,
        ATOM: 1000,
        ETH: 1000,
        DOT: 0,
        BTC: 1000,
      },
    },
  },
  transfers: {
    transactions: [
      {
        chainId: "anoma-masp-1.5.32ccad5356012a7",
        source:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
        target:
          "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
        appliedHash:
          "C90CE1D0FBF4562A01207C9C126A401C64D9CC6D2203A8D219E6A9EF645F9F0E",
        tokenType: "NAM",
        amount: 1000,
        memo: "Initial funds",
        gas: 1.232945,
        height: 226619,
        timestamp: 1659444390179,
        type: TransferType.NonShielded,
      },
      {
        chainId: "anoma-masp-1.5.32ccad5356012a7",
        source:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
        target:
          "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
        appliedHash:
          "C90CE1D0FBF4562A01207C9C126A401C64D9CC6D2203A8D219E6A9EF645F9F0E",
        tokenType: "ETH",
        amount: 1000,
        memo: "Initial funds",
        gas: 1.232945,
        height: 226619,
        timestamp: 1659444390683,
        type: TransferType.NonShielded,
      },
      {
        chainId: "anoma-masp-1.5.32ccad5356012a7",
        source:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
        target:
          "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
        appliedHash:
          "C90CE1D0FBF4562A01207C9C126A401C64D9CC6D2203A8D219E6A9EF645F9F0E",
        tokenType: "ATOM",
        amount: 1000,
        memo: "Initial funds",
        gas: 1.232945,
        height: 226619,
        timestamp: 1659444390845,
        type: TransferType.NonShielded,
      },
      {
        chainId: "anoma-masp-1.5.32ccad5356012a7",
        source:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
        target:
          "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
        appliedHash:
          "C90CE1D0FBF4562A01207C9C126A401C64D9CC6D2203A8D219E6A9EF645F9F0E",
        tokenType: "BTC",
        amount: 1000,
        memo: "Initial funds",
        gas: 1.232945,
        height: 226619,
        timestamp: 1659444391098,
        type: TransferType.NonShielded,
      },
    ],
    isTransferSubmitting: false,
    isIbcTransferSubmitting: false,
    transferError:
      "Async actions timed out when submitting Token Transfer after 20 seconds",
  },
  channels: {
    channelsByChain: {
      "anoma-test.1e670ba91369ec891fc": {
        "anoma-test.89060614ce340f4baae": ["channel-0"],
      },
      "anoma-test.89060614ce340f4baae": {
        "anoma-test.1e670ba91369ec891fc": ["channel-0"],
      },
    },
  },
  settings: {
    fiatCurrency: "USD",
    chainId: "anoma-masp-1.5.32ccad5356012a7",
  },
  coins: {
    rates: {},
  },
  stakingAndGovernance: {
    myBalances: [],
    validators: [],
    myValidators: [],
    myStakingPositions: [],
  },
  notifications: {
    toasts: {},
    pendingActions: [],
  },
};
