import { accountBalanceAtom } from "atoms/accounts";
import { shouldUpdateBalanceAtom, shouldUpdateProposalAtom } from "atoms/etc";
import { useAtomValue, useSetAtom } from "jotai";
import { useTransactionEventListener } from "utils";

export const useTransactionCallback = (): void => {
  const { refetch: refetchBalances } = useAtomValue(accountBalanceAtom);
  const shouldUpdateBalance = useSetAtom(shouldUpdateBalanceAtom);

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

  const shouldUpdateProposal = useSetAtom(shouldUpdateProposalAtom);

  useTransactionEventListener("VoteProposal.Success", () => {
    shouldUpdateProposal(true);

    // This does not guarantee that the proposal will be updated,
    // but because this is temporary solution(don't quote me on this), it should be fine :)
    const timePolling = 12 * 1000;
    setTimeout(() => shouldUpdateProposal(false), timePolling);
  });
};
