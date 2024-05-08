import { useSanitizedParams } from "@namada/hooks";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Modal,
  Stack,
  TickedRadioList,
} from "@namada/components";
import { VoteType, isVoteType, voteTypes } from "@namada/types";
import { ModalContainer } from "App/Common/ModalContainer";
import { performVoteAtom, proposalFamily } from "slices/proposals";
import GovernanceRoutes from "./routes";

export const SubmitVote: React.FC = () => {
  const navigate = useNavigate();

  const {
    mutate: performVote,
    isPending: isPerformingVote,
    isSuccess,
  } = useAtomValue(performVoteAtom);

  const [selectedVoteType, setSelectedVoteType] = useState<VoteType>();

  const { proposalId: proposalIdString = "" } = useSanitizedParams();
  // TODO: validate we got a number
  const proposalId = BigInt(Number.parseInt(proposalIdString));
  const proposalQueryResult = useAtomValue(proposalFamily(proposalId));

  if (Number.isNaN(proposalId) || !proposalQueryResult.isSuccess) {
    navigate(GovernanceRoutes.overview().url);
    return null;
  }

  const proposal = proposalQueryResult.data;

  const onCloseModal = (): void =>
    //navigate(GovernanceRoutes.proposal(proposal.id).url);
    navigate(-1);

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

  const handleSelectVoteType = (voteType: string) => {
    if (!isVoteType(voteType)) {
      throw new Error(`unexpected vote type, got ${voteType}`);
    }
    setSelectedVoteType(voteType);
  };

  useEffect(() => {
    if (isSuccess) {
      //dispatchPendingNotification();
      onCloseModal();
    }
  }, [isSuccess]);

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer header="Vote" onClose={onCloseModal}>
        <Stack gap={2} full as="form" onSubmit={onSubmit}>
          <div>
            #{proposal.id} {proposal.content.title}
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

          <ActionButton
            type="submit"
            disabled={typeof selectedVoteType === "undefined"}
          >
            Confirm
          </ActionButton>
        </Stack>
      </ModalContainer>
    </Modal>
  );
};
