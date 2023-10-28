import {
  ActionButton,
  Heading,
  Icon,
  IconName,
  IconSize,
} from "@namada/components";
import { SeedPhraseInstructions } from "Setup/Common";
import { HeaderContainer } from "Setup/Setup.components";
import {
  IconContainer,
  PageFooter,
  WarningPanel,
} from "./SeedPhraseWarning.components";

type SeedPhraseWarningProps = {
  onComplete: () => void;
};

const SeedPhraseWarning = ({
  onComplete,
}: SeedPhraseWarningProps): JSX.Element => {
  return (
    <>
      <HeaderContainer>
        <Heading level="h1" size="3xl">
          New Seed Phrase
        </Heading>
      </HeaderContainer>
      <WarningPanel>
        <IconContainer>
          <Icon
            iconName={IconName.Warning}
            iconSize={IconSize.Full}
            strokeColorOverride="transparent"
          />
        </IconContainer>
      </WarningPanel>

      <SeedPhraseInstructions />
      <PageFooter>
        <ActionButton onClick={onComplete}>
          I understood, show my phrase
        </ActionButton>
      </PageFooter>
    </>
  );
};

export default SeedPhraseWarning;
