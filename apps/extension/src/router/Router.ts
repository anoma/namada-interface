import { Message } from "./Message";
import { Handler } from "./Handler";
import { EnvProducer, Guard, MessageSender, RoutedMessage } from "./types";
import { MessageRegistry } from "./MessageRegistry";

export abstract class Router {
  protected msgRegistry: MessageRegistry = new MessageRegistry();
  protected registeredHandler: Map<string, Handler> = new Map();
  protected guards: Guard[] = [];
  protected port = "";

  constructor(protected readonly envProducer: EnvProducer) {}

  public registerMessage(
    // TODO: Refactor messaging to unify data types being passed.
    // eslint-disable-next-line
    msgCls: { new (...args: any): Message<unknown> } & { type(): string }
  ): void {
    this.msgRegistry.registerMessage(msgCls);
  }

  public addHandler(route: string, handler: Handler): void {
    if (this.registeredHandler.has(route)) {
      throw new Error(`Already registered type ${route}`);
    }

    this.registeredHandler.set(route, handler);
  }

  public addGuard(guard: Guard): void {
    this.guards.push(guard);
  }

  public abstract listen(port: string, init: Promise<void>): void;

  public abstract unlisten(): void;

  protected async handleMessage(
    message: RoutedMessage,
    sender: MessageSender
  ): Promise<unknown> {
    const msg = this.msgRegistry.parseMessage(message);
    const env = this.envProducer(sender, msg.meta ?? {});

    for (const guard of this.guards) {
      await guard(env, msg, sender);
    }

    msg.validate();

    const route = msg.route();
    if (!route) {
      throw new Error("Null router");
    }

    const handler = this.registeredHandler.get(route);
    if (!handler) {
      throw new Error("Can't get handler");
    }

    return await handler(env, msg);
  }
}
