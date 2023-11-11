import { Router } from "router";
import {
  DeriveAccountMsg,
  QueryPublicKeyMsg,
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
  AddLedgerAccountMsg,
  RevealAccountMnemonicMsg,
} from "./messages";
import {
  QueryAccountsMsg,
  QueryBalancesMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
  CheckDurabilityMsg,
} from "provider/messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(QueryPublicKeyMsg);
  router.registerMessage(CloseOffscreenDocumentMsg);
  router.registerMessage(DeriveAccountMsg);
  router.registerMessage(GenerateMnemonicMsg);
  router.registerMessage(GetActiveAccountMsg);
  router.registerMessage(QueryAccountsMsg);
  router.registerMessage(QueryBalancesMsg);
  router.registerMessage(QueryParentAccountsMsg);
  router.registerMessage(SaveMnemonicMsg);
  router.registerMessage(ScanAccountsMsg);
  router.registerMessage(SetActiveAccountMsg);
  router.registerMessage(TransferCompletedEvent);
  router.registerMessage(DeleteAccountMsg);
  router.registerMessage(FetchAndStoreMaspParamsMsg);
  router.registerMessage(HasMaspParamsMsg);
  router.registerMessage(ValidateMnemonicMsg);
  router.registerMessage(CheckDurabilityMsg);
  router.registerMessage(AddLedgerAccountMsg);
  router.registerMessage(RevealAccountMnemonicMsg);

  router.addHandler(ROUTE, getHandler(service));
}
