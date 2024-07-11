import { WasmHash } from "@namada/types";
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

export class AddTxWasmHashesMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.AddTxWasmHashes;
  }

  constructor(
    public readonly chainId: string,
    public readonly wasmHashes: WasmHash[]
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["chainId", "wasmHashes"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddTxWasmHashesMsg.type();
  }
}

export class GetTxWasmHashesMsg extends Message<WasmHash[] | undefined> {
  public static type(): MessageType {
    return MessageType.GetTxWasmHashes;
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
    return GetTxWasmHashesMsg.type();
  }
}
