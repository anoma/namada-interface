import * as Comlink from "comlink";

import { deserializeBigNumbers, serializeBigNumbers } from "@namada/utils";

export type WebWorkerMessage<T, P> = {
  type: T;
  payload: P;
};

export const registerBNTransferHandler = <
  M extends WebWorkerMessage<unknown, unknown>,
>(
  type: M["type"]
): void => {
  Comlink.transferHandlers.set(`${type}_transfer_handler`, {
    canHandle: (obj): obj is M => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (obj as any).type === type;
    },

    serialize: (value: M) => {
      serializeBigNumbers(value);
      return [value, []];
    },

    deserialize: (value: M) => {
      deserializeBigNumbers(value);
      return value;
    },
  });
};
