export enum TopLevelRoute {
  /* INITIAL ACCOUNT */
  Home = "/",
  AccountCreation = "/account-creation",

  /* WALLET */
  Wallet = "/",
  WalletAddAccount = "/add-account",

  /* TOKENS */
  Token = "/token/:id",
  TokenSend = "/token/:id/send",
  TokenSendTarget = "/token/send/:tokenType/:target",
  TokenReceive = "/token/:id/receive",
  TokenTransfers = "/token/:id/transfers",
  TokenTransferDetails = "/token/:id/transfers/:appliedHash",
  TokenIbcTransfer = "/token/:id/ibc-transfer",

  /* STAKING AND GOVERNANCE */
  StakingAndGovernance = "/staking-and-governance",

  /* SETTINGS */
  Settings = "/settings",
  SettingsAccounts = "/settings/accounts",
  SettingsWalletSettings = "/settings/wallet-settings",
  SettingsAccountSettings = "/settings/account-settings/:id",
}

export enum LocalStorageKeys {
  MasterSeed = "com.anoma.network:seed",
  Session = "com.anoma.network:session",
  Persist = "com.anoma.network:state",
}
