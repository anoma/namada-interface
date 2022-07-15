export const TopLevelRouteGenerator = {
  // this creates a route for TopLevelRoute.Token
  createRouteForTokenByTokenId: (tokenId: string) => `/token/${tokenId}`,

  // this creates a route for TopLevelRoute.Wallet
  createRouteForWallet: () => TopLevelRoute.Wallet,
};

export enum TopLevelRoute {
  /* INITIAL ACCOUNT */
  Home = "/",
  AccountCreation = "/account-creation",

  /* WALLET */
  Wallet = "/",
  WalletAddAccount = "/add-account",

  /* BRIDGE */
  Bridge = "/bridge",

  /* TOKENS */
  Token = "/token/:id",
  TokenSend = "/token/send",
  TokenSendTarget = "/token/send/:accountIndex/:target",
  TokenReceive = "/token/receive",
  TokenTransfers = "/token/:id/transfers/token/:token",
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
