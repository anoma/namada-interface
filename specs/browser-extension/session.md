# Browser Extension - Session Management

As the user's keys will be managed within the browser extension, the way `namada-interface` will handle session management will fundamentally change.

Presently, in `namada-interface`, a user's data (mnemonic, derived keys, persisted state) is encrypted and stored in the browser via `localStorage` API. Authentication is
performed by attempting to decrypt the user's seed with a given password. As there is no server-side component to the application, or any authentication authority
to provide a session token for maintaining a login session state, as soon as the user's password becomes undefined, the user is no longer logged in.

With the browser extension in place, the user's session can be persisted outside of `namada-interface` and within the background processing of the extension. We should consider the following:

- Once a user has authenticated and approved a connection to the extension, accounts will be availabe to the interface
- We can set a session timeout variable (a fixed timeout), or make this timeout relative to inactivity, after which we encrypt the stored keys
- From `namada-interface`, all authentication will simply depend on it's connection to a key store in the extension, and will maintain no login state of its own.
  Authentication simply means the user has decrypted their extension data and connected the interface to it.

## References

### keplr-wallet session management

In the following block, we can see how `keplr-wallet` authenticates a user. As the stored keyring is encrypted, the
extension will attempt to decrypt the values in storage and load the values into the application's context, thus
establishing a session for the user.

- Unlock the keyring:
  <https://github.com/chainapsis/keplr-wallet/blob/master/packages/background/src/keyring/keyring.ts#L345-L377>

See `keyring.ts` at <https://github.com/chainapsis/keplr-wallet/blob/master/packages/background/src/keyring/keyring.ts>
