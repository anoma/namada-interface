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
  TokenReceive = "/token/:hash/receive",

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
