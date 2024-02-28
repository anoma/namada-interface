import {
  ActionButton,
  SeedPhraseInstructions,
  Stack,
} from "@namada/components";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { GoAlertFill } from "react-icons/go";

type SeedPhraseWarningProps = {
  onComplete: () => void;
};

export const SeedPhraseWarning = ({
  onComplete,
}: SeedPhraseWarningProps): JSX.Element => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    setTimeout(() => {
      if (countdown > 0) {
        setCountdown((countdown) => countdown - 1);
      }
    }, 1000);
  }, [countdown]);

  return (
    <>
      <Stack className="mb-6" gap={7}>
        <aside className="flex items-center bg-black rounded-md justify-center py-10 w-full">
          <div className="flex justify-center mx-auto text-yellow text-[125px] leading-[1]">
            <GoAlertFill />
          </div>
        </aside>
        <div className="text-sm">
          <SeedPhraseInstructions />
        </div>
      </Stack>
      <footer>
        <ActionButton
          data-testid="setup-show-phrase-button"
          size="lg"
          className={clsx({ "pointer-events-none opacity-50": countdown > 0 })}
          onClick={onComplete}
        >
          I understood, show my phrase {countdown > 0 && `[ ${countdown} ]`}
        </ActionButton>
      </footer>
    </>
  );
};
