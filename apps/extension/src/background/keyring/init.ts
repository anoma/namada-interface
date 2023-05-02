import { Router } from "router";
import {
  CheckIsLockedMsg,
  DeriveAccountMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  CheckPasswordMsg,
  GenerateMnemonicMsg,
  SaveMnemonicMsg,
  SetActiveAccountMsg,
  GetActiveAccountMsg,
  QueryParentAccountsMsg,
} from "./messages";
import {
  ConnectInterfaceMsg,
  SubmitTransferMsg,
  EncodeInitAccountMsg,
  QueryAccountsMsg,
  EncodeRevealPkMsg,
  SubmitBondMsg,
  SubmitUnbondMsg,
  SubmitIbcTransferMsg,
} from "provider/messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(CheckIsLockedMsg);
  router.registerMessage(ConnectInterfaceMsg);
  router.registerMessage(DeriveAccountMsg);
  router.registerMessage(QueryAccountsMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(GenerateMnemonicMsg);
  router.registerMessage(SaveMnemonicMsg);
  router.registerMessage(SubmitBondMsg);
  router.registerMessage(SubmitUnbondMsg);
  router.registerMessage(SubmitTransferMsg);
  router.registerMessage(SubmitIbcTransferMsg);
  router.registerMessage(EncodeInitAccountMsg);
  router.registerMessage(EncodeRevealPkMsg);
  router.registerMessage(SetActiveAccountMsg);
  router.registerMessage(GetActiveAccountMsg);
  router.registerMessage(QueryParentAccountsMsg);

  router.addHandler(ROUTE, getHandler(service));
}
