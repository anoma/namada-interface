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

const categoryAccountTypeMap: Record<ClaimCategory, string> = {
  Github: "Github",
  CosmosWallet: "Cosmos Wallet",
  OsmosisWallet: "Osmosis Wallet",
  StargazeWallet: "Stargaze Wallet",
  TrustedSetup: "Namada Trusted Setup Public Key",
  EthereumWallet: "EthereumWallet",
};

type Breakdown = {
  accountType: string;
  source: string;
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
            minNam: claim.token,
          };
        });
        setBreakdown(breakdown);
        console.log(breakdown);
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
            {index + 1} - {claim.accountType} - {claim.source} - {claim.minNam}
          </div>
        ))}
      </div>
    </AirdropConfirmationContainer>
  );
};
