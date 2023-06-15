// Constants defining events which may be subscribed to

// Anoma extension events
export enum Events {
  AccountChanged = "anoma-account-changed",
  TransferStarted = "anoma-transfer-started",
  TransferCompleted = "anoma-transfer-completed",
  UpdatedBalances = "anoma-updated-balances",
}

// Keplr extension events
export enum KeplrEvents {
  AccountChanged = "keplr_keystorechange",
}

// Metamask extension window.ethereum events
export enum MetamaskEvents {
  AccountChanged = "accountsChanged",
  NetworkChanged = "networkChanged",
}
