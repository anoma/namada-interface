import { useSanitizedParams } from "@namada/hooks";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";

import { Modal } from "@namada/components";
import { copyToClipboard } from "@namada/utils";
import { ModalContainer } from "App/Common/ModalContainer";
import clsx from "clsx";
import { useState } from "react";
import { GoCheck, GoCopy } from "react-icons/go";
import { proposalFamily } from "slices/proposals";
import GovernanceRoutes from "./routes";

export const ViewJson: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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

  const onCopy = (): void => {
    if (!copied) {
      setCopied(true);
      copyToClipboard(proposalJson);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer header={null} onClose={onCloseModal}>
        <i
          className={clsx(
            "border border-current rounded-sm p-1 absolute",
            "text-lg top-6 right-17 text-white transition-colors",
            { "hover:text-yellow cursor-pointer": !copied }
          )}
          onClick={onCopy}
        >
          {copied ?
            <GoCheck />
          : <GoCopy />}
        </i>
        <div className="px-8 pt-4">
          <pre className="overflow-x-auto dark-scrollbar">{proposalJson}</pre>
        </div>
      </ModalContainer>
    </Modal>
  );
};
