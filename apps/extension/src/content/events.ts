import { Events } from "@namada/types";
import { LocalStorage } from "storage";
import { Message, Router, Routes } from "../router";

// Used by Firefox to copy the object from the content script scope to the
// page script scope.
declare function cloneInto<T>(data: T, global: Window | null): T;

export class AccountChangedEventMsg extends Message<void> {
  public static type(): Events {
    return Events.AccountChanged;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return AccountChangedEventMsg.type();
  }
}

export class NetworkChangedEventMsg extends Message<void> {
  public static type(): Events {
    return Events.NetworkChanged;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return NetworkChangedEventMsg.type();
  }
}

export class VaultLockedEventMsg extends Message<void> {
  public static type(): Events {
    return Events.ExtensionLocked;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return VaultLockedEventMsg.type();
  }
}

export class VaultUnlockedEventMsg extends Message<void> {
  public static type(): Events {
    return Events.ExtensionUnlocked;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return VaultUnlockedEventMsg.type();
  }
}

export class ConnectionRevokedEventMsg extends Message<void> {
  public static type(): Events {
    return Events.ConnectionRevoked;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return ConnectionRevokedEventMsg.type();
  }
}

export function initEvents(router: Router, localStorage: LocalStorage): void {
  router.registerMessage(AccountChangedEventMsg);
  router.registerMessage(NetworkChangedEventMsg);
  router.registerMessage(VaultLockedEventMsg);
  router.registerMessage(VaultUnlockedEventMsg);
  router.registerMessage(ConnectionRevokedEventMsg);

  router.addHandler(Routes.InteractionForeground, async (_, msg) => {
    const clonedMsg =
      typeof cloneInto !== "undefined" ?
        cloneInto(msg, document.defaultView)
      : msg;

    if (msg.constructor !== ConnectionRevokedEventMsg) {
      const approvedOrigins = (await localStorage.getApprovedOrigins()) || [];
      if (!approvedOrigins.includes(origin)) {
        return;
      }
    }

    switch (msg.constructor) {
      case AccountChangedEventMsg:
        window.dispatchEvent(
          new CustomEvent(Events.AccountChanged, { detail: clonedMsg })
        );
        break;
      case NetworkChangedEventMsg:
        window.dispatchEvent(new CustomEvent(Events.NetworkChanged));
        break;
      case VaultLockedEventMsg:
        window.dispatchEvent(new CustomEvent(Events.ExtensionLocked));
        break;
      case VaultUnlockedEventMsg:
        window.dispatchEvent(new CustomEvent(Events.ExtensionUnlocked));
        break;
      case ConnectionRevokedEventMsg:
        window.dispatchEvent(new CustomEvent(Events.ConnectionRevoked));
        break;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
