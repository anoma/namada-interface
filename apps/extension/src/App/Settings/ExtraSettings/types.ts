import { ParentAccount } from "background/keyring";

// Extra settings modes
export enum Mode {
  ResetPassword = "Reset password",
  DeleteAccount = "Delete account",
}

export type ExtraSetting = {
  mode: Mode;
  accountId: string;
  accountType: ParentAccount;
};
