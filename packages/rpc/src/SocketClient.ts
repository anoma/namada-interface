import { toBase64 } from "@cosmjs/encoding";
import { WebsocketClient } from "@cosmjs/tendermint-rpc";

import RpcClientBase from "./RpcClientBase";
import { createJsonRpcRequest } from "@anoma/utils";
import { TxResponse } from "./enums";
import {
  BroadcastSyncResponse,
  NewBlockEvents,
  SubscriptionEvents,
} from "./types";

class SocketClient extends RpcClientBase {
  private _client: WebsocketClient | null = null;

  public connect(): void {
    this._client = new WebsocketClient(this.endpoint, (e: Error) => {
      throw new Error(e.message);
    });
  }

  public disconnect(): void {
    this._client?.disconnect();
    if (this._client) {
      this._client = null;
    }
  }

  public get client(): WebsocketClient | null {
    return this._client;
  }

  public async broadcastTx(
    tx: string,
    callbacks?: {
      onBroadcast?: (response: BroadcastSyncResponse) => void;
      onError?: (error: string) => void;
    }
  ): Promise<BroadcastSyncResponse> {
    if (!this._client) {
      this.connect();
    }

    const { onBroadcast, onError } = callbacks || {};

    return new Promise((resolve, reject) => {
      this.client
        ?.execute(createJsonRpcRequest("broadcast_tx_sync", { tx }))
        .then((response: BroadcastSyncResponse) => {
          this.disconnect();
          if (onBroadcast) {
            onBroadcast(response);
          }
          return resolve(response);
        })
        .catch((e) => {
          if (onError) {
            onError(e);
          }
          return reject(e);
        });
    });
  }

  public subscribeNewBlock(
    hash: string,
    callbacks?: {
      onNext?: (events: NewBlockEvents) => void;
      onError?: (e: unknown) => void;
    }
  ): Promise<NewBlockEvents> {
    if (!this._client) {
      this.connect();
    }

    const { onNext, onError } = callbacks || {};

    const queries = [`tm.event='NewBlock'`, `${TxResponse.Hash}='${hash}'`];

    return new Promise((resolve, reject) => {
      this.client
        ?.listen(
          createJsonRpcRequest("subscribe", {
            query: queries.join(" AND "),
          })
        )
        .addListener({
          next: (subEvent) => {
            const { events }: { events: NewBlockEvents } =
              subEvent as SubscriptionEvents;
            this.disconnect();
            if (onNext) {
              onNext(events);
            }
            return resolve(events);
          },
          error: (e) => {
            if (onError) {
              onError(e);
            }
            return reject(e);
          },
        });
    });
  }
}

export default SocketClient;
