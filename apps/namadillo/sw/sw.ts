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

(async () => {
  [MaspParam.Output, MaspParam.Spend, MaspParam.Convert].map(async (param) => {
    if (!(await store.get(param))) {
      await fetchMaspParam(param)
        .then(validateMaspParamBytes)
        .then(storeMaspParam)
        .then(logSuccess)
        .catch(logError);
    }
  });
})();
