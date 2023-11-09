import { Button, ButtonVariant, Heading } from "@namada/components";
import {
  AnotherWays,
  AnotherWaysButtons,
  EligibilityContainer,
  EligibilitySection,
  EligibilitySectionWrapper,
} from "./App.components";

export const NonEligible: React.FC = () => {
  return (
    <EligibilityContainer>
      <EligibilitySectionWrapper>
        <EligibilitySection>
          <span>
            <Heading level={"h1"}>You are not eligible</Heading>
            <p>{"Sorry, you're not elibile for the RPGF Drop."}</p>
          </span>
        </EligibilitySection>
      </EligibilitySectionWrapper>

      <AnotherWays>
        <Heading level={"h2"}>Try another way !!!TODO!!!</Heading>
        <AnotherWaysButtons>
          <Button variant={ButtonVariant.Contained} onClick={() => {}}>
            Github
          </Button>
          <Button variant={ButtonVariant.Contained} onClick={() => {}}>
            Namada Trusted Setup
          </Button>
          <Button variant={ButtonVariant.Contained} onClick={() => {}}>
            Cosmos Wallet
          </Button>
          <Button variant={ButtonVariant.Contained} onClick={() => {}}>
            Osmosis Wallet
          </Button>
          <Button variant={ButtonVariant.Contained} onClick={() => {}}>
            Stargaze Wallet
          </Button>
        </AnotherWaysButtons>
      </AnotherWays>
    </EligibilityContainer>
  );
};
