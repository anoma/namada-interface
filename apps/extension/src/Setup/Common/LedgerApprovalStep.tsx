import { Heading, ProgressIndicator, Stack } from "@namada/components";

type LedgerApprovalStepProps = {
  currentApprovalStep: number;
  isZip32Supported: boolean;
};

export const LedgerApprovalStep = ({
  currentApprovalStep,
  isZip32Supported,
}: LedgerApprovalStepProps): JSX.Element => {
  const stepText = [
    "Deriving Bip44 public key...",
    "Deriving Zip32 Viewing Key... This could take a few seconds!",
    "Deriving Zip32 Proof-Generation Key... This could take a few seconds!",
  ];

  // Ensure that steps are within stepText limits
  const totalSteps = stepText.length;
  const currentStep = Math.min(Math.max(currentApprovalStep, 1), totalSteps);

  return (
    <Stack gap={1} className="bg-black w-full p-4 rounded-md min-h-[240px]">
      <Stack direction="horizontal" className="flex">
        <span className="flex-none">
          {isZip32Supported && (
            <ProgressIndicator
              keyName="ledger-import"
              totalSteps={totalSteps}
              currentStep={currentStep}
            />
          )}
        </span>
        <span className="flex-1 text-white font-medium text-right">
          {isZip32Supported && (
            <>
              Approval {currentStep}/{totalSteps}
            </>
          )}
        </span>
      </Stack>
      <Heading
        level="h2"
        className="text-base text-center text-white font-medium"
      >
        Please wait for Ledger to respond!
      </Heading>
      <p className="font-medium text-yellow text-base text-center px-12">
        {stepText[currentStep - 1]}
      </p>
    </Stack>
  );
};
