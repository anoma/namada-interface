import { TxType } from "@namada/shared";
import { Events } from "@namada/types";

export type TxStartedDetail = {
  msgId: string;
  txType: TxType;
};

export type TxCompletedErrorCode = "REJECTED" | "UNKNOWN";

// TODO: This could be made more precise with something like:
// type TxCompletedDetail = { success: true, ... } | { success: false, ... }
export type TxCompletedDetail = {
  msgId: string;
  txType: TxType;
  success: boolean;
  txHash?: string;
  error?: { code: TxCompletedErrorCode; message?: string };
};

// Specifies the type of the event object's `detail` field
export type Detail<E extends Events> =
  E extends Events.TxStarted ? TxStartedDetail
  : E extends Events.TxCompleted ? TxCompletedDetail
  : E extends (
    | Events.AccountChanged
    | Events.NetworkChanged
    | Events.UpdatedBalances
    | Events.UpdatedStaking
    | Events.ProposalsUpdated
    | Events.ExtensionLocked
    | Events.ConnectionRevoked
  ) ?
    undefined
  : never;

export type NamadaEventConstructorParams<E extends Events> =
  // If we forgot to specify what type of detail an event should have...
  Detail<E> extends never ?
    // ...don't allow constructing an event object
    never
  : // Otherwise, if the event doesn't require any detail...
  Detail<E> extends undefined ?
    // ...make the parameter containing the detail optional
    [E] | [E, CustomEventInit<Detail<E>> | undefined]
  : // Otherwise, require that the detail property is present in the second parameter
    [
      E,
      CustomEventInit<Detail<E>> &
        Required<Pick<CustomEventInit<Detail<E>>, "detail">>,
    ];

// Wrapper around CustomEvent to provide better type safety.
// An instance of NamadaEvent can only be constructed by passing the correct
// type of detail for a given event.
export class NamadaEvent<E extends Events> extends CustomEvent<Detail<E>> {
  private readonly _type: E;

  constructor(...[type, init]: NamadaEventConstructorParams<E>) {
    super(type, init);
    this._type = type;
  }

  /**
   * Needed to override CustomEvent defining type of `type` as `string`.
   * Prevents problems like:
   *
   *   const event: NamadaEvent<Events.TxStarted> = { ..., type: "bad type" }
   */
  get type(): E {
    return this._type;
  }
}

// Maps events to event objects for all Namada events that have detail defined.
type EventMap = {
  [E in Events as Detail<E> extends never ? never : E]: NamadaEvent<E>;
};

declare global {
  /**
   * Provides types to window.addEventListener for Namada events e.g.
   *
   *   window.addEventListener(
   *     Events.TxCompleted,
   *     (e: NamadaEvent<Events.TxCompleted>) => {}
   *   );
   */
  interface WindowEventMap extends EventMap {}
}
