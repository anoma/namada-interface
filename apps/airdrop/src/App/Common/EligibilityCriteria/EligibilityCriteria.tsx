import { Heading, Text } from "@namada/components";
import { EligibilityCriteriaContainer } from "./EligibilityCriteria.components";

type EligibilityCriteriaProps = {
  eligibilities: Set<string>;
};

const EligibleText = ({
  selected,
  children,
}: {
  selected: boolean;
  children: React.ReactNode;
}): JSX.Element => {
  return <Text>{selected ? <b>{children} ✓</b> : children}</Text>;
};

export const EligibilityCriteria = ({
  eligibilities,
}: EligibilityCriteriaProps): JSX.Element => {
  return (
    <EligibilityCriteriaContainer>
      <Heading size="3xl" themeColor="primary" level="h2">
        Eligibility criteria
      </Heading>
      <EligibleText selected={eligibilities.has("zcash-rd-rust")}>
        Zcash R&D & Rust Developer Ecosystem
      </EligibleText>
      <EligibleText selected={eligibilities.has("zkp")}>
        ZKPs, Cryptography PGs, Privacy Research & Learning
      </EligibleText>
      <EligibleText selected={eligibilities.has("interchain")}>
        Interchain PGs & Early Shielded Ecosystem
      </EligibleText>
      <EligibleText selected={eligibilities.has("early-shielded-community")}>
        Early Shielded Community
      </EligibleText>
      <EligibleText selected={eligibilities.has("gitcoin")}>
        Gitcoin Donors of Privacy, ZK tech, and Crypto Advocacy
      </EligibleText>
      <EligibleText selected={eligibilities.has("ts")}>
        Namada Trusted Setup Participants
      </EligibleText>
    </EligibilityCriteriaContainer>
  );
};
