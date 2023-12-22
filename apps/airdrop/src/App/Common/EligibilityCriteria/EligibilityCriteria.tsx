import { Accordion, Heading, Icon, Stack } from "@namada/components";
import { EligibiltyList } from "App/App.components";
import {
  CheckedIconContainer,
  EligibiltyTitle,
} from "./EligibilityCriteria.components";

type EligibilityCriteriaProps = {
  eligibilities: Set<string>;
};

const EligibilityAccordion = ({
  selected,
  title,
  children,
}: {
  selected: boolean;
  title: string;
  children: React.ReactNode;
}): JSX.Element => (
  <Accordion
    solid={selected}
    title={
      <EligibiltyTitle>
        {selected && (
          <CheckedIconContainer>
            <Icon name="Checked" size="sm" />
          </CheckedIconContainer>
        )}
        {title}
      </EligibiltyTitle>
    }
  >
    {children}
  </Accordion>
);

export const EligibilityCriteria = ({
  eligibilities,
}: EligibilityCriteriaProps): JSX.Element => {
  return (
    <Stack gap={4}>
      <Heading textAlign="left" level={"h2"} themeColor={"primary"}>
        Eligibility criteria
      </Heading>
      <Stack gap={2}>
        <EligibilityAccordion
          selected={eligibilities.has("zcash")}
          title="Zcash R&D & Rust Developer Ecosystem"
        >
          <EligibiltyList>
            <li>
              Public contributors to the Zcash protocol, cryptographic public
              goods
            </li>
            <li>Public contributors to Zcash research and ZIPs</li>
            <li>
              Public contributors to Zcash wallet infrastructure, learning and
              community resources
            </li>
            <li>Public contributors to Namada’s Rust dependencies</li>
          </EligibiltyList>
        </EligibilityAccordion>
        <EligibilityAccordion
          selected={eligibilities.has("zkp")}
          title="ZKPs, Cryptography PGs, Privacy Research, & Learning Resources"
        >
          <EligibiltyList>
            <li>
              Public contributors to ZK protocols, proving systems, cryptography
            </li>
            <li>
              Public contributors to decentralised privacy-preserving protocols
            </li>
            <li>
              Public contributors to ZK learning resources and privacy in Web3
              research
            </li>
            <li>
              Users of ethresear.ch and contributors to the categories{" "}
              <strong>zk-s[nt]arks</strong>, <strong>Cryptography</strong>, and{" "}
              <strong>Privacy</strong>
            </li>
          </EligibiltyList>
        </EligibilityAccordion>
        <EligibilityAccordion
          selected={eligibilities.has("interchain")}
          title="Interchain PGs, Shielded Ecosystem, PGF Mechanism R&D"
        >
          <EligibiltyList>
            <li>
              Public contributors to consensus, interoperability, bridge
              designs, and proof-of-stake research and development
            </li>
            <li>
              Public contributors to interchain applications and appchains
            </li>
            <li>
              Public contributors to interchain and interoperability protocol
              design, infrastructure, and tooling
            </li>
            <li>
              Public contributors to research and development of decentralized
              public goods funding mechanisms
            </li>
          </EligibiltyList>
        </EligibilityAccordion>
        <EligibilityAccordion
          selected={eligibilities.has("early-shielded-community")}
          title="Shielded Community"
        >
          <EligibiltyList>
            <li>Stakers of Cosmos</li>
            <li>Stakers of Osmosis</li>
            <li>BadKids</li>
          </EligibiltyList>
        </EligibilityAccordion>
        <EligibilityAccordion
          selected={eligibilities.has("gitcoin")}
          title="Gitcoin Donors of ZK Tech and Crypto Advocacy"
        >
          <EligibiltyList>
            <li>
              Voters/donors of ZK Tech and Crypto Advocacy projects on
              Gitcoin&apos;s GR rounds
            </li>
          </EligibiltyList>
        </EligibilityAccordion>
        <EligibilityAccordion
          selected={eligibilities.has("ts")}
          title="Namada Trusted Setup Participants"
        >
          <EligibiltyList>
            <li>
              Participants in the Namada Trusted Setup Ceremony (Nov-Dec 2022)
            </li>
          </EligibiltyList>
        </EligibilityAccordion>
      </Stack>
    </Stack>
  );
};
