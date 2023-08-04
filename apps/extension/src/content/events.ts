import { Events } from "@namada/types";

import { Message, Router, Routes } from "../router";
import { TxType } from "@namada/shared";

// Used by Firefox to copy the object from the content script scope to the
// page script scope.
declare function cloneInto<T>(data: T, global: Window | null): T;

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

export class UpdatedBalancesEventMsg extends Message<void> {
  public static type(): Events {
    return Events.UpdatedBalances;
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
    return UpdatedBalancesEventMsg.type();
  }
}

export class UpdatedStakingEventMsg extends Message<void> {
  public static type(): Events {
    return Events.UpdatedStaking;
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
    return UpdatedStakingEventMsg.type();
  }
}

export class TxStartedEvent extends Message<void> {
  public static type(): Events {
    return Events.TxStarted;
  }

  constructor(
    public readonly chainId: string,
    public readonly msgId: string,
    public readonly txType: TxType
  ) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chainId must not be empty");
    }

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
    public readonly chainId: string,
    public readonly msgId: string,
    public readonly txType: TxType,
    public readonly success?: boolean,
    public readonly payload?: string
  ) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chainId must not be empty");
    }

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
    return ProposalsUpdatedEventMsg.type();
  }
}

export function initEvents(router: Router): void {
  router.registerMessage(AccountChangedEventMsg);
  router.registerMessage(TxStartedEvent);
  router.registerMessage(TxCompletedEvent);
  router.registerMessage(UpdatedBalancesEventMsg);
  router.registerMessage(UpdatedStakingEventMsg);
  router.registerMessage(ProposalsUpdatedEventMsg);

  router.addHandler(Routes.InteractionForeground, (_, msg) => {
    const clonedMsg =
      typeof cloneInto !== "undefined"
        ? cloneInto(msg, document.defaultView)
        : msg;

    switch (msg.constructor) {
      case AccountChangedEventMsg:
        if ((msg as AccountChangedEventMsg).chainId) {
          window.dispatchEvent(
            new CustomEvent(Events.AccountChanged, { detail: clonedMsg })
          );
        }
        break;
      case TxStartedEvent:
        window.dispatchEvent(
          new CustomEvent(Events.TxStarted, { detail: clonedMsg })
        );
        break;
      case TxCompletedEvent:
        window.dispatchEvent(
          new CustomEvent(Events.TxCompleted, { detail: clonedMsg })
        );
        break;
      case UpdatedBalancesEventMsg:
        window.dispatchEvent(new CustomEvent(Events.UpdatedBalances));
        break;
      case UpdatedStakingEventMsg:
        window.dispatchEvent(new CustomEvent(Events.UpdatedStaking));
        break;
      case ProposalsUpdatedEventMsg:
        window.dispatchEvent(new CustomEvent(Events.ProposalsUpdated));
        break;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
