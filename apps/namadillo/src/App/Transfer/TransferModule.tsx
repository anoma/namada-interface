import { Stack } from "@namada/components";
import BigNumber from "bignumber.js";
import { Asset, Chain } from "types";
import { TransferSource } from "./TransferSource";

type TransferModuleProps = {
  isConnected: boolean;
  sourceChain?: Chain;
  onChangeSourceChain?: () => void;
  destinationChain?: Chain;
  onChangeDestinationChain?: (chain: Chain) => void;
  selectedAsset?: Asset;
  onChangeSelectedAsset?: (asset: Asset) => void;
  amount?: BigNumber;
  onChangeAmount?: (amount: BigNumber) => void;
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
  onSubmitTransfer: () => void;
};

export const TransferModule = ({
  isConnected,
  selectedAsset,
  sourceChain,
  onChangeSourceChain,
}: TransferModuleProps): JSX.Element => {
  return (
    <section className="max-w-[480px] mx-auto" role="widget">
      <Stack as="form">
        <TransferSource
          isConnected={isConnected}
          onConnectProvider={() => {}}
          selectedAsset={selectedAsset}
          sourceChain={sourceChain}
          openChainSelector={onChangeSourceChain}
        />
      </Stack>
    </section>
  );
};
