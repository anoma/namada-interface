import { Router } from "router";
import { ROUTE } from "./constants";
import {
  GetTxBytesMsg,
  GetRevealPKBytesMsg,
  SubmitSignedTxMsg,
  SubmitSignedRevealPKMsg,
  QueryStoredPK,
  StoreRevealedPK,
} from "./messages";
import { getHandler } from "./handler";
import { LedgerService } from "./service";

export function init(router: Router, service: LedgerService): void {
  router.registerMessage(GetTxBytesMsg);
  router.registerMessage(GetRevealPKBytesMsg);
  router.registerMessage(SubmitSignedTxMsg);
  router.registerMessage(SubmitSignedRevealPKMsg);
  router.registerMessage(QueryStoredPK);
  router.registerMessage(StoreRevealedPK);

  router.addHandler(ROUTE, getHandler(service));
}
