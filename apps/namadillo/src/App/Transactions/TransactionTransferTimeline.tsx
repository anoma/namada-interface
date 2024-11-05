import {
  ProgressStepsOptions,
  TransferProgressSteps,
  TransferTransactionData,
} from "types";

import { TransactionTimeline } from "./TransactionTimeline";

type TransactionTransferTimelineProps = {
  transaction: TransferTransactionData;
};

const stepDescription: Record<ProgressStepsOptions, string> = {
  sign: "Signature required",
  "ibc-to-masp": "IBC Transfer to Namada MASP",
  "zk-proof": "Generating ZK Proof",
  "ibc-to-namada": "IBC Transfer to Namada",
  "masp-to-masp": "Transfer to Namada Shielded",
  "tnam-to-masp": "Transfer to Namada Shielded",
  "tnam-to-tnam": "Transfer to Namada Transparent",
  "masp-to-tnam": "Transfer to Namada Transparent",
  "ibc-withdraw": "Transfer from Namada",
};

export const TransactionTransferTimeline = ({
  transaction,
}: TransactionTransferTimelineProps): JSX.Element => {
  const steps = TransferProgressSteps[transaction.type];
  const stepsWithDescription = steps.map((step) => ({
    children: stepDescription[step],
    bullet: true,
  }));

  return (
    <div>
      <TransactionTimeline
        steps={stepsWithDescription}
        currentStepIndex={
          steps.findIndex((step) => step === transaction.progressStatus) || 0
        }
      />
    </div>
  );
};
