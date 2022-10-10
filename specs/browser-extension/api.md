# Browser Extension - API

## Requirements

- User should be able to approve or reject connection from `namada-interface` or any other web client
- User should be able to load accounts from extension into `namada-interface` or to any web client

## API Methods

The extension should provide an API to any client, that should roughly approximate the following:

- `enable(chainId: string): Promise<void>`
- `getSigner(chainId: string): Signer`
- `addChain(chainConfig: ChainConfig): Promise<boolean>` - **NOTE** In Keplr, this is called `Keplr.experimentalSuggestChain()`
- `<Signer>signer.accounts(): Account[]`
- `<Signer>signer.sign(account: Account, tx: Transaction): Promise<Transaction>`

API functionality should be implemented within the background scripts of the extension, making it available when the extension is not visible.

Our `background` scripts should provide a class instance with these methods exposed via `window.Anoma`, following an interface such as the following (for a basic use-case):

```ts
// NOTE: Interfacing with wasm, we use Uint8Array instead of string. This may make
// for a cleaner interface to our existing transaction code, but we may opt for using
// string instead in the extension:
type Transaction {
  hash: Uint8Array;
  tx: Uint8Array;
}

type Account {
  alias: string;
  address: string;
  publicKey: Uint8Array;
}

interface Signer {
  private readonly _privateKey: Uint8Array;
  public get accounts(): Account[];
  public sign(account: Account; tx: Transaction): Promise<Transaction>;
}

type ChainConfig {
  chainId: string;
  rpc: string;
  // etc.
}

interface Anoma {
  public enable(chainId: string): Promise<void>;
  public getSigner(chainId: string): Signer;
  public addChain(chainConfig: ChainConfig): Promise<boolean>;
  public get chains(): string[];
}
```

## References

- See `keplr-wallet` - We want to be able to query accounts/signers in a similar manner to this (hopefully with a slightly more elegant API of our choosing) <https://github.com/chainapsis/keplr-extension>
