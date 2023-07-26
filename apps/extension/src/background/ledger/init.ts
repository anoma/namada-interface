import { Router } from "router";
import { ROUTE } from "./constants";
import {
  AddLedgerAccountMsg,
  GetTxBytesMsg,
  GetRevealPKBytesMsg,
  SubmitSignedTxMsg,
  SubmitSignedRevealPKMsg,
} from "./messages";
import { getHandler } from "./handler";
import { LedgerService } from "./service";

export function init(router: Router, service: LedgerService): void {
  router.registerMessage(AddLedgerAccountMsg);
  router.registerMessage(GetTxBytesMsg);
  router.registerMessage(GetRevealPKBytesMsg);
  router.registerMessage(SubmitSignedTxMsg);
  router.registerMessage(SubmitSignedRevealPKMsg);

  router.addHandler(ROUTE, getHandler(service));
}
