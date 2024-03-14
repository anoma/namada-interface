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
  // TODO: validate we got a number
  const proposalId = BigInt(Number.parseInt(proposalIdString));
  const proposalQueryResult = useAtomValue(proposalFamily(proposalId));

  if (Number.isNaN(proposalId) || !proposalQueryResult.isSuccess) {
    navigate(GovernanceRoutes.overview().url);
    return null;
  }

  const proposal = proposalQueryResult.data;

  // JSON.stringify doesn't work with BigInts
  const proposalWithoutBigInt = Object.fromEntries(
    Object.entries(proposal).map(([key, value]) => [
      key,
      typeof value === "bigint" ? value.toString() : value,
    ])
  );

  // TODO: this isn't quite right because bigints look like strings
  // We maybe want the display JSON to be something that `namada client
  // init-proposal` will accept.
  const proposalJson = JSON.stringify(proposalWithoutBigInt, null, 2);

  const onCloseModal = (): void =>
    navigate(GovernanceRoutes.proposal(proposal.id).url);

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer header={null} onClose={onCloseModal}>
        <pre className="overflow-x-scroll">{proposalJson}</pre>
      </ModalContainer>
    </Modal>
  );
};
