import { Env, MessageSender } from "./types";

/**
 * This messaging system is influenced by cosmos-sdk.
 *
 * These messages are processed in the following order:
 *
 * 1. Deserialize the message
 * 2. Approve externally
 * 3. Validate the message arguments
 * 4. Handle message in routing
 *
 * This deserializing system has weak polymorphism feature. Message will be converted
 * to an object according to their class and registered type. Note that nested classes are not
 * supported. Non-primitive types or arrays that include non-primitive types in the message's fields
 * can't be decoded to their type properly. In this case, user should set their prototype manually.
 */
export abstract class Message<R> {
  /**
   * NOTE: The following is needed to infer the type of result from messaging in order to use messages
   * with easy and safe type checking. However, TypeScript doesn't infer the type of result if generic
   * R is not used in the structure due to its structural typing system. So, we need to use generic R
   * though there is no need to use generic R in structure. This is just dummy field for generic R, and
   * it is never actually used.
   */
  // eslint-disable-next-line
  // @ts-ignore
  protected _: R;

  abstract validate(): void;
  abstract route(): string;
  abstract type(): string;

  public origin!: string;
  public meta?: Record<string, string | number | undefined>;

  approveExternal(
    _env: Omit<Env, "requestInteraction">,
    _sender: MessageSender
  ): boolean {
    return false;
  }
}
