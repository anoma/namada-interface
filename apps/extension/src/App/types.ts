export enum TopLevelRoute {
  Default = "/",
  ApproveConnection = "/connection",
  ApproveTx = "/tx",
  Login = "/login",
  Setup = "setup",

  /* WALLET */
  Accounts = "accounts",
  AddAccount = "accounts/add",
  ConnectedSites = "connected-sites",
}

export enum AccountManagementRoute {
  ViewAccounts = "view",
  ViewAccount = "view/:accountId/:type",
  DeleteAccount = "delete/:accountId",
  RenameAccount = "rename/:accountId",
  AddAccount = "add",
}
