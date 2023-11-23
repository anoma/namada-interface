import { Heading } from "@namada/components";
import { useAtom } from "jotai";
import { confirmationAtom } from "./state";
import {
  AirdropConfirmationContainer,
  AirdropConfirmationHeader,
  AirdropConfirmationSection,
} from "./App.components";
import { useEffect, useState } from "react";
import { ClaimCategory, getAllClaims } from "./hooks";
import { AnotherWays } from "./AnotherWays";

const categoryAccountTypeMap: Record<ClaimCategory, string> = {
  Github: "Github",
  CosmosWallet: "Cosmos Wallet",
  OsmosisWallet: "Osmosis Wallet",
  StargazeWallet: "Stargaze Wallet",
  TrustedSetup: "Namada Trusted Setup Public Key",
  EthereumWallet: "EthereumWallet",
};

const getCategory = (
  category: ClaimCategory,
  eligibleFor: string[]
): string => {
  if (category === "Github") {
    return eligibleFor.join(", ");
  } else if (
    ["CosmosWallet", "OsmosisWallet", "StargazeWallet"].includes(category)
  ) {
    return "Early shielded Community";
  } else if (category === "TrustedSetup") {
    return "Namada Trusted Setup";
  } else if (category === "EthereumWallet") {
    return "Gitcoin Donors of Privacy, ZK tech, and Crypto Advocacy";
  } else {
    return "";
  }
};

type Breakdown = {
  accountType: string;
  source: string;
  category: string;
  minNam: number;
};

export const AirdropConfirmation: React.FC = () => {
  const [confirmation] = useAtom(confirmationAtom);
  const [totalMinNam, setTotalMinNam] = useState<number>();
  const [breakdown, setBreakdown] = useState<Breakdown[]>([]);

  if (confirmation === null) {
    throw new Error("Confirmation state is empty!");
  }

  useEffect(() => {
    (async () => {
      const { ok, result } = await getAllClaims(confirmation.address);
      if (ok) {
        const totalMinNam = result.claims.reduce((acc, curr) => {
          return acc + curr.token;
        }, 0);
        setTotalMinNam(totalMinNam);

        const breakdown = result.claims.map((claim) => {
          return {
            accountType: categoryAccountTypeMap[claim.category],
            source: claim.value,
            category: getCategory(claim.category, claim.eligible_for),
            minNam: claim.token,
          };
        });
        setBreakdown(breakdown);
      }
    })();
  }, []);

  return (
    <AirdropConfirmationContainer>
      <AirdropConfirmationHeader></AirdropConfirmationHeader>
      <AirdropConfirmationSection>
        <Heading level={"h1"}>
          Namada Genesis
          <br />
          Account Submitted
        </Heading>
        <p>
          NAM will be available diretly in your wallet at Namada Mainnet launch,
          <br />
          subject to the Terms of Service.
        </p>
        <p>
          <b>Genesis Account:</b>
        </p>
        <p>{confirmation.address}</p>
        <Heading level={"h4"} size={"xl"}>
          Minimum NAM:
        </Heading>
        <Heading level={"h1"}>{confirmation.amount}</Heading>
      </AirdropConfirmationSection>
      <Heading level={"h4"} size={"xl"}>
        Total minimum NAM across all claims
      </Heading>
      <Heading level={"h4"}>{totalMinNam}</Heading>
      <Heading level={"h4"} size={"xl"}>
        <b>Breakdown of all claims made with the genesis account above</b>
      </Heading>
      <div>
        {breakdown.map((claim, index) => (
          <div key={index}>
            {index + 1} - {claim.accountType} - {claim.source} -{" "}
            {claim.category} - {claim.minNam}
          </div>
        ))}
      </div>
      <AnotherWays />
    </AirdropConfirmationContainer>
  );
};
