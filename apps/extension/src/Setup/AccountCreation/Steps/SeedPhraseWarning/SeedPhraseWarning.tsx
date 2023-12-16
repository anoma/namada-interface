import {
  ActionButton,
  Heading,
  Icon,
  SeedPhraseInstructions,
  Stack,
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
        <Heading className="uppercase text-3xl" level="h1">
          New Seed Phrase
        </Heading>
      </HeaderContainer>
      <Stack gap={3}>
        <WarningPanel>
          <IconContainer>
            <Icon name="Warning" size="full" />
          </IconContainer>
        </WarningPanel>
        <Stack gap={8}>
          <InstructionsContainer>
            <SeedPhraseInstructions />
          </InstructionsContainer>
          <PageFooter>
            <ActionButton
              data-testid="setup-show-phrase-button"
              onClick={onComplete}
            >
              I understood, show my phrase
            </ActionButton>
          </PageFooter>
        </Stack>
      </Stack>
    </>
  );
};

export default SeedPhraseWarning;
