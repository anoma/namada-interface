# integrations

This package contains extension integrations for use with `namada-interface`.

- Anoma Extension
- Keplr Wallet
- Metamask Wallet

Each integration must implement the `Integration` interface, and define implementations for the following methods:

- `detect` - Determines the presence of the extension.
- `connect(chainId)` - Method by which the extension is connected to the interface.
- `accounts` - Returns all accounts for connected extension.
- `signer` - This method returns a signing class instance which is used for signing and submitting transactions.
- `submitBridgeTransfer` - This method allows the client to submit transactions either over IBC or the Ethereum bridge. Which method is used is determined by the properties and features enabled in the corresponding `Chain` configuration.
