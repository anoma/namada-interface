import { SkeletonLoading, Stack } from "@namada/components";
import { Proposal } from "@namada/types";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useState } from "react";

import { proposalFamily } from "atoms/proposals";

export const ProposalDescription: React.FC<{
  proposalId: bigint;
}> = ({ proposalId }) => {
  const proposal = useAtomValue(proposalFamily(proposalId));

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
  proposal: Proposal;
}> = ({ proposal }) => {
  const [expanded, setExpanded] = useState(false);

  const { abstract, ...details } = proposal.content;

  const formattedDetails = Object.entries(details)
    .filter(([key]) => key !== "title")
    .map(([key, value]) => {
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
        className={clsx(
          "block text-center cursor-pointer",
          expanded ? "after:content-['_-']" : "after:content-['_+']"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        Show {expanded ? "Less" : "More"}
      </a>
    </>
  );
};
