import { accountBalanceAtom } from "atoms/accounts/atoms";
import {
  namShieldedBalanceAtom,
  totalShieldedBalanceAtom,
} from "atoms/masp/atoms";
import { allProposalsAtom, votedProposalsAtom } from "atoms/proposals/atoms";
import { indexerHeartbeatAtom, rpcHeartbeatAtom } from "atoms/settings/atoms";
import { allValidatorsAtom, myValidatorsAtom } from "atoms/validators/atoms";
import { atom } from "jotai";

export const syncStatusAtom = atom((get) => {
  const queries = [
    // Heartbeat
    get(indexerHeartbeatAtom),
    get(rpcHeartbeatAtom),

    // Staking
    get(accountBalanceAtom),
    get(myValidatorsAtom),
    get(allValidatorsAtom),

    // Governance
    get(allProposalsAtom),
    get(votedProposalsAtom),

    // Masp
    get(totalShieldedBalanceAtom),
    get(namShieldedBalanceAtom),
  ];

  const isSyncing = queries.some((q) => q.isFetching);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error || undefined;

  return {
    isSyncing,
    isError,
    error,
  };
});
