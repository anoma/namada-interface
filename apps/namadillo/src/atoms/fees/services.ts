import {
  DefaultApi,
  GasEstimate,
  GasLimitTableInnerTxKindEnum,
  GasPriceTableInner,
} from "@namada/indexer-client";
import { TxKind } from "types/txKind";

const legacyGasTableMap: Record<GasLimitTableInnerTxKindEnum, TxKind> = {
  revealPk: "RevealPk",
  bond: "Bond",
  unbond: "Unbond",
  redelegation: "Redelegate",
  claimRewards: "ClaimRewards",
  voteProposal: "VoteProposal",
  transparentTransfer: "TransparentTransfer",
  shieldingTransfer: "ShieldingTransfer",
  shieldedTransfer: "ShieldedTransfer",
  unshieldingTransfer: "UnshieldingTransfer",
  ibcMsgTransfer: "IbcTransfer",
  withdraw: "Withdraw",
  initProposal: "Unknown",
  changeMetadata: "Unknown",
  changeCommission: "Unknown",
  unknown: "Unknown",
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
    console.error("Failed to fetch gas estimate from indexer", e);
  }

  // if fails, try to fetch from the legacy endpoint
  try {
    const legacyValues = (await api.apiV1GasGet()).data;
    const sum = legacyValues.reduce((sum, item) => {
      const txKind: TxKind = legacyGasTableMap[item.txKind] ?? "Unknown";
      return sum + item.gasLimit * (counter(txKind) ?? 0);
    }, 0);
    return {
      min: sum,
      avg: sum * 1.1,
      max: sum * 1.2,
      totalEstimates: 0,
    };
  } catch (e) {
    console.error("Failed to fetch gas table limit from indexer", e);
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
