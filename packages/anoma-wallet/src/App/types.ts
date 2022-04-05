export enum TopLevelRoute {
  /* INITIAL ACCOUNT */
  Home = "/",
  AccountCreation = "/account-creation",

  /* WALLET */
  Wallet = "/",
  WalletAddAccount = "/add-account",

  /* TOKENS */
  Token = "/token/:hash",
  TokenSend = "/token/:hash/send",
  TokenSendTarget = "/token/:hash/send/:target",
  TokenReceive = "/token/:hash/receive",
  TokenTransfers = "/token/:hash/transfers",
  TokenTransferDetails = "/token/:hash/transfers/:appliedHash",

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
