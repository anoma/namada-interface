# packages/chains

This package contains various chain configurations for each chain supported `namada-interface`. These configurations
must adhere to the following type definition:

```typescript
export type Chain = {
  alias: string;
  bech32Prefix: string;
  bip44: {
    coinType: number;
  };
  chainId: string;
  currency: Currency;
  extension: ExtensionInfo;
  rpc: string;
  ibc?: {
    portId: string;
  };
};
```
