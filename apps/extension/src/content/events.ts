import { NamadaEvent, TxType } from "@namada/sdk/web";
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

export class UpdatedBalancesEventMsg extends Message<void> {
  public static type(): Events {
    return Events.UpdatedBalances;
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
    return UpdatedBalancesEventMsg.type();
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

export class UpdatedStakingEventMsg extends Message<void> {
  public static type(): Events {
    return Events.UpdatedStaking;
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
    return UpdatedStakingEventMsg.type();
  }
}

export class TxStartedEvent extends Message<void> {
  public static type(): Events {
    return Events.TxStarted;
  }

  constructor(
    public readonly msgId: string,
    public readonly txType: TxType
  ) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId should not be empty");
    }

    if (!this.txType) {
      throw new Error("txType should not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return TxStartedEvent.type();
  }
}

export class TxCompletedEvent extends Message<void> {
  public static type(): Events {
    return Events.TxCompleted;
  }

  constructor(
    public readonly msgId: string,
    public readonly txType: TxType,
    public readonly success: boolean,
    public readonly txHash?: string,
    public readonly error?: { code: "REJECTED" | "UNKNOWN"; message?: string }
  ) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId should not be empty");
    }

    if (!this.txType) {
      throw new Error("txType should not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return TxCompletedEvent.type();
  }
}

export class ProposalsUpdatedEventMsg extends Message<void> {
  public static type(): Events {
    return Events.ProposalsUpdated;
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
    return ProposalsUpdatedEventMsg.type();
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
  router.registerMessage(UpdatedBalancesEventMsg);
  router.registerMessage(UpdatedStakingEventMsg);
  router.registerMessage(ProposalsUpdatedEventMsg);
  router.registerMessage(TxStartedEvent);
  router.registerMessage(TxCompletedEvent);
  router.registerMessage(VaultLockedEventMsg);
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
        dispatchNamadaEvent(new NamadaEvent(Events.AccountChanged));
        break;
      case NetworkChangedEventMsg:
        dispatchNamadaEvent(new NamadaEvent(Events.NetworkChanged));
        break;
      case TxStartedEvent:
        const txStartedEvent = clonedMsg as TxStartedEvent;
        dispatchNamadaEvent(
          new NamadaEvent(Events.TxStarted, {
            detail: {
              msgId: txStartedEvent.msgId,
              txType: txStartedEvent.txType,
            },
          })
        );
        break;
      case TxCompletedEvent:
        const txCompletedEvent = clonedMsg as TxCompletedEvent;
        dispatchNamadaEvent(
          new NamadaEvent(Events.TxCompleted, {
            detail: {
              msgId: txCompletedEvent.msgId,
              txType: txCompletedEvent.txType,
              success: txCompletedEvent.success,
              txHash: txCompletedEvent.txHash,
              error: txCompletedEvent.error,
            },
          })
        );
        break;
      case UpdatedBalancesEventMsg:
        dispatchNamadaEvent(new NamadaEvent(Events.UpdatedBalances));
        break;
      case UpdatedStakingEventMsg:
        dispatchNamadaEvent(new NamadaEvent(Events.UpdatedStaking));
        break;
      case ProposalsUpdatedEventMsg:
        dispatchNamadaEvent(new NamadaEvent(Events.ProposalsUpdated));
        break;
      case VaultLockedEventMsg:
        dispatchNamadaEvent(new NamadaEvent(Events.ExtensionLocked));
        break;
      case ConnectionRevokedEventMsg:
        dispatchNamadaEvent(new NamadaEvent(Events.ConnectionRevoked));
        break;
      default:
        throw new Error("Unknown msg type");
    }
  });
}

// Wrapper around window.dispatchEvent for better type safety.
const dispatchNamadaEvent = <E extends Events>(
  event: NamadaEvent<E>
): boolean => window.dispatchEvent(event);
