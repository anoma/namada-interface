import { useSanitizedParams } from "@namada/hooks";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";

import { Modal } from "@namada/components";
import { ModalContainer } from "App/Common/ModalContainer";
import { proposalFamily } from "slices/proposals";
import GovernanceRoutes from "./routes";

export const ViewJson: React.FC = () => {
  const navigate = useNavigate();

  const { proposalId: proposalIdString = "" } = useSanitizedParams();
  const proposalId = Number.parseInt(proposalIdString);
  const proposalQueryResult = useAtomValue(proposalFamily(proposalId));

  if (Number.isNaN(proposalId) || !proposalQueryResult.isSuccess) {
    navigate(GovernanceRoutes.overview().url);
    return null;
  }

  const proposal = proposalQueryResult.data;

  const onCloseModal = (): void =>
    navigate(GovernanceRoutes.proposal(proposal.id).url);

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer header={null} onClose={onCloseModal}>
        <pre className="overflow-x-scroll">
          {JSON.stringify(proposal, null, 2)}
        </pre>
      </ModalContainer>
    </Modal>
  );
};
