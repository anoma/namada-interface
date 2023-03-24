import { Sdk } from "@anoma/shared";
import { init as initShared } from "@anoma/shared/src/init";
import { IndexedDBKVStore } from "@anoma/storage";
import { fromBase64 } from "@cosmjs/encoding";
// import { SDK_KEY } from "background/keyring";
import { KVPrefix } from "router";
import {
  INIT_MSG,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
} from "./types";

const DEFAULT_URL =
  "https://d3brk13lbhxfdb.cloudfront.net/qc-testnet-5.1.025a61165acd05e";
const { REACT_APP_NAMADA_URL = DEFAULT_URL } = process.env;

(async function init() {
  await initShared();
  const sdkStore = new IndexedDBKVStore(KVPrefix.SDK);
  //TODO: import sdk-store key
  const sdkDataStr: string | undefined = await sdkStore.get("sdk-store");
  const sdk = new Sdk(REACT_APP_NAMADA_URL);
  await sdk.fetch_masp_params();

  if (sdkDataStr) {
    const sdkData = new TextEncoder().encode(sdkDataStr);
    sdk.decode(sdkData);
  }

  //TODO: check for msg type
  addEventListener(
    "message",
    ({ data }) => {
      sdk
        .submit_transfer(fromBase64(data.txMsg), data.password)
        .then(() => postMessage(TRANSFER_SUCCESSFUL_MSG))
        .catch(() => postMessage(TRANSFER_FAILED_MSG));
    },
    false
  );

  postMessage(INIT_MSG);
})();
