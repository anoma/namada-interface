// Constants defining events which may be subscribed to

// Namada extension events
export enum Events {
  AccountChanged = "namada-account-changed",
  NetworkChanged = "namada-network-changed",
  ExtensionLocked = "namada-extension-locked",
  ExtensionUnlocked = "namada-extension-unlocked",
  ConnectionRevoked = "namada-connection-revoked",
}

// Keplr extension events
export enum KeplrEvents {
  AccountChanged = "keplr_keystorechange",
}

// Metamask extension window.ethereum events
export enum MetamaskEvents {
  AccountChanged = "accountsChanged",
  BridgeTransferCompleted = "bridge-transfer-completed",
}
