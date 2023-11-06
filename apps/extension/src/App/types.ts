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
  ParentAccounts = "parent-accounts",
  ViewAccount = "view/:accountId",
  DeleteAccount = "delete/:accountId",
  RenameAccount = "rename/:accountId",
  AddAccount = "add",
}
