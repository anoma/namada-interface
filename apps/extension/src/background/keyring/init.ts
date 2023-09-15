import { Router } from "router";
import {
  CheckIsLockedMsg,
  DeriveAccountMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  CheckPasswordMsg,
  QueryPublicKeyMsg,
  ResetPasswordMsg,
  GenerateMnemonicMsg,
  SaveMnemonicMsg,
  ScanAccountsMsg,
  SetActiveAccountMsg,
  GetActiveAccountMsg,
  QueryParentAccountsMsg,
  TransferCompletedEvent,
  CloseOffscreenDocumentMsg,
  DeleteAccountMsg,
  ValidateMnemonicMsg,
} from "./messages";
import {
  QueryAccountsMsg,
  QueryBalancesMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
} from "provider/messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(CheckIsLockedMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(QueryPublicKeyMsg);
  router.registerMessage(CloseOffscreenDocumentMsg);
  router.registerMessage(DeriveAccountMsg);
  router.registerMessage(GenerateMnemonicMsg);
  router.registerMessage(GetActiveAccountMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(QueryAccountsMsg);
  router.registerMessage(QueryBalancesMsg);
  router.registerMessage(QueryParentAccountsMsg);
  router.registerMessage(ResetPasswordMsg);
  router.registerMessage(SaveMnemonicMsg);
  router.registerMessage(ScanAccountsMsg);
  router.registerMessage(SetActiveAccountMsg);
  router.registerMessage(TransferCompletedEvent);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(DeleteAccountMsg);
  router.registerMessage(FetchAndStoreMaspParamsMsg);
  router.registerMessage(HasMaspParamsMsg);
  router.registerMessage(ValidateMnemonicMsg);

  router.addHandler(ROUTE, getHandler(service));
}
