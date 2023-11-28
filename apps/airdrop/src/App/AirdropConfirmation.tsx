import {
  Heading,
  InputVariants,
  LinkButton,
  Stack,
  Text,
} from "@namada/components";
import { useAtom } from "jotai";
import { confirmationAtom } from "./state";
import {
  AirdropBreakdownSection,
  AirdropConfirmationAccordion,
  AirdropConfirmationContainer,
  AirdropConfirmationHeading,
  AirdropConfirmationInput,
  AirdropConfirmationMainSection,
  AirdropConfirmationPool,
  AirdropConfirmationPoolTop,
  AirdropConfirmationSection,
  AnotherWaysSection,
  GlobalStyles,
  IconContainer,
  ObjectsContainer,
  Table,
  TableCell,
  TableHeader,
  TableRow,
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
  zkp: "ZKPs, Cryptography Public Goods, Privacy Research & Learning Resources",
  zcash: "Zcash R&D & Rust Developer Ecosystem",
  interchain: "Interchain Public Goods & Early Shielded Ecosystem",
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
      <GlobalStyles colorMode="light" />
      <AirdropConfirmationMainSection>
        <AirdropConfirmationSection>
          <Stack gap={5}>
            <Stack gap={2}>
              {/* TODO: already submitted */}
              <AirdropConfirmationHeading
                level={"h1"}
                size={"6xl"}
                themeColor={"utility1"}
              >
                Namada
                <br />
                Genesis account
                <br />
                submitted
              </AirdropConfirmationHeading>
              <Text themeColor={"utility1"}>
                NAM will be available diretly in your wallet
                <br /> at Namada Mainnet launch, subject to the
                <br />{" "}
                <LinkButton themeColor="utility1">
                  <b>terms of Service</b>
                </LinkButton>
              </Text>
            </Stack>
            <Stack gap={3}>
              <AirdropConfirmationInput
                label="Your transparent public key:"
                variant={InputVariants.ReadOnlyCopy}
                value={confirmation.publicKey}
              />
              <AirdropConfirmationInput
                label="Your transparent account:"
                variant={InputVariants.ReadOnlyCopy}
                value={confirmation.publicKey}
              />
            </Stack>

            <Stack gap={"px"}>
              <Heading themeColor={"utility1"} level={"h4"} size={"xl"}>
                Minimum NAM claimed
              </Heading>
              <Text themeColor={"utility1"} fontSize={"6xl"}>
                {confirmation.amount}
              </Text>
            </Stack>
          </Stack>
        </AirdropConfirmationSection>
      </AirdropConfirmationMainSection>

      <AirdropConfirmationPool>
        <PoolSvg />
      </AirdropConfirmationPool>
      <AirdropConfirmationPoolTop>
        <PoolTopLayer />
      </AirdropConfirmationPoolTop>
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
        <Heading themeColor={"utility1"} level={"h4"} size={"xl"}>
          Total minimum NAM across all claims
        </Heading>
        <Heading themeColor={"utility1"} size={"6xl"}>
          {totalMinNam}
        </Heading>
        <AirdropConfirmationAccordion
          title={
            <Text themeColor={"utility1"} fontSize={"xl"}>
              <b>Breakdown of all claims made with the genesis account above</b>
            </Text>
          }
          solid={true}
        >
          <Table>
            <TableHeader>
              <TableCell width="50px">Claim</TableCell>
              <TableCell width="200px" align="center">
                Account Type
              </TableCell>
              <TableCell width="calc(100% - 540px)" align="center">
                Accout/Address
              </TableCell>
              <TableCell width="190px" align="center">
                Category
              </TableCell>
              <TableCell width="100px" align="right">
                Min NAM
              </TableCell>
            </TableHeader>
            {breakdown.map((claim, index) => (
              <TableRow height="62px" key={index}>
                <TableCell width="50px">{index + 1}</TableCell>
                <TableCell width="200px" align="center">
                  {claim.accountType}
                </TableCell>
                <TableCell width="calc(100% - 540px)" align="center">
                  {claim.source}
                </TableCell>
                <TableCell width="190px" align="center">
                  {claim.category}
                </TableCell>
                <TableCell width="100px" align="right">
                  {claim.minNam}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </AirdropConfirmationAccordion>
      </AirdropBreakdownSection>
      <AnotherWaysSection>
        <AnotherWays />
      </AnotherWaysSection>
    </AirdropConfirmationContainer>
  );
};
