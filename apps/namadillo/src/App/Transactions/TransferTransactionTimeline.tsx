import { Asset } from "@chain-registry/types";
import { CopyToClipboardControl } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { Timeline, TransactionStep } from "App/Common/Timeline";
import { AssetImage } from "App/Transfer/AssetImage";
import {
  PartialTransferTransactionData,
  TransferStep,
  allTransferStages,
  transparentTransferTypes,
} from "types";
import { TransferTimelineErrorEntry } from "./TransferTimelineErrorEntry";

type TransactionTransferTimelineProps = {
  transaction: PartialTransferTransactionData;
};

type ImageProps = {
  asset: Asset;
  isShielded: boolean;
};

type CompleteTextProps = {
  transaction: PartialTransferTransactionData;
  isShielded: boolean;
};

const stepDescription: Record<TransferStep, string> = {
  sign: "Signature required",
  "ibc-to-shielded": "IBC Transfer to Namada MASP",
  "zk-proof": "Generating ZK Proof",
  "ibc-to-transparent": "IBC Transfer to Namada",
  "shielded-to-shielded": "Transfer to Namada Shielded",
  "transparent-to-shielded": "Transfer to Namada Shielded",
  "transparent-to-transparent": "Transfer to Namada Transparent",
  "shielded-to-transparent": "Transfer to Namada Transparent",
  "ibc-withdraw": "Transfer from Namada",
  "waiting-confirmation": "Waiting for confirmation",
  complete: "Transfer Complete",
};

const AssetImageWrapper = ({ asset, isShielded }: ImageProps): JSX.Element => (
  <span className="w-12 block mx-auto">
    <AssetImage asset={asset} isShielded={isShielded} />
  </span>
);

const CompleteText = ({
  transaction,
  isShielded,
}: CompleteTextProps): JSX.Element => (
  <>
    <AssetImageWrapper asset={transaction.asset} isShielded={isShielded} />
    <p className="mt-2">
      {isShielded ?
        "Shielded Transfer Complete"
      : "Transparent Transfer Complete"}
    </p>
  </>
);

const getCurrentIndex = (
  steps: TransferStep[],
  currentStep: TransferStep | undefined,
  numberInitialSteps: number
): number => {
  const currentIdx = steps.findIndex((step) => step === currentStep) || 0;
  return currentIdx + numberInitialSteps;
};

const buildStepEntries = (
  textSteps: TransferStep[],
  currentStepIndex: number,
  hasError: boolean,
  transaction: PartialTransferTransactionData,
  isShielded: boolean
): TransactionStep[] => {
  return textSteps.map((step, index) => {
    if (index === currentStepIndex && hasError) {
      return {
        children: (
          <TransferTimelineErrorEntry
            errorMessage={transaction.errorMessage || ""}
          >
            {stepDescription[step]}
          </TransferTimelineErrorEntry>
        ),
        bullet: false,
      };
    }

    if (step === TransferStep.WaitingConfirmation) {
      return { children: null, bullet: false };
    }

    if (step === TransferStep.Complete) {
      return {
        children: (
          <CompleteText transaction={transaction} isShielded={isShielded} />
        ),
        bullet: false,
      };
    }

    return {
      children: stepDescription[step],
      bullet: true,
    };
  });
};

export const TransferTransactionTimeline = ({
  transaction,
}: TransactionTransferTimelineProps): JSX.Element => {
  const textSteps = [...allTransferStages[transaction.type]];
  const hasError = transaction.status === "error";
  const isTransparentTransfer = transparentTransferTypes.includes(
    transaction.type
  );

  const initialImage = [
    {
      children: (
        <AssetImageWrapper
          asset={transaction.asset}
          isShielded={!isTransparentTransfer}
        />
      ),
      bullet: false,
    },
  ];

  const currentStepIndex = getCurrentIndex(
    textSteps,
    transaction.currentStep,
    initialImage.length
  );

  const filteredSteps = textSteps.filter(
    (step) => step !== TransferStep.WaitingConfirmation
  );

  const stepsWithDescription = buildStepEntries(
    filteredSteps,
    currentStepIndex + filteredSteps.length - textSteps.length,
    hasError,
    transaction,
    !isTransparentTransfer
  );

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-center text-xl">
          {stepDescription[transaction.currentStep || "sign"]}
        </h2>
        {transaction.hash && (
          <span className="my-1 text-sm text-center block text-neutral-600">
            Transaction hash:{" "}
            <span className="inline-flex gap-1">
              {shortenAddress(transaction.hash, 8, 8)}
              <CopyToClipboardControl value={transaction.hash} />
            </span>
          </span>
        )}
      </header>
      {transaction.currentStep && (
        <Timeline
          steps={[...initialImage, ...stepsWithDescription]}
          currentStepIndex={currentStepIndex}
          hasError={hasError}
          complete={transaction.status === "success"}
        />
      )}
    </div>
  );
};
