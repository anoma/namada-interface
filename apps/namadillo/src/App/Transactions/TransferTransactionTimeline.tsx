import { Asset } from "@chain-registry/types";
import { Tooltip } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { Timeline } from "App/Common/Timeline";
import { AssetImage } from "App/Transfer/AssetImage";
import { chainRegistryAtom } from "atoms/integrations";
import { findAssetByDenom, findRegistryByChainId } from "integrations/utils";
import { useAtomValue } from "jotai";
import {
  ChainRegistryEntry,
  MinimalTransferTransactionData,
  ProgressStepsOptions,
  transferProgressSteps,
  transparentTransferTypes,
} from "types";
import { TransferTimelineErrorEntry } from "./TransferTimelineErrorEntry";

type TransactionTransferTimelineProps = {
  transaction: MinimalTransferTransactionData;
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
  complete: "Transfer Complete",
};

const getAsset = (
  registryMap: Record<string, ChainRegistryEntry>,
  chainId: string,
  denom: string
): Asset | undefined => {
  const registry = findRegistryByChainId(registryMap, chainId);
  return registry ? findAssetByDenom(registry, denom) : undefined;
};

export const TransferTransactionTimeline = ({
  transaction,
}: TransactionTransferTimelineProps): JSX.Element => {
  const textSteps = transferProgressSteps[transaction.type];
  const registryMap = useAtomValue(chainRegistryAtom);
  const asset = getAsset(registryMap, transaction.chainId, transaction.denom);

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
        asset={asset}
        isShielded={fromIbcChain ? undefined : !isTransparentTransfer}
      />
    </span>
  );

  const completeStep = (
    <>
      <span className="w-12 mb-2 block mx-auto">
        <AssetImage asset={asset} isShielded={isTransparentTransfer} />
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
