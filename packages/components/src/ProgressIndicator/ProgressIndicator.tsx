import { Stack } from "@namada/components";

import {
  ProgressIndicatorContainer,
  ProgressListItem,
} from "./ProgressIndicator.components";

type ProgressIndicatorProps = {
  totalSteps: number;
  currentStep: number;
  keyName: string;
};

export const ProgressIndicator = ({
  totalSteps,
  currentStep,
}: ProgressIndicatorProps): JSX.Element => {
  return (
    <ProgressIndicatorContainer role="group" aria-label="Progress">
      <Stack as="ol" gap={2} direction="horizontal">
        {[...Array(totalSteps)].map((_, idx) => (
          <ProgressListItem
            key={`step-${idx}`}
            active={idx <= currentStep - 1}
            aria-current={idx === currentStep - 1}
          />
        ))}
      </Stack>
    </ProgressIndicatorContainer>
  );
};
