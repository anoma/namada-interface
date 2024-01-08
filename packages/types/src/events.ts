// Constants defining events which may be subscribed to

// Namada extension events
export enum Events {
  AccountChanged = "namada-account-changed",
  NetworkChanged = "namada-network-changed",
  TxStarted = "namada-tx-started",
  TxCompleted = "namada-tx-completed",
  UpdatedBalances = "namada-updated-balances",
  UpdatedStaking = "namada-updated-staking",
  ProposalsUpdated = "namada-proposals-updated",
  ExtensionLocked = "namada-extension-locked",
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
