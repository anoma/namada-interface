import {
  ActionButton,
  Modal,
  SkeletonLoading,
  Stack,
  TickedRadioList,
} from "@namada/components";
import { VoteType, isVoteType, voteTypes } from "@namada/types";
import { TransactionFees } from "App/Common/TransactionFees";
import clsx from "clsx";
import { useProposalIdParam } from "hooks";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { performVoteAtom, proposalFamily } from "slices/proposals";

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
  const { mutate: performVote, isSuccess } = useAtomValue(performVoteAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

  useEffect(() => {
    if (isSuccess) {
      dispatchSuccessNotification();
      onCloseModal();
    }
  }, [isSuccess]);

  const [selectedVoteType, setSelectedVoteType] = useState<VoteType>();

  const proposalQueryResult = useAtomValue(proposalFamily(proposalId));

  const proposal =
    proposalQueryResult.isSuccess ? proposalQueryResult.data : null;

  const onCloseModal = (): void => navigate(-1);

  const dispatchSuccessNotification = (): void => {
    dispatchNotification({
      id: "proposal-voted",
      type: "pending",
      title: "Governance transaction in progress",
      description: `You've voted ${selectedVoteType} for the proposal
          #${proposalId}. Your transaction is being procesed.`,
    });
  };

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    invariant(!Number.isNaN(proposalId), "Proposal ID is not a number");
    invariant(
      typeof selectedVoteType !== "undefined",
      "There is no selected vote type"
    );
    performVote({
      proposalId,
      vote: selectedVoteType,
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
      <div className="relative py-9 px-8 bg-neutral-800 min-w-[540px] rounded-md text-white">
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
          <Stack gap={4} full as="form" onSubmit={onSubmit}>
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

              {voteTypes.map((voteType, i) => (
                <div key={i}>{}</div>
              ))}
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
              disabled={typeof selectedVoteType === "undefined"}
            >
              Confirm
            </ActionButton>
          </Stack>
        )}
      </div>
    </Modal>
  );
};
