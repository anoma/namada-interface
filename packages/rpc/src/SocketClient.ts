import { WebsocketClient } from "@cosmjs/tendermint-rpc";

import RpcClientBase from "./RpcClientBase";
import { createJsonRpcRequest } from "@anoma/utils";
import { TxResponse } from "./enums";
import {
  BroadcastSyncResponse,
  Events,
  NewBlockEvents,
  SubscriptionEvents,
} from "./types";

const parseEvents = (subEvents: SubscriptionEvents): Events => {
  const { events }: { events: NewBlockEvents } = subEvents;
  const [applied] = events;

  return applied.attributes.reduce((acc: Events, attribute) => {
    const { key, value } = attribute;
    acc[key] = value;
    return acc;
  }, {});
};

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
      onNext?: (events: Events) => void;
      onError?: (e: unknown) => void;
    }
  ): Promise<Events> {
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
            const parsedEvents = parseEvents(<SubscriptionEvents>subEvent);
            this.disconnect();
            if (onNext) {
              onNext(parsedEvents);
            }
            return resolve(parsedEvents);
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
