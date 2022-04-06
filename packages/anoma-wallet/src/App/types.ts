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

  /* STAKING AND GOVERNANCE */
  StakingAndGovernance = "/staking-and-governance",

  /* SETTINGS */
  Settings = "/settings",
  SettingsAccounts = "/settings/accounts",
  SettingsWalletSettings = "/settings/wallet-settings",
  SettingsAccountSettings = "/settings/account-settings/:hash",
}

export enum LocalStorageKeys {
  MasterSeed = "seed",
  Session = "session",
}
