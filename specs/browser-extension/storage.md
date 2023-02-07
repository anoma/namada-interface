# Browser Extension - Storage

## Requirements

The browser extension incorporates the following storage requirements:

- The user's generated mnemonic is stored in the browser from the extension (encrypted with the password provided during Account Creation) using an IndexedDB key/value store
- Any derived keys are also stored and encrypted in a similar fashion, along with the related BIP44 derivation paths and public addresses.

Even with integration of the Namada SDK, the extension will be responsible for storing private data on behalf of the user. The form of the stored value _may_ change, however.
For now, we will likely be able to utilize SDK functionality by instantiating the appropriate `Store` struct with the relevant private keys of the user.

## References

- See `keplr-wallet/packages/store` for Key/Value store Promised-based store (IndexedDB), as our implementation is similar.

### keplr-wallet key storage implementation

- `CreatePrivateKeyStore`
  <https://github.com/chainapsis/keplr-wallet/blob/a3aedc2b2769227cbc7e5da0e649101ad3edd721/packages/background/src/keyring/keyring.ts#L1088-L1103>

See `keyring.ts` at <https://github.com/chainapsis/keplr-wallet/blob/master/packages/background/src/keyring/keyring.ts>
