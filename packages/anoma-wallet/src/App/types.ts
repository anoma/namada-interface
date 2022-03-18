const SETTINGS = "";

export enum TopLevelRoute {
  Home = "/",
  Wallet = "/wallet",
  StakingAndGovernance = "/staking-and-governance",
  Settings = "/settings",
  SettingsAccounts = "/settings/accounts",
  SettingsAccountCreation = "/settings/account-creation",
  SettingsWalletSettings = "/settings/wallet-settings",
  SettingsAccountSettings = "/settings/account-settings",
}

export const LOCAL_STORAGE_MASTER_KEY_PAIR_ALIAS = "accountAlias";
export const LOCAL_STORAGE_MASTER_KEY_PAIR_STORAGE_VALUE =
  "accountStorageValue";
