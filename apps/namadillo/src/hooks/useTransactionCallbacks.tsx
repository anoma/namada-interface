import { accountBalanceAtom, defaultAccountAtom } from "atoms/accounts";
import { shouldUpdateBalanceAtom, shouldUpdateProposalAtom } from "atoms/etc";
import { claimableRewardsAtom, clearClaimRewards } from "atoms/staking";
import { useAtomValue, useSetAtom } from "jotai";
import { useTransactionEventListener } from "utils";

export const useTransactionCallback = (): void => {
  const { refetch: refetchBalances } = useAtomValue(accountBalanceAtom);
  const { refetch: refetchRewards } = useAtomValue(claimableRewardsAtom);
  const { data: account } = useAtomValue(defaultAccountAtom);
  const shouldUpdateBalance = useSetAtom(shouldUpdateBalanceAtom);

  const onBalanceUpdate = (): void => {
    // TODO: refactor this after event subscription is enabled on indexer
    shouldUpdateBalance(true);
    refetchBalances();

    const timePolling = 6 * 1000;
    setTimeout(() => shouldUpdateBalance(false), timePolling);

    if (account?.address) {
      clearClaimRewards(account.address);
      setTimeout(() => refetchRewards(), timePolling);
    }
  };

  useTransactionEventListener("Bond.Success", onBalanceUpdate);
  useTransactionEventListener("Unbond.Success", onBalanceUpdate);
  useTransactionEventListener("Withdraw.Success", onBalanceUpdate);
  useTransactionEventListener("Redelegate.Success", onBalanceUpdate);
  useTransactionEventListener("ClaimRewards.Success", onBalanceUpdate, [
    account?.address,
  ]);

  const shouldUpdateProposal = useSetAtom(shouldUpdateProposalAtom);

  useTransactionEventListener("VoteProposal.Success", () => {
    shouldUpdateProposal(true);

    // This does not guarantee that the proposal will be updated,
    // but because this is temporary solution(don't quote me on this), it should be fine :)
    const timePolling = 12 * 1000;
    setTimeout(() => shouldUpdateProposal(false), timePolling);
  });
};
