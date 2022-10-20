import { Router } from "router";
import {
  CheckIsLockedMsg,
  DeriveAccountMsg,
  QueryAccountsMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  CheckPasswordMsg,
  GenerateMnemonicMsg,
  SaveMnemonicMsg,
  SignTxMsg,
  EncodeTransferMsg,
  EncodeIbcTransferMsg,
  EncodeInitAccountMsg,
} from "./messages";
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
  router.registerMessage(SaveMnemonicMsg);
  router.registerMessage(SignTxMsg);
  router.registerMessage(EncodeTransferMsg);
  router.registerMessage(EncodeIbcTransferMsg);
  router.registerMessage(EncodeInitAccountMsg);

  router.addHandler(ROUTE, getHandler(service));
}
