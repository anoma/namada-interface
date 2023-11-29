import {
  ActionButton,
  Heading,
  Icon,
  IconName,
  IconSize,
  Stack,
  SeedPhraseInstructions,
} from "@namada/components";
import { HeaderContainer } from "Setup/Setup.components";
import {
  IconContainer,
  InstructionsContainer,
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
        <Heading uppercase level="h1" size="3xl">
          New Seed Phrase
        </Heading>
      </HeaderContainer>
      <Stack gap={3}>
        <WarningPanel>
          <IconContainer>
            <Icon
              iconName={IconName.Warning}
              iconSize={IconSize.Full}
              strokeColorOverride="transparent"
            />
          </IconContainer>
        </WarningPanel>
        <Stack gap={8}>
          <InstructionsContainer>
            <SeedPhraseInstructions />
          </InstructionsContainer>
          <PageFooter>
            <ActionButton onClick={onComplete}>
              I understood, show my phrase
            </ActionButton>
          </PageFooter>
        </Stack>
      </Stack>
    </>
  );
};

export default SeedPhraseWarning;
