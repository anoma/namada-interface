export enum TopLevelRoute {
  Home = "/",
  AccountCreation = "/account-creation",
  Wallet = "/",
  WalletAddAccount = "/add-account",
  StakingAndGovernance = "/staking-and-governance",
  Settings = "/settings",
  SettingsAccounts = "/settings/accounts",
  SettingsWalletSettings = "/settings/wallet-settings",
  SettingsAccountSettings = "/settings/account-settings",
}

export const LOCAL_STORAGE_MASTER_KEY_PAIR_ALIAS = "accountAlias";

export enum LocalStorage {
  Alias = "accountAlias",
  MasterSeedKey = "seed",
  SessionKey = "session",
}
