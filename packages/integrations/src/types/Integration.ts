import {
  Chain,
  EthBridgeTransferProps,
  IbcTransferProps,
  TxProps,
} from "@namada/types";

export type BridgeProps = {
  ibcProps?: IbcTransferProps;
  bridgeProps?: EthBridgeTransferProps;
  txProps: TxProps;
};

export interface Integration<T, S> {
  detect: () => boolean;
  connect: (chainId: string) => Promise<void>;
  accounts: () => Promise<readonly T[] | undefined>;
  getChain?: () => Promise<Chain | undefined>;
  signer: () => S | undefined;
  sync: (owners: string[]) => Promise<void>;
}
