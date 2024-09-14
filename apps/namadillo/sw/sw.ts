/// <reference lib="webworker" />
importScripts("constants.js");
importScripts("crypto.js");
importScripts("fetch.js");
importScripts("masp.js");
importScripts("indexedDb.js");

const urlParams = new URLSearchParams(location.search);
const { isProxy } = Object.fromEntries(urlParams);

const MASP_MPC_URL =
  isProxy === "true" ?
    "http://localhost:8010/proxy"
  : "https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup";

const store = new IndexedDBKVStore(STORAGE_PREFIX);

const resetMaspParamStore = async (): Promise<void> => {
  store.set(MaspParam.Output, null);
  store.set(MaspParam.Spend, null);
  store.set(MaspParam.Convert, null);
};

// resetMaspParamStore();

const logSuccess = ({ param, bytes }: MaspParamBytes): void =>
  console.info(`Fetched and stored ${param}`, bytes);

const logError = (e: any) => console.error(e);

const params = [MaspParam.Output, MaspParam.Spend, MaspParam.Convert];

(async () => {
  params.forEach(async (param) => {
    if (!(await store.get(param))) {
      await fetchMaspParam(param)
        .then(validateMaspParamBytes)
        .then(storeMaspParam)
        .then(logSuccess)
        .catch(logError);
    } else {
      console.log(`Found ${param}`);
    }
  });
})();

/**
 * EVENT HANDLERS
 */
const EVENT_PREFIX = "namadillo";

enum EventMessage {
  FetchMaspParams = `${EVENT_PREFIX}:fetchMaspParams`,
  HasMaspParams = `${EVENT_PREFIX}:hasMaspParams`,
  HasMaspParamsResponse = `${EVENT_PREFIX}:hasMaspParamsResponse`,
}

// PORT
let port: MessagePort;

self.addEventListener("message", (event: MessageEvent) => {
  console.log({ event });
  if (event.data && event.data.type == "INIT_PORT") {
    port = event.ports[0];
  }
  const { data } = event;

  switch (data.type as EventMessage) {
    case EventMessage.FetchMaspParams:
      console.log(`${EventMessage.FetchMaspParams}`);
      break;
    case EventMessage.HasMaspParams: {
      const { param } = data;
      store.get(param).then((record) => {
        port.postMessage({
          type: EventMessage.HasMaspParamsResponse,
          param,
          hasMaspParam: record ? true : false,
        });
      });
      break;
    }
  }
});
