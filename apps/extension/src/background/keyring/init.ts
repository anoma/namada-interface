import { Router } from "router";
import {
  CheckIsLockedMsg,
  DeriveAccountMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  CheckPasswordMsg,
  ResetPasswordMsg,
  GenerateMnemonicMsg,
  SaveMnemonicMsg,
  SetActiveAccountMsg,
  GetActiveAccountMsg,
  QueryParentAccountsMsg,
  TransferCompletedEvent,
  CloseOffscreenDocumentMsg,
  DeleteAccountMsg,
  ValidateMnemonicMsg,
} from "./messages";
import {
  ConnectInterfaceMsg,
  EncodeInitAccountMsg,
  QueryAccountsMsg,
  QueryBalancesMsg,
  EncodeRevealPkMsg,
  SubmitBondMsg,
  SubmitUnbondMsg,
  SubmitIbcTransferMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
} from "provider/messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(CheckIsLockedMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(CloseOffscreenDocumentMsg);
  router.registerMessage(ConnectInterfaceMsg);
  router.registerMessage(DeriveAccountMsg);
  router.registerMessage(EncodeInitAccountMsg);
  router.registerMessage(EncodeRevealPkMsg);
  router.registerMessage(GenerateMnemonicMsg);
  router.registerMessage(GetActiveAccountMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(QueryAccountsMsg);
  router.registerMessage(QueryBalancesMsg);
  router.registerMessage(QueryParentAccountsMsg);
  router.registerMessage(ResetPasswordMsg);
  router.registerMessage(SaveMnemonicMsg);
  router.registerMessage(SetActiveAccountMsg);
  router.registerMessage(SubmitBondMsg);
  router.registerMessage(SubmitIbcTransferMsg);
  router.registerMessage(SubmitUnbondMsg);
  router.registerMessage(TransferCompletedEvent);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(DeleteAccountMsg);
  router.registerMessage(FetchAndStoreMaspParamsMsg);
  router.registerMessage(HasMaspParamsMsg);
  router.registerMessage(ValidateMnemonicMsg);

  router.addHandler(ROUTE, getHandler(service));
}
