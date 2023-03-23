import { Sdk } from "@anoma/shared";
import { init as initShared } from "@anoma/shared/src/init";
import { IndexedDBKVStore } from "@anoma/storage";
import { fromBase64 } from "@cosmjs/encoding";
import { SDK_KEY } from "background/keyring";
import { KVPrefix } from "router";
import { INIT_MSG } from ".";

const DEFAULT_URL =
  "https://d3brk13lbhxfdb.cloudfront.net/qc-testnet-5.1.025a61165acd05e";
const { REACT_APP_NAMADA_URL = DEFAULT_URL } = process.env;

(async function init() {
  await initShared();
  const sdkStore = new IndexedDBKVStore(KVPrefix.SDK);
  const sdkDataStr: string | undefined = await sdkStore.get(SDK_KEY);
  const sdk = new Sdk(REACT_APP_NAMADA_URL);
  await sdk.fetch_masp_params();

  if (sdkDataStr) {
    const sdkData = new TextEncoder().encode(sdkDataStr);
    sdk.decode(sdkData);
  }

  addEventListener(
    "message",
    ({ data }) => {
      sdk
        .submit_transfer(fromBase64(data.txMsg), data.password)
        .then(() => console.log("Transfer successfull."))
        .catch(() => console.error("Transfer failed."));
    },
    false
  );

  postMessage(INIT_MSG);
})();
