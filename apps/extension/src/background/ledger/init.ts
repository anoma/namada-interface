import { Router } from "router";
import { ROUTE } from "./constants";
import {
  AddLedgerAccountMsg,
  GetBondBytesMsg,
  GetRevealPKBytesMsg,
  GetTransferBytesMsg,
  SubmitSignedBondMsg,
  SubmitSignedRevealPKMsg,
  SubmitSignedUnbondMsg,
  SubmitSignedTransferMsg,
} from "./messages";
import { getHandler } from "./handler";
import { LedgerService } from "./service";

export function init(router: Router, service: LedgerService): void {
  router.registerMessage(AddLedgerAccountMsg);
  router.registerMessage(GetBondBytesMsg);
  router.registerMessage(GetRevealPKBytesMsg);
  router.registerMessage(GetTransferBytesMsg);
  router.registerMessage(SubmitSignedBondMsg);
  router.registerMessage(SubmitSignedRevealPKMsg);
  router.registerMessage(SubmitSignedUnbondMsg);
  router.registerMessage(SubmitSignedTransferMsg);

  router.addHandler(ROUTE, getHandler(service));
}
