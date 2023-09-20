export enum TopLevelRoute {
  Default = "/",
  ApproveConnection = "/connection",
  ApproveTx = "/tx",
  Login = "/login",
  Setup = "/setup",

  /* WALLET */
  Accounts = "/accounts",
  AddAccount = "/accounts/add",
  Tokens = "/tokens",
  AddTokens = "/tokens/add",

  /* SETTINGS */
  // NOTE: The following are not used as of now, but will be in the future:
  Settings = "/settings",
}
