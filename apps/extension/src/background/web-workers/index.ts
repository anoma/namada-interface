export type SubmitTransferMessage = {
  type: string;
  target: string;
  data: SubmitTransferMessageData;
};

type SubmitTransferMessageData = {
  txMsg: string;
  password: string;
};

export const init = (data: SubmitTransferMessageData): void => {
  const w = new Worker("submit-transfer-web-worker.anoma.js");

  w.onmessage = (e) => {
    if (e.data === "initialized") {
      w.postMessage(data);
    }
  };
};
