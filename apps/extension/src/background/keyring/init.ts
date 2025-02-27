import {
  CheckDurabilityMsg,
  GenDisposableSignerMsg,
  QueryAccountsMsg,
  QueryDefaultAccountMsg,
  VerifyArbitraryMsg,
} from "provider/messages";
import { Router } from "router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import {
  AddLedgerAccountMsg,
  DeleteAccountMsg,
  DeriveShieldedAccountMsg,
  GenerateMnemonicMsg,
  GetActiveAccountMsg,
  QueryAccountDetailsMsg,
  QueryParentAccountsMsg,
  RenameAccountMsg,
  RevealAccountMnemonicMsg,
  RevealSpendingKeyMsg,
  SaveAccountSecretMsg,
  SetActiveAccountMsg,
  ValidateMnemonicMsg,
} from "./messages";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(DeriveShieldedAccountMsg);
  router.registerMessage(GenerateMnemonicMsg);
  router.registerMessage(GetActiveAccountMsg);
  router.registerMessage(QueryAccountsMsg);
  router.registerMessage(QueryDefaultAccountMsg);
  router.registerMessage(QueryParentAccountsMsg);
  router.registerMessage(QueryAccountDetailsMsg);
  router.registerMessage(SaveAccountSecretMsg);
  router.registerMessage(SetActiveAccountMsg);
  router.registerMessage(DeleteAccountMsg);
  router.registerMessage(ValidateMnemonicMsg);
  router.registerMessage(CheckDurabilityMsg);
  router.registerMessage(AddLedgerAccountMsg);
  router.registerMessage(RevealAccountMnemonicMsg);
  router.registerMessage(RevealSpendingKeyMsg);
  router.registerMessage(RenameAccountMsg);
  router.registerMessage(VerifyArbitraryMsg);
  router.registerMessage(GenDisposableSignerMsg);

  router.addHandler(ROUTE, getHandler(service));
}
