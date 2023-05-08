import { Events } from "@anoma/types";

import { Message, Router, Routes } from "../router";

export class AccountChangedEventMsg extends Message<void> {
  public static type(): Events {
    return Events.AccountChanged;
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chainId must not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return AccountChangedEventMsg.type();
  }
}

export function initEvents(router: Router): void {
  router.registerMessage(AccountChangedEventMsg);

  router.addHandler(Routes.InteractionForeground, (_, msg) => {
    switch (msg.constructor) {
      case AccountChangedEventMsg:
        if ((msg as AccountChangedEventMsg).chainId) {
          window.dispatchEvent(
            new CustomEvent(Events.AccountChanged, { detail: msg })
          );
        }
        return;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
