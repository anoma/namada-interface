import { Router } from "router";
import { ROUTE } from "./constants";
import {
  AddLedgerAccountMsg,
  GetTransferBytesMsg,
  SubmitSignedTransferMsg,
} from "./messages";
import { getHandler } from "./handler";
import { LedgerService } from "./service";

export function init(router: Router, service: LedgerService): void {
  router.registerMessage(AddLedgerAccountMsg);
  router.registerMessage(GetTransferBytesMsg);
  router.registerMessage(SubmitSignedTransferMsg);

  router.addHandler(ROUTE, getHandler(service));
}
