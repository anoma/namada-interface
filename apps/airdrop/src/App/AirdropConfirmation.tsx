import { Heading, LinkButton, Stack, Text } from "@namada/components";
import gsap, { Expo, Quint } from "gsap";
import { useAtom } from "jotai";
import groupBy from "lodash.groupby";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnotherWays } from "./AnotherWays";
import {
  AirdropBreakdownSection,
  AirdropConfirmationAccordion,
  AirdropConfirmationContainer,
  AirdropConfirmationHeading,
  AirdropConfirmationInput,
  AirdropConfirmationMainSection,
  AirdropConfirmationObjectsContainer,
  AirdropConfirmationPool,
  AirdropConfirmationPoolTop,
  AirdropConfirmationSection,
  AirdropConfirmationWarning,
  AnotherWaysSection,
  GlobalStyles,
  IconContainer,
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "./App.components";
import { CommunityFooter } from "./Common/CommunityFooter";
import { PageFooter } from "./Common/PageFooter";
import { WarningList } from "./Common/Warning";
import { Bars1Svg } from "./Graphics/Bars1";
import { Bars2Svg } from "./Graphics/Bars2";
import { EyeSvg } from "./Graphics/Eye";
import { PoolSvg } from "./Graphics/Pool";
import { PoolTopLayer } from "./Graphics/PoolTopLayer";
import { WireSvg } from "./Graphics/Wire";
import { WarningIcon } from "./Icons/WarningIcon";
import { iconsOnMouseMovement } from "./animations";
import { getAllClaims } from "./claimService";
import { GithubEligibility, mapEligibility } from "./eligibilityMap";
import { confirmationAtom } from "./state";
import { ClaimCategory } from "./types";
import { formatAmount } from "./utils";

const categoryAccountTypeMap: Record<ClaimCategory, string> = {
  Github: "Github",
  CosmosWallet: "Cosmos Wallet",
  OsmosisWallet: "Osmosis Wallet",
  StargazeWallet: "Stargaze Wallet",
  TrustedSetup: "Namada Trusted Setup Public Key",
  EthereumWallet: "Ethereum Wallet",
};

const githubCategoryMap: Record<GithubEligibility, string> = {
  zkp: "ZKPs, Cryptography PGs, Privacy Research, & Learning Resources",
  zcash: "Zcash R&D & Rust Developer Ecosystem",
  interchain: "Interchain PGs, Shielded Ecosystem, PGF Mechanism R&D",
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
    return "Shielded Community";
  } else if (category === "TrustedSetup") {
    return "Namada Trusted Setup Participants";
  } else if (category === "EthereumWallet") {
    return "Gitcoin Donors of ZK Tech and Crypto Advocacy";
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
  const iconsContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [confirmation] = useAtom(confirmationAtom);
  const [totalMinNam, setTotalMinNam] = useState<number>();
  const [breakdown, setBreakdown] = useState<Breakdown[]>([]);
  const [TOSReset, setTOSReset] = useState(false);

  if (confirmation === null) {
    throw new Error("Confirmation state is empty!");
  }

  useEffect(() => {
    (async () => {
      const response = await getAllClaims(confirmation.address);
      if (response.ok) {
        const result = response.value;
        const totalMinNam = result.claims.reduce((acc, curr) => {
          return acc + curr.token;
        }, 0);
        setTotalMinNam(totalMinNam);

        // We do this because we want to group 'ethresearch` under the ZKP category
        const breakdown = Object.values(
          groupBy(result.claims, (c) => `${c.category}-${c.value}`)
        )
          .map((claims) => {
            const breakdown = claims.map((claim) => {
              return {
                accountType: categoryAccountTypeMap[claim.category],
                source: claim.value,
                category: getCategory(claim.category, claim.eligible_for),
                minNam: claim.token,
              };
            });

            const breakdownReduced = Object.values(
              groupBy(breakdown, "category")
            ).map((v) =>
              (v || []).reduce((acc, curr) => ({
                ...acc,
                minNam: acc.minNam + curr.minNam,
              }))
            );

            return breakdownReduced;
          })
          .flat();

        setBreakdown(breakdown);
      }
    })();
  }, [confirmation.address]);

  // We want to scroll to the top of the page and reset checkbox when confirmation state changes
  useEffect(() => {
    setTOSReset(!TOSReset);
    window.scrollTo(0, 0);
  }, [confirmation]);

  useLayoutEffect(() => {
    if (!iconsContainerRef.current) return;
    return iconsOnMouseMovement(iconsContainerRef.current);
  }, [confirmation]);

  useLayoutEffect(() => {
    gsap.context(() => {
      gsap.fromTo(
        ".objects-container i",
        {
          y: `+=${window.innerHeight}`,
          scale: 0.75,
        },
        {
          scale: 1,
          y: 0,
          stagger: 0.1,
          duration: 2.5,
          ease: Expo.easeOut,
          overwrite: true,
        }
      );

      gsap.fromTo(
        ".airdrop-warning",
        {
          opacity: 0,
        },
        { opacity: 1, duration: 1.25, ease: Expo.easeOut }
      );

      gsap.to(".airdrop-warning", {
        x: "-=5",
        yoyo: true,
        repeat: 10,
        duration: 0.025,
        delay: 4,
      });
    }, [containerRef.current]);
  }, [confirmation]);

  useLayoutEffect(() => {
    gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        ".circle-section",
        { scale: 0 },
        { scale: 1, duration: 1.5, ease: Expo.easeOut }
      );

      tl.fromTo(
        ".main-header",
        { y: "+=150", opacity: 0, scale: 0.75 },
        { opacity: 1, duration: 1, scale: 1, ease: Quint.easeOut },
        "-=0.9"
      );

      tl.to(
        ".main-header",
        { y: 0, duration: 1.25, ease: Expo.easeOut },
        "-=0.375"
      );

      tl.fromTo(
        ".fade-in",
        { opacity: 0, y: "+=15" },
        { opacity: 1, y: 0, duration: 1.5, stagger: 0.025, ease: Expo.easeOut },
        "-=0.95"
      );
    }, [containerRef.current]);
  }, [confirmation]);

  return (
    <AirdropConfirmationContainer ref={containerRef}>
      <GlobalStyles colorMode="light" />
      <AirdropConfirmationMainSection className="circle-section">
        <AirdropConfirmationSection>
          <Stack gap={5}>
            <Stack gap={2}>
              <AirdropConfirmationHeading
                className="main-header"
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
              <Text className="fade-in" themeColor={"utility1"}>
                NAM will be available directly in your wallet
                <br /> in the Namada mainnet genesis block proposal
                <br /> made by the Anoma Foundation, subject to the
                <br />
                <LinkButton
                  href="/terms-and-conditions"
                  themeColor="utility1"
                  target="_blank"
                  rel="noreferrer nofollow"
                >
                  <b>Terms and Conditions</b>
                </LinkButton>
              </Text>
            </Stack>
            <Stack gap={3}>
              <AirdropConfirmationInput
                className="fade-in"
                label="Genesis public key:"
                variant="ReadOnlyCopy"
                value={confirmation.publicKey}
              />
              <AirdropConfirmationInput
                className="fade-in"
                label="Genesis transparent account:"
                variant="ReadOnlyCopy"
                value={confirmation.address}
              />
            </Stack>
            <Stack gap={"px"} className="fade-in">
              <Heading themeColor={"utility1"} level={"h4"} size={"xl"}>
                Minimum NAM claimed
              </Heading>
              <Text themeColor={"utility1"} fontSize={"6xl"}>
                {formatAmount(confirmation.amount)}
              </Text>
            </Stack>
          </Stack>
        </AirdropConfirmationSection>
      </AirdropConfirmationMainSection>

      <AirdropConfirmationWarning
        className="airdrop-warning"
        width={"255px"}
        top={"80px"}
        left={"calc(50% - 640px)"}
        icon={<WarningIcon />}
        iconWidth={"60px"}
        orientation={"vertical"}
      >
        <WarningList />
      </AirdropConfirmationWarning>

      <AirdropConfirmationPool>
        <PoolSvg />
      </AirdropConfirmationPool>

      <div ref={iconsContainerRef}>
        <AirdropConfirmationPoolTop>
          <PoolTopLayer />
        </AirdropConfirmationPoolTop>
        <AirdropConfirmationObjectsContainer className="objects-container">
          <IconContainer left={230} top={-50}>
            <WireSvg />
          </IconContainer>
          <IconContainer left={415} top={210}>
            <Bars2Svg />
          </IconContainer>
          <IconContainer left={-540} top={380}>
            <Bars1Svg />
          </IconContainer>
          <IconContainer left={350} top={400}>
            <EyeSvg />
          </IconContainer>
        </AirdropConfirmationObjectsContainer>
      </div>

      <AirdropBreakdownSection>
        <Heading themeColor={"utility1"} level={"h4"} size={"xl"}>
          Total minimum NAM across all claims
        </Heading>
        <Heading themeColor={"utility1"} size={"6xl"}>
          {totalMinNam ? formatAmount(totalMinNam) : "-"}
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
                Account/Address
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
                  {formatAmount(claim.minNam)}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </AirdropConfirmationAccordion>
      </AirdropBreakdownSection>
      <AnotherWaysSection>
        <AnotherWays reset={TOSReset} title="Try another claim" />
      </AnotherWaysSection>
      <CommunityFooter />
      <PageFooter />
    </AirdropConfirmationContainer>
  );
};
