import { StreamingSocket } from "@cosmjs/socket";
import {
  Comet38Client,
  NewBlockEvent,
  WebsocketClient,
} from "@cosmjs/tendermint-rpc";
import { Subscription } from "xstream";

const replaceHTTPtoWebsocket = (url: string): string => {
  return url.replace("http", "ws");
};

export function subscribeNewBlock(
  tmClient: Comet38Client,
  callback: (event: NewBlockEvent) => void
): Subscription {
  const stream = tmClient.subscribeNewBlock();
  const subscription = stream.subscribe({
    next: (event) => {
      callback(event);
    },
    error: (err) => {
      console.error(err);
      subscription.unsubscribe();
    },
  });

  return subscription;
}

export async function validateConnection(rpcAddress: string): Promise<boolean> {
  return new Promise((resolve) => {
    const wsUrl = replaceHTTPtoWebsocket(rpcAddress);
    const path = wsUrl.endsWith("/") ? "websocket" : "/websocket";
    const socket = new StreamingSocket(wsUrl + path, 3000);
    console.log(socket);
    socket.events.subscribe({
      error: () => {
        resolve(false);
      },
    });

    socket.connect();
    socket.connected.then(() => resolve(true)).catch(() => resolve(false));
    return true;
  });
}

export async function connectWebsocketClient(
  rpcAddress: string
): Promise<Comet38Client> {
  return new Promise(async (resolve, reject) => {
    try {
      const wsUrl = replaceHTTPtoWebsocket(rpcAddress);
      const wsClient = new WebsocketClient(wsUrl, (err) => {
        reject(err);
      });
      const tmClient = await Comet38Client.create(wsClient);
      if (!tmClient) {
        reject(new Error("cannot create tendermint client"));
      }

      const status = await tmClient.status();
      if (!status) {
        reject(new Error("cannot get client status"));
      }

      resolve(tmClient);
    } catch (err) {
      reject(err);
    }
  });
}
