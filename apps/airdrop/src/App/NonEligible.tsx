import { Heading } from "@namada/components";
import {
  EligibilityContainer,
  EligibilitySection,
  EligibilitySectionWrapper,
} from "./App.components";
import { useAtom } from "jotai";
import { labelAtom } from "./state";
import { AnotherWays } from "./AnotherWays";
import { labelTextMap } from "./utils";

export const NonEligible: React.FC = () => {
  const [label] = useAtom(labelAtom);

  return (
    <EligibilityContainer>
      <EligibilitySectionWrapper>
        <EligibilitySection>
          <span>
            <Heading level={"h1"}>You are not eligible</Heading>
            <p>
              {"Sorry, you're not elibile for the RPGF Drop"}
              <br />
              {label && (
                <span>
                  <b>{labelTextMap[label.type]}:</b> {label.value}
                </span>
              )}
            </p>
          </span>
        </EligibilitySection>
      </EligibilitySectionWrapper>
      <AnotherWays />
    </EligibilityContainer>
  );
};
