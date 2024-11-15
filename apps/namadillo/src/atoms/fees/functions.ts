import { GasLimitTableInnerTxKindEnum as GasLimitTableIndexer } from "@namada/indexer-client";
import { assertNever } from "@namada/utils";
import { TxKind } from "types/txKind";

export const txKindToIndexer = (txKind: TxKind): GasLimitTableIndexer => {
  switch (txKind) {
    case "Bond":
      return GasLimitTableIndexer.Bond;
    case "Unbond":
      return GasLimitTableIndexer.Unbond;
    case "Redelegate":
      return GasLimitTableIndexer.Redelegation;
    case "Withdraw":
      return GasLimitTableIndexer.Withdraw;
    case "ClaimRewards":
      return GasLimitTableIndexer.ClaimRewards;
    case "VoteProposal":
      return GasLimitTableIndexer.VoteProposal;
    case "RevealPk":
      return GasLimitTableIndexer.RevealPk;
    case "IbcTransfer":
      return GasLimitTableIndexer.IbcMsgTransfer;
    case "Shield":
      return GasLimitTableIndexer.ShieldingTransfer;
    case "Unshield":
      return GasLimitTableIndexer.UnshieldingTransfer;
    case "Unknown":
      return GasLimitTableIndexer.Unknown;
    default:
      return assertNever(txKind);
  }
};
