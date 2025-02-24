import {
  DefaultApi,
  GasEstimate,
  GasLimitTableInnerTxKindEnum,
  GasPriceTableInner,
} from "@namada/indexer-client";
import { TxKind } from "types/txKind";

const convertLegacyGasKind = (kind: GasLimitTableInnerTxKindEnum): TxKind => {
  switch (kind) {
    case "revealPk":
      return "RevealPk";
    case "bond":
      return "Bond";
    case "unbond":
      return "Unbond";
    case "redelegation":
      return "Redelegate";
    case "claimRewards":
      return "ClaimRewards";
    case "voteProposal":
      return "VoteProposal";
    case "transparentTransfer":
      return "TransparentTransfer";
    case "shieldingTransfer":
      return "ShieldingTransfer";
    case "shieldedTransfer":
      return "ShieldedTransfer";
    case "unshieldingTransfer":
      return "UnshieldingTransfer";
    case "ibcMsgTransfer":
      return "IbcTransfer";
    case "withdraw":
      return "Withdraw";
    default:
      return "Unknown";
  }
};

export const fetchGasEstimate = async (
  api: DefaultApi,
  txKinds: TxKind[]
): Promise<GasEstimate> => {
  const counter = (kind: TxKind): number | undefined =>
    txKinds.filter((i) => i === kind).length || undefined;

  const params = [
    counter("Bond"),
    counter("ClaimRewards"),
    counter("Unbond"),
    counter("TransparentTransfer"),
    counter("ShieldedTransfer"),
    counter("ShieldingTransfer"),
    counter("UnshieldingTransfer"),
    counter("VoteProposal"),
    counter("IbcTransfer"),
    counter("Withdraw"),
    counter("RevealPk"),
    counter("Redelegate"),
  ];

  // fetch from the estimate endpoint
  try {
    return (await api.apiV1GasEstimateGet(...params)).data;
  } catch (e) {
    console.error(e);
  }

  // if fails, try to fetch from the legacy endpoint
  try {
    const legacyValues = (await api.apiV1GasGet()).data;
    const sum = legacyValues.reduce((sum, item) => {
      const txKind = convertLegacyGasKind(item.txKind);
      return sum + item.gasLimit * (counter(txKind) ?? 0);
    }, 0);
    return {
      min: sum,
      avg: sum,
      max: sum,
      totalEstimates: 0,
    };
  } catch (e) {
    console.error(e);
  }

  // otherwise, returns a generic default value
  return {
    min: 50000,
    avg: 50000,
    max: 50000,
    totalEstimates: 0,
  };
};

export const fetchTokensGasPrice = async (
  api: DefaultApi
): Promise<GasPriceTableInner[]> => {
  return (await api.apiV1GasPriceGet()).data;
};
