export interface Integration<T, S> {
  detect: () => boolean;
  connect: () => Promise<void>;
  accounts: () => Promise<readonly T[] | undefined>;
  signer: () => S | undefined;
}
