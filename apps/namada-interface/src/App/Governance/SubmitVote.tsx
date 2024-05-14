import { useSanitizedParams } from "@namada/hooks";
import invariant from "invariant";
import { atom, useAtomValue } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Modal,
  Stack,
  TickedRadioList,
} from "@namada/components";
import { Proposal, VoteType, isVoteType, voteTypes } from "@namada/types";
import { ModalContainer } from "App/Common/ModalContainer";
import { performVoteAtom, proposalFamily } from "slices/proposals";

const SubmitVoteLoaded: React.FC<{
  proposal: Proposal;
}> = ({ proposal }) => {
  const navigate = useNavigate();
  const { mutate: performVote } = useAtomValue(performVoteAtom);

  const [selectedVoteType, setSelectedVoteType] = useState<VoteType>();

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    invariant(
      typeof selectedVoteType !== "undefined",
      "There is no selected vote type"
    );
    performVote({
      proposalId: proposal.id,
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
    <Stack gap={2} full as="form" onSubmit={onSubmit}>
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

      <ActionButton
        type="submit"
        disabled={typeof selectedVoteType === "undefined"}
      >
        Confirm
      </ActionButton>
    </Stack>
  );
};

export const SubmitVote: React.FC = () => {
  const navigate = useNavigate();

  const { proposalId: proposalIdString = "" } = useSanitizedParams();

  let proposalId: bigint | null = null;
  try {
    proposalId = BigInt(proposalIdString);
  } catch (e) {}

  const proposal = useAtomValue(
    typeof proposalId === "bigint" ? proposalFamily(proposalId) : atom(null)
  );

  const onCloseModal = (): void => navigate(-1);

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer header="Vote" onClose={onCloseModal}>
        {proposal !== null && proposal.isSuccess && (
          <SubmitVoteLoaded proposal={proposal.data} />
        )}
      </ModalContainer>
    </Modal>
  );
};
