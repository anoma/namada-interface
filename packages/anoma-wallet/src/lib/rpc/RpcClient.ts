import { HttpClient } from "@cosmjs/tendermint-rpc";
import { JsonRpcSuccessResponse } from "@cosmjs/json-rpc";
import { fromBase64 } from "@cosmjs/encoding";
import { BinaryReader, deserialize } from "borsh";
import { Buffer } from "buffer";

import RpcClientBase, { RpcClientInitArgs } from "./RpcClientBase";
import { decodeTransactionWithNextTxId } from "utils/encoding";
import { schemaAmount, TokenAmount } from "schema";
import { amountFromMicro, createJsonRpcRequest } from "utils/helpers";
import { AbciResponse, PathType } from "./types";
import { NodeWithNextId } from "@anoma/masp-web";

class RpcClient extends RpcClientBase {
  private _client: HttpClient;

  constructor(args: RpcClientInitArgs) {
    super(args);
    this._client = new HttpClient(this.endpoint);
  }

  public async queryBalance(token: string, owner?: string): Promise<number> {
    const path = `value/#${token}/balance/#${owner}`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;
      if (response.code === 1) {
        return -2;
      }
      const valueAsByteArray = fromBase64(response.value || "0");
      const decoded = deserialize(
        schemaAmount,
        TokenAmount,
        Buffer.from(valueAsByteArray)
      );

      // Note: .toNumber() is limited to 53 bits:
      return amountFromMicro(decoded.micro.toNumber());
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async queryEpoch(): Promise<number> {
    const path = "epoch";
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;

      const epochByteArray = fromBase64(response.value || "0");
      const buffer = Buffer.from(epochByteArray);
      const epochReader = new BinaryReader(buffer);
      const epochBN = epochReader.readU64();
      return epochBN.toNumber();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // util for creating paths for ledger
  // TODO, use more of this util and expand as needed
  // https://github.com/heliaxdev/anoma-apps/issues/38#issuecomment-1104968959
  createPath = (pathType: PathType, storageKey?: string): string => {
    switch (pathType) {
      case PathType.HasKey:
      case PathType.Prefix:
      case PathType.Value:
        if (storageKey) {
          return `${pathType}/${storageKey}`;
        }
        throw "cannot create path";
    }
  };

  // queries the shielded transctions from the ledger, this is needed
  // when scanning the shielded transction to find notes that can be spent
  //
  // TODO this should likely move to rust code and we could just pass in
  // the networking related sys calls to get rid of having to do this here
  public async queryShieldedTransaction(
    maspAddress: string,
    transactionId?: string,
  ): Promise<NodeWithNextId | undefined> {
    try {

      // the first shielded tx has a different path
      const txPrefixAndMaybeId = transactionId ? `tx-${transactionId}` : "head-tx"
      const maspAddressWithTransactionId = `#${maspAddress}/${txPrefixAndMaybeId}`;
      const path = this.createPath(PathType.Value, maspAddressWithTransactionId);
      const request = createJsonRpcRequest("abci_query", [
        path,
        "",
        "0",
        false,
      ]);

      // then we get the data containing a shielded tx and the id for the next linked shielded tx
      const response: JsonRpcSuccessResponse = await this._client.execute(request);
      const { value } = response.result.response;
      if (value === null) {
        return undefined;
      }
      const shieldedTransactionsIdsByteArray = fromBase64(value || "0");
      const buffer = Buffer.from(shieldedTransactionsIdsByteArray);
      const decodedTransaction = await decodeTransactionWithNextTxId(buffer);
      return Promise.resolve(decodedTransaction);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async isKnownAddress(address: string): Promise<boolean> {
    const path = `has_key/#${address}/?`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;
      // borsh serialises true to 1 which in base64 is AQ==
      if (response.code === 0 && response.value === "AQ==") {
        return true;
      }
      return false;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async queryChannel(
    channelId: string,
    portId = "transfer"
  ): Promise<boolean> {
    const path = `#IBC/channelEnds/ports/${portId}/channels/${channelId}`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;
      if (response.code === 0) {
        // TODO: We are expecting a result encoded as a Protobuf, so it should be handled here:
        return true;
      }
      return false;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export default RpcClient;
