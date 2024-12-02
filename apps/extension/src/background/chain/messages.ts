import { Message } from "router";
import { validateProps } from "utils";
import { ROUTE } from "./constants";

enum MessageType {
  GetChain = "get-chain",
  UpdateChain = "update-chain",
}

export class UpdateChainMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.UpdateChain;
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["chainId"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateChainMsg.type();
  }
}

export class GetChainMsg extends Message<string> {
  public static type(): MessageType {
    return MessageType.GetChain;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return ROUTE;
  }

  type(): MessageType {
    return GetChainMsg.type();
  }
}
