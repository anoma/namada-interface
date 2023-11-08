import {
  AccountType,
  BridgeTransferProps,
  IbcTransferProps,
  TokenBalance,
  TxProps,
} from "@namada/types";

export type BridgeProps = {
  ibcProps?: IbcTransferProps;
  bridgeProps?: BridgeTransferProps;
  txProps: TxProps;
};

export interface Integration<T, S> {
  detect: () => boolean;
  connect: () => Promise<void>;
  accounts: () => Promise<readonly T[] | undefined>;
  signer: () => S | undefined;
  submitBridgeTransfer: (
    props: BridgeProps,
    type: AccountType
  ) => Promise<void>;
  queryBalances: (owner: string) => Promise<TokenBalance[]>;
  signArbitrary: (
    chainId: string,
    signer: string,
    data: string
  ) => Promise<{ signature: string; pub_key: { type: string; value: string } }>;
}
