export {};

type Message = {
  type: string;
  target: string;
  data: {
    txMsg: string;
    password: string;
  };
};

(async function init() {
  chrome.runtime.onMessage.addListener(handleMessages);

  async function handleMessages({
    data,
    type,
    target,
  }: Message): Promise<boolean> {
    if (target !== "offscreen.anoma") {
      return false;
    }

    switch (type) {
      case "test_offscreen":
        const w = new Worker("send_transfer_webworker.anoma.js");
        w.onmessage = (e) => {
          if (e.data === "initialized") {
            w.postMessage(data);
          }
          console.log("WW done " + e.data);
        };
        break;
      default:
        console.warn(`Unexpected message type received: '${type}'.`);
        return false;
    }

    return false;
  }
})();
