import { Tooltip } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { Timeline } from "App/Common/Timeline";
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
  complete: "Transfer Complete",
};

export const TransferTransactionTimeline = ({
  transaction,
}: TransactionTransferTimelineProps): JSX.Element => {
  const textSteps = allTransferStages[transaction.type];

  const fromIbcChain =
    transaction.type === "IbcToTransparent" ||
    transaction.type === "IbcToShielded";

  const isTransparentTransfer = transparentTransferTypes.includes(
    transaction.type
  );

  const transferCompleteMessage =
    isTransparentTransfer ?
      "Transparent Transfer Complete"
    : "Shielded Transfer Complete";

  const hasError = transaction.status === "error";

  const initialImage = (
    <span className="w-12 block mx-auto">
      <AssetImage
        asset={transaction.asset}
        isShielded={fromIbcChain ? undefined : !isTransparentTransfer}
      />
    </span>
  );

  const completeStep = (
    <>
      <span className="w-12 mb-2 block mx-auto">
        <AssetImage
          asset={transaction.asset}
          isShielded={isTransparentTransfer}
        />
      </span>
      <p>{transferCompleteMessage}</p>
    </>
  );

  const additionalSteps = [{ children: initialImage, bullet: false }];

  const currentStepIndex =
    textSteps.findIndex((step) => step === transaction.currentStep) || 0;

  const stepsWithDescription = textSteps.map((step, index) => {
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

    if (step === "complete") {
      return {
        children: completeStep,
        bullet: false,
      };
    }

    return {
      children: stepDescription[step],
      bullet: true,
    };
  });

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-center text-xl">
          {stepDescription[transaction.currentStep || "sign"]}
        </h2>
        {transaction.hash && (
          <span className="text-xs text-center block text-neutral-600">
            Transaction hash:{" "}
            <span className="relative group/tooltip">
              {shortenAddress(transaction.hash, 8, 8)}
              <Tooltip>{transaction.hash}</Tooltip>
            </span>
          </span>
        )}
      </header>
      <Timeline
        steps={[...additionalSteps, ...stepsWithDescription]}
        currentStepIndex={additionalSteps.length + currentStepIndex}
        hasError={hasError}
      />
    </div>
  );
};
