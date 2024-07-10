import {
  ActionButton,
  Modal,
  SkeletonLoading,
  Stack,
  TickedRadioList,
} from "@namada/components";
import {
  VoteProposalProps,
  VoteType,
  isVoteType,
  voteTypes,
} from "@namada/types";
import { ToastErrorDescription } from "App/Common/ToastErrorDescription";
import { TransactionFees } from "App/Common/TransactionFees";
import { gasLimitsAtom, minimumGasPriceAtom } from "atoms/fees";
import { dispatchToastNotificationAtom } from "atoms/notifications";
import { canVoteAtom, createVoteTxAtom, proposalFamily } from "atoms/proposals";
import clsx from "clsx";
import { useProposalIdParam } from "hooks";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { TransactionPair, broadcastTx } from "lib/query";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const dispatchVoteTx = (tx: TransactionPair<VoteProposalProps>): void => {
  broadcastTx(
    tx.encodedTxData.tx,
    tx.signedTx,
    tx.encodedTxData.meta?.props,
    "VoteProposal"
  );
};

export const SubmitVote: React.FC = () => {
  const proposalId = useProposalIdParam();

  return proposalId === null ? null : (
    <WithProposalId proposalId={proposalId} />
  );
};

export const WithProposalId: React.FC<{ proposalId: bigint }> = ({
  proposalId,
}) => {
  const navigate = useNavigate();
  const {
    mutate: createVoteTx,
    isSuccess,
    data: voteTxData,
    isError,
    error: voteTxError,
  } = useAtomValue(createVoteTxAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const minimumGasPrice = useAtomValue(minimumGasPriceAtom);
  const gasLimits = useAtomValue(gasLimitsAtom);

  useEffect(() => {
    if (isSuccess) {
      dispatchPendingNotification();
      dispatchVoteTx(voteTxData);
      onCloseModal();
    }
  }, [isSuccess]);

  const [selectedVoteType, setSelectedVoteType] = useState<VoteType>();

  const proposalQueryResult = useAtomValue(proposalFamily(proposalId));
  const canVote = useAtomValue(canVoteAtom);

  const proposal =
    proposalQueryResult.isSuccess ? proposalQueryResult.data : null;

  const onCloseModal = (): void => navigate(-1);

  const dispatchPendingNotification = (): void => {
    dispatchNotification({
      id: "proposal-voted",
      type: "pending",
      title: "Governance transaction in progress",
      description: `You've voted ${selectedVoteType} for proposal
          #${proposalId}. Your transaction is being processed.`,
    });
  };

  useEffect(() => {
    if (isError) {
      dispatchNotification({
        id: "vote-tx-error",
        title: "Governance transaction failed",
        description: (
          <ToastErrorDescription
            errorMessage={
              voteTxError instanceof Error ? voteTxError.message : undefined
            }
          />
        ),
        type: "error",
      });
    }
  }, [isError]);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    invariant(
      typeof selectedVoteType !== "undefined",
      "There is no selected vote type"
    );
    invariant(minimumGasPrice.isSuccess, "Gas price loading is still pending");
    invariant(gasLimits.isSuccess, "Gas limit loading is still pending");
    createVoteTx({
      proposalId,
      vote: selectedVoteType,
      gasConfig: {
        gasPrice: minimumGasPrice.data!,
        gasLimit: gasLimits.data!.VoteProposal.native,
      },
    });
  };

  const handleSelectVoteType = (voteType: string): void => {
    if (!isVoteType(voteType)) {
      throw new Error(`unexpected vote type, got ${voteType}`);
    }
    setSelectedVoteType(voteType);
  };

  return (
    <Modal onClose={onCloseModal}>
      <div
        className={clsx(
          "relative py-9 px-8 bg-neutral-800 min-w-[min(100vw,_540px)] rounded-md",
          "text-white max-h-[100vh] flex flex-col"
        )}
      >
        <i
          className={clsx(
            "cursor-pointer text-white absolute right-8 top-8 text-3xl",
            "hover:text-yellow transition-colors"
          )}
          onClick={onCloseModal}
        >
          <IoClose />
        </i>
        <h1 className="text-xl font-medium mb-4">Vote</h1>
        {proposalQueryResult.isLoading && (
          <Stack gap={4}>
            <SkeletonLoading
              className="bg-neutral-700"
              width="100%"
              height="30px"
            />
            <SkeletonLoading
              className="bg-neutral-700"
              width="100%"
              height="200px"
            />
          </Stack>
        )}
        {proposalQueryResult.isSuccess && proposal && (
          <Stack
            gap={4}
            full
            as="form"
            onSubmit={onSubmit}
            className="dark-scrollbar overflow-x-auto"
          >
            <div>
              #{proposal.id.toString()} {proposal.content.title}
            </div>
            <Stack gap={2}>
              <TickedRadioList<VoteType>
                options={voteTypes.map((voteType) => ({
                  text: voteType.charAt(0).toUpperCase() + voteType.slice(1),
                  value: voteType,
                }))}
                id="vote-type-radio"
                value={selectedVoteType}
                onChange={handleSelectVoteType}
              />
            </Stack>
            <footer>
              <TransactionFees
                className="flex justify-between"
                numberOfTransactions={1}
              />
            </footer>
            <ActionButton
              type="submit"
              borderRadius="sm"
              disabled={
                !canVote.data || typeof selectedVoteType === "undefined"
              }
            >
              Confirm
            </ActionButton>
          </Stack>
        )}
      </div>
    </Modal>
  );
};
