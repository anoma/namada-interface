import { useNavigate } from "react-router-dom";
import {
  Accordion,
  Button,
  ButtonVariant,
  Heading,
  Icon,
  IconName,
  Stack,
} from "@namada/components";
import {
  EligibilityCriteria,
  EligibilitySection,
  EligibiltyList,
  EligibiltyTitle,
} from "App/App.components";
import { useAtom } from "jotai";
import {
  CommonState,
  GithubState,
  KEPLR_CLAIMS,
  claimAtom,
  labelAtom,
} from "../state";
import { labelTextMap } from "App/utils";
import { mapEligibility } from "App/eligibilityMap";

//TODO: cleanup this whole component
const eligibleFor = (state: CommonState): string[] => {
  const { type } = state;

  if (type === "ts") {
    return ["ts"];
  } else if (type === "gitcoin") {
    return ["gitcoin"];
  } else if ((KEPLR_CLAIMS as readonly string[]).includes(type)) {
    return ["early-shielded-community"];
  } else if (type === "github") {
    const eligibilities = (state as GithubState).eligibilities;
    return eligibilities
      .map((e) => mapEligibility(e))
      .filter((eligibility) => eligibility !== "");
  } else {
    throw new Error("Invalid claim type");
  }
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
          <Icon iconName={IconName.Checked} strokeColorOverride="black" />
        )}
        {title}
      </EligibiltyTitle>
    }
  >
    {children}
  </Accordion>
);

export const ClaimInfo: React.FC = () => {
  const navigate = useNavigate();
  const [claimState] = useAtom(claimAtom);
  const [label] = useAtom(labelAtom);
  if (!claimState) return null;
  const eligibilities = new Set(eligibleFor(claimState));

  return (
    <Stack gap={4}>
      <EligibilitySection>
        <span>
          <Heading level={"h1"}>You are eligible</Heading>
          <p>Congrats, you are eligible for the Namada RPGF Drop!</p>
        </span>
        <Stack gap={2}>
          {label && (
            <span>
              <b>{labelTextMap[label.type]}:</b> {label.value}
            </span>
          )}

          <Button
            variant={ButtonVariant.Contained}
            onClick={() => {
              navigate("/claim/confirmation");
            }}
          >
            Claim NAM
          </Button>
        </Stack>
      </EligibilitySection>
      <EligibilityCriteria>
        <Stack gap={2}>
          <Heading level={"h2"} themeColor={"primary"}>
            Eligibility criteria
          </Heading>
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
            title="ZKPs, Cryptography Public Goods, Privacy Research, & Learning Resources"
          >
            <EligibiltyList>
              <li>
                Public contributors to ZK protocols, proving systems,
                cryptography public goods
              </li>
              <li>
                Public contributors to ZK learning resources and privacy in Web3
                research
              </li>
              <li>
                Category creators and contributors to the categories
                zk-s[nt]arks, Cryptography, and Privacy categories on
                ethresear.ch
              </li>
            </EligibiltyList>
          </EligibilityAccordion>
          <EligibilityAccordion
            selected={eligibilities.has("interchain")}
            title="Interchain Public Goods & Early Shielded Ecosystem"
          >
            <EligibiltyList>
              <li>
                Public contributors to consensus, interoperability, bridge
                designs, and proof-of-stake research and development
              </li>
              <li>Public contributors to early app-chains</li>
            </EligibiltyList>
          </EligibilityAccordion>
          <EligibilityAccordion
            selected={eligibilities.has("early-shielded-community")}
            title="Early Shielded Community"
          >
            <EligibiltyList>
              <li>Cosmos</li>
              <li>Osmosis</li>
              <li>Stargaze</li>
              <li>BadKids</li>
            </EligibiltyList>
          </EligibilityAccordion>
          <EligibilityAccordion
            selected={eligibilities.has("gitcoin")}
            title="Donors of ZK Tech, Privacy, and Crypto Advocacy"
          >
            <EligibiltyList>
              <li>
                Voters / donors of ZK Tech, privacy, and Crypto Advocacy
                projects on Gitcoin’s GR rounds
              </li>
            </EligibiltyList>
          </EligibilityAccordion>
          <EligibilityAccordion
            selected={eligibilities.has("ts")}
            title="Namada Trusted Setup Participants"
          >
            <EligibiltyList>
              <li>
                Contributors to the Namada Trusted Setup ceremony (Nov-Dec 2022)
              </li>
            </EligibiltyList>
          </EligibilityAccordion>
        </Stack>
      </EligibilityCriteria>
    </Stack>
  );
};
