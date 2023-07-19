import {
  BridgeTransferProps,
  IbcTransferProps,
  TokenBalance,
} from "@namada/types";

export type BridgeProps = {
  ibcProps?: IbcTransferProps;
  bridgeProps?: BridgeTransferProps;
};

export interface Integration<T, S> {
  detect: () => boolean;
  connect: () => Promise<void>;
  accounts: () => Promise<readonly T[] | undefined>;
  signer: () => S | undefined;
  submitBridgeTransfer: (props: BridgeProps) => Promise<void>;
  queryBalances: (owner: string) => Promise<TokenBalance[]>;
}
