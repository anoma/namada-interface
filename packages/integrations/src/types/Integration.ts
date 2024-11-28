import {
  EthBridgeTransferProps,
  IbcTransferProps,
  WrapperTxProps,
} from "@namada/types";

export type BridgeProps = {
  ibcProps?: IbcTransferProps;
  bridgeProps?: EthBridgeTransferProps;
  txProps: WrapperTxProps;
};

export interface Integration<T, S> {
  detect: () => boolean;
  connect: (chainId: string) => Promise<void>;
  accounts: () => Promise<readonly T[] | undefined>;
  signer: () => S | undefined;
}
