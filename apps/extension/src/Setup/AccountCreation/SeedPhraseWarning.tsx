import {
  ActionButton,
  Heading,
  SeedPhraseInstructions,
  Stack,
} from "@namada/components";
import { GoAlert } from "react-icons/go";

type SeedPhraseWarningProps = {
  onComplete: () => void;
};

export const SeedPhraseWarning = ({
  onComplete,
}: SeedPhraseWarningProps): JSX.Element => {
  return (
    <>
      <hgroup className="text-center text-white mb-6 -mt-2">
        <Heading className="uppercase text-3xl" level="h1">
          New Seed Phrase
        </Heading>
      </hgroup>
      <Stack gap={3}>
        <aside className="flex items-center bg-black rounded-md justify-center p-14 w-full">
          <div className="flex justify-center w-32 mx-auto text-yellow text-[75px]">
            <GoAlert />
          </div>
        </aside>
        <Stack gap={8}>
          <div className="text-sm">
            <SeedPhraseInstructions />
          </div>
          <footer>
            <ActionButton
              data-testid="setup-show-phrase-button"
              size="lg"
              onClick={onComplete}
            >
              I understood, show my phrase
            </ActionButton>
          </footer>
        </Stack>
      </Stack>
    </>
  );
};
