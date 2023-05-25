// Extra settings modes
export enum Mode {
  ResetPassword = "Reset password",
};

export type ExtraSetting = {
  mode: Mode;
  accountId: string;
}
