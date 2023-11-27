import { Heading, LinkButton, Stack, Text } from "@namada/components";
import { useAtom } from "jotai";
import { confirmationAtom } from "./state";
import {
  AirdropBreakdownSection,
  AirdropConfirmationContainer,
  AirdropConfirmationHeading,
  AirdropConfirmationSection,
  IconContainer,
  MainSection,
  ObjectsContainer,
  PoolContainer,
  PoolTopLayerContainer,
} from "./App.components";
import { useEffect, useState } from "react";
import { ClaimCategory, getAllClaims } from "./hooks";
import { AnotherWays } from "./AnotherWays";
import { GithubEligibility, mapEligibility } from "./eligibilityMap";
import { PoolSvg } from "./Graphics/Pool";
import { PoolTopLayer } from "./Graphics/PoolTopLayer";
import { BallSVg } from "./Graphics/Ball";
import { HiveSvg } from "./Graphics/Hive";
import { WireSvg } from "./Graphics/Wire";
import { Bars2Svg } from "./Graphics/Bars2";
import { Bars1Svg } from "./Graphics/Bars1";
import { ZeroOneSvg } from "./Graphics/ZeroOne";
import { EyeSvg } from "./Graphics/Eye";

const categoryAccountTypeMap: Record<ClaimCategory, string> = {
  Github: "Github",
  CosmosWallet: "Cosmos Wallet",
  OsmosisWallet: "Osmosis Wallet",
  StargazeWallet: "Stargaze Wallet",
  TrustedSetup: "Namada Trusted Setup Public Key",
  EthereumWallet: "EthereumWallet",
};

const githubCategoryMap: Record<GithubEligibility, string> = {
  zkp: "ZKPs, Cryptography PGs, Privacy Research & Learning",
  zcash: "Zcash R&D & Rust Developer Ecosystem",
  interchain: "Interchain PGs & Early Shielded Ecosystem",
};

const getCategory = (
  category: ClaimCategory,
  eligibleFor: string[]
): string => {
  if (category === "Github") {
    return mapEligibility(eligibleFor.pop() || "", githubCategoryMap);
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
      <MainSection>
        <AirdropConfirmationSection>
          <Stack gap={5}>
            <Stack gap={2}>
              <AirdropConfirmationHeading level={"h1"} size={"6xl"}>
                Namada
                <br />
                Genesis account
                <br />
                submitted
              </AirdropConfirmationHeading>
              <Text>
                NAM will be available diretly in your wallet
                <br /> at Namada Mainnet launch, subject to the
                <br />{" "}
                <LinkButton themeColor="utility2">
                  <b>terms of Service</b>
                </LinkButton>
              </Text>
            </Stack>
            <Stack gap={1}>
              <Heading level={"h4"} size={"base"}>
                Genesis public key:
              </Heading>
              <Text fontSize={"sm"}>
                <b>{confirmation.publicKey}</b>
              </Text>
              <Heading level={"h4"} size={"base"}>
                Genesis transparent account:
              </Heading>
              <Text fontSize={"sm"}>
                <b>{confirmation.address}</b>
              </Text>
            </Stack>

            <Stack gap={"px"}>
              <Heading level={"h4"} size={"xl"}>
                Minimum NAM claimed
              </Heading>
              <Text fontSize={"5xl"}>{confirmation.amount}</Text>
            </Stack>
          </Stack>
        </AirdropConfirmationSection>
      </MainSection>

      <PoolContainer>
        <PoolSvg />
      </PoolContainer>
      <PoolTopLayerContainer>
        <PoolTopLayer />
      </PoolTopLayerContainer>
      <ObjectsContainer>
        <IconContainer left={-310} top={50}>
          <BallSVg />
        </IconContainer>
        <IconContainer left={255} top={40}>
          <HiveSvg />
        </IconContainer>
        <IconContainer left={-425} top={156}>
          <WireSvg />
        </IconContainer>
        <IconContainer left={380} top={150}>
          <Bars2Svg />
        </IconContainer>
        <IconContainer left={-540} top={380}>
          <Bars1Svg />
        </IconContainer>
        <IconContainer left={350} top={306}>
          <ZeroOneSvg />
        </IconContainer>
        <IconContainer left={305} top={377}>
          <EyeSvg />
        </IconContainer>
      </ObjectsContainer>

      <AirdropBreakdownSection>
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
      </AirdropBreakdownSection>
      <AnotherWays />
    </AirdropConfirmationContainer>
  );
};
