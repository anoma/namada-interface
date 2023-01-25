# Browser Extension - Key Management

Key management (creating mnemonics and accounts, deriving addresses) has been moved into the extension, and is
utilized entirely within the extension's own interface. Accounts and addresses created within the extension
are now made available to `namada-interface` via an injected API.

## Requirements

The following requirements have been implemented in the extension:

- User should be able to generate a mnemonic
- User should be prompted to set a password for this seed
- User should be able to generate keys for any supported chain
- User should be able to input a derivation path to derive a new account
- User should be able to sign transactions in `namada-interface` using keys stored in extension

## References

- See `polkadot{js} extension` - This is the experience we wish to replicate <https://github.com/polkadot-js>
