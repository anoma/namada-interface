import {
  CheckDurabilityMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
  QueryAccountsMsg,
  QueryBalancesMsg,
  QueryDefaultAccountMsg,
  VerifyArbitraryMsg,
} from "provider/messages";
import { Router } from "router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import {
  AddLedgerAccountMsg,
  CloseOffscreenDocumentMsg,
  DeleteAccountMsg,
  DeriveAccountMsg,
  GenerateMnemonicMsg,
  GetActiveAccountMsg,
  QueryParentAccountsMsg,
  QueryPublicKeyMsg,
  RenameAccountMsg,
  RevealAccountMnemonicMsg,
  SaveAccountSecretMsg,
  ScanAccountsMsg,
  SetActiveAccountMsg,
  TransferCompletedEvent,
  ValidateMnemonicMsg,
} from "./messages";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(QueryPublicKeyMsg);
  router.registerMessage(CloseOffscreenDocumentMsg);
  router.registerMessage(DeriveAccountMsg);
  router.registerMessage(GenerateMnemonicMsg);
  router.registerMessage(GetActiveAccountMsg);
  router.registerMessage(QueryAccountsMsg);
  router.registerMessage(QueryDefaultAccountMsg);
  router.registerMessage(QueryBalancesMsg);
  router.registerMessage(QueryParentAccountsMsg);
  router.registerMessage(SaveAccountSecretMsg);
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
  router.registerMessage(RenameAccountMsg);
  router.registerMessage(VerifyArbitraryMsg);

  router.addHandler(ROUTE, getHandler(service));
}
