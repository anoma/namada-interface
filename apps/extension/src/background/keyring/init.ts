import { Router } from "router";
import {
  CheckIsLockedMsg,
  DeriveAccountMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  CheckPasswordMsg,
  GenerateMnemonicMsg,
  CloseOffscreenDocumentMsg,
  SaveMnemonicMsg,
} from "./messages";
import {
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
  router.registerMessage(DeriveAccountMsg);
  router.registerMessage(QueryAccountsMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(GenerateMnemonicMsg);
  router.registerMessage(CloseOffscreenDocumentMsg);
  router.registerMessage(SaveMnemonicMsg);
  router.registerMessage(SubmitBondMsg);
  router.registerMessage(SubmitUnbondMsg);
  router.registerMessage(SubmitTransferMsg);
  router.registerMessage(SubmitIbcTransferMsg);
  router.registerMessage(EncodeInitAccountMsg);
  router.registerMessage(EncodeRevealPkMsg);

  router.addHandler(ROUTE, getHandler(service));
}
