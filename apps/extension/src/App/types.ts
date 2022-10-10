export enum TopLevelRoute {
  /* WALLET */
  Wallet = "/",
  WalletAddAccount = "/add-account",

  /* SETTINGS */
  // NOTE: The following are not used as of now, but will be in the future:
  Settings = "/settings",
  SettingsAccounts = "/settings/accounts",
  SettingsWalletSettings = "/settings/wallet-settings",
  SettingsAccountSettings = "/settings/account-settings/:id",
}
