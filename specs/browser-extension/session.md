# Browser Extension - Session Management

With the introduction of the browser extension, `namada-interface` no longer manages sessions for the user. (See [architecture.md](./architecture.md) for information on authentication).

When a user has successfully logged into their extension, a password is stored in a local scope, and will be valid until either the service worker (in Chrome) expires,
or the user intentionally locks their wallet.

Persistence is achieved by storing the user's mnemonic phrase and private keys (along with derivation paths and associated addresses). This may change with the
integration with the SDK, as we may need to store a Borsh-serialized struct to instantiate when interacting with the SDK. (_NOTE_ More research is needed into this.)
