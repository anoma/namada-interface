import { SkeletonLoading, Stack } from "@namada/components";
import { useAtomValue } from "jotai";
import { useState } from "react";

import { proposalFamilyPersist, StoredProposal } from "slices/proposals";

export const ProposalDescription: React.FC<{
  proposalId: bigint;
}> = ({ proposalId }) => {
  const proposal = useAtomValue(proposalFamilyPersist(proposalId));

  return (
    <Stack className="text-sm px-8 -mt-3" gap={4}>
      {proposal.status === "error" || proposal.status === "pending" ?
        <>
          <SkeletonLoading height="1em" width="100%" />
          <SkeletonLoading height="1em" width="100%" />
        </>
      : <Loaded proposal={proposal.data} />}
    </Stack>
  );
};

export const Loaded: React.FC<{
  proposal: StoredProposal;
}> = ({ proposal }) => {
  const [expanded, setExpanded] = useState(false);

  const { abstract, ...details } = proposal.content;

  const formattedDetails = Object.entries(details).map(([key, value]) => {
    const spacedKey = key.replaceAll("-", " ");
    const capitalizedKey =
      spacedKey.charAt(0).toUpperCase() + spacedKey.slice(1);

    return [capitalizedKey, value];
  });

  return (
    <>
      <section>{abstract}</section>

      {expanded &&
        formattedDetails.map(([key, value], i) => (
          <section key={i}>
            <h3 className="text-[#8A8A8A]">{key}</h3>
            <p>{value}</p>
          </section>
        ))}

      <a
        className="block text-center cursor-pointer after:content-['_+']"
        onClick={() => setExpanded(!expanded)}
      >
        Show {expanded ? "Less" : "More"}
      </a>
    </>
  );
};
