import { Router } from "router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { AccountChangedEvent } from "./messages";
import { ContentService } from "./service";

export function init(router: Router, service: ContentService): void {
  router.registerMessage(AccountChangedEvent);

  router.addHandler(ROUTE, getHandler(service));
}
