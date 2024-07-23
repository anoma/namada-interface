import { Message } from "router";
import { validateProps } from "utils";
import { ROUTE } from "./constants";

enum MessageType {
  UpdateChain = "update-chain",
  AddTxWasmHashes = "add-tx-wasm-hashes",
  GetTxWasmHashes = "get-tx-wasm-hashes",
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
