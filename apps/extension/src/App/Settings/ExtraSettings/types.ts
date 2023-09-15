import { ParentAccount } from "background/keyring";

// Extra settings modes
export enum Mode {
  ResetPassword = "Reset password",
  DeleteAccount = "Delete account",
  ConnectedSites = "Connected sites",
}


export type ExtraSetting =
  | { mode: Mode.ResetPassword, accountId: string }
  | { mode: Mode.DeleteAccount, accountId: string, accountType: ParentAccount }
  | { mode: Mode.ConnectedSites };
