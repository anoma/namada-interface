import { BridgeTransferProps, IbcTransferProps } from "@anoma/types";

export interface Integration<T, S, P = BridgeTransferProps | IbcTransferProps> {
  detect: () => boolean;
  connect: () => Promise<void>;
  accounts: () => Promise<readonly T[] | undefined>;
  signer: () => S | undefined;
  submitBridgeTransfer: (props: P) => Promise<void>;
}
