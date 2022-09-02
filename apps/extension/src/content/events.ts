import { Message, Router } from "../router";
import { Events, Routes } from "../types";

class PushEventDataMsg extends Message<void> {
  public static type() {
    return Events.PushEventData;
  }

  constructor(
    public readonly data: {
      type: string;
      data: unknown;
    }
  ) {
    super();
  }

  validate(): void {
    if (!this.data.type) {
      throw new Error("Type should not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return PushEventDataMsg.type();
  }
}

export function initEvents(router: Router) {
  router.registerMessage(PushEventDataMsg);

  router.addHandler(Routes.InteractionForeground, (_, msg) => {
    switch (msg.constructor) {
      case PushEventDataMsg:
        if ((msg as PushEventDataMsg).data.type === Events.KeystoreChanged) {
          window.dispatchEvent(new Event("anoma_keystoreupdated"));
        }
        return;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
