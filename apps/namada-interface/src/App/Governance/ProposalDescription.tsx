import { Stack } from "@namada/components";
import { useState } from "react";

import { Proposal } from "@namada/types";

export const ProposalDescription: React.FC<{
  proposal: Proposal;
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
    <Stack className="text-sm px-8 -mt-3" gap={4}>
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
    </Stack>
  );

  //  return (
  //    <>
  //      {Object.entries(content).map(([key, value]) => (
  //        <section className="text-sm px-8" key={key}>
  //          <h3>{key}</h3>
  //          <p>{value}</p>
  //        </section>
  //      ))}
  //    </>
  //);
};
