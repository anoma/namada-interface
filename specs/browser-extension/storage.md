# Browser Extension - Storage

## Requirements

- The user's generated mnemonic should be stored in the browser from the extension (encrypted with the password provided during Account Creation)
- Any derived keys will also need to be stored and encrypted in a similar fashion

## References

- See `keplr-wallet/packages/store` for Key/Value store Promised-based store (IndexedDB) - This can be reused to actually store the data

### keplr-wallet key storage implementation

- `CreatePrivateKeyStore`
  <https://github.com/chainapsis/keplr-wallet/blob/a3aedc2b2769227cbc7e5da0e649101ad3edd721/packages/background/src/keyring/keyring.ts#L1088-L1103>

See `keyring.ts` at <https://github.com/chainapsis/keplr-wallet/blob/master/packages/background/src/keyring/keyring.ts>
