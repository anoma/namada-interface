import { accountBalanceAtom } from "atoms/accounts";
import { shouldUpdateBalanceAtom, shouldUpdateProposalAtom } from "atoms/etc";
import { proposalFamily, votedProposalIdsAtom } from "atoms/proposals";
import { createStore, useAtomValue, useSetAtom } from "jotai";
import { useTransactionEventListener } from "utils";

export const useTransactionCallback = (): void => {
  const { refetch: refetchBalances } = useAtomValue(accountBalanceAtom);
  const shouldUpdateBalance = useSetAtom(shouldUpdateBalanceAtom);
  const shouldUpdateProposal = useSetAtom(shouldUpdateProposalAtom);

  const onBalanceUpdate = (): void => {
    // TODO: refactor this after event subscription is enabled on indexer
    shouldUpdateBalance(true);
    refetchBalances();

    const timePolling = 6 * 1000;
    setTimeout(() => shouldUpdateBalance(false), timePolling);
  };

  useTransactionEventListener("Bond.Success", onBalanceUpdate);
  useTransactionEventListener("Unbond.Success", onBalanceUpdate);
  useTransactionEventListener("Withdraw.Success", onBalanceUpdate);

  const store = createStore();

  useTransactionEventListener("VoteProposal.Success", (args) => {
    // TODO: refactor this after event subscription is enabled on indexer
    shouldUpdateProposal(true);

    // [0] is fine for time being as we can only vote for one proposal at a time
    const proposalId = args.detail.data[0].proposalId;
    const { refetch: refetchProposalFamily } = store.get(
      proposalFamily(proposalId)
    );
    refetchProposalFamily();

    const { refetch: refetchVotedProposalIds } =
      store.get(votedProposalIdsAtom);
    refetchVotedProposalIds();

    // This does not guarantee that the proposal will be updated,
    // but because this is temporary solution(don't quote me on this), it should be fine :)
    const timePolling = 12 * 1000;
    setTimeout(() => shouldUpdateProposal(false), timePolling);
  });
};
