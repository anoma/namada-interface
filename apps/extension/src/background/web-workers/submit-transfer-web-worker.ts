// import { defaultChainId, chains } from "@namada/chains";
// import { Sdk } from "@namada/shared";
// import { init as initShared } from "@namada/shared/src/init";
// import { IndexedDBKVStore } from "@namada/storage";
// import { fromBase64 } from "@cosmjs/encoding";
// import { KVPrefix } from "router";
// import {
//   INIT_MSG,
//   SubmitTransferMessageData,
//   TRANSFER_FAILED_MSG,
//   TRANSFER_SUCCESSFUL_MSG,
//   WEB_WORKER_ERROR_MSG,
// } from "./types";
// import { ActiveAccountStore } from "background/keyring";
//
// (async function init() {
//   await initShared();
//   const sdkStore = new IndexedDBKVStore(KVPrefix.SDK);
//   const utilityStore = new IndexedDBKVStore(KVPrefix.Utility);
//   const sdk = new Sdk(chains[defaultChainId].rpc);
//   await sdk.load_masp_params();
//
//   //TODO: import sdk-store and parent-account-id keys - can't import from the keyring
//   const sdkData: Record<string, string> | undefined = await sdkStore.get(
//     "sdk-store"
//   );
//   const activeAccount = await utilityStore.get<ActiveAccountStore>(
//     "parent-account-id"
//   );
//
//   if (sdkData && activeAccount) {
//     const data = new TextEncoder().encode(sdkData[activeAccount.id]);
//     sdk.decode(data);
//   }
//
//   addEventListener(
//     "message",
//     async ({ data }: { data: SubmitTransferMessageData }) => {
//       try {
//         const txMsg = fromBase64(data.txMsg);
//         const builtTx = await sdk.build_transfer(
//           fromBase64(data.transferMsg), txMsg, data.password, data.xsk
//         );
//         const [txBytes, revealPkTxBytes] = await sdk.sign_tx(builtTx, txMsg);
//         await sdk.process_tx(txBytes, txMsg, revealPkTxBytes);
//
//         postMessage({ msgName: TRANSFER_SUCCESSFUL_MSG });
//       } catch (error) {
//         postMessage({
//           msgName: TRANSFER_FAILED_MSG,
//           payload: error instanceof Error ? error.message : error,
//         });
//       }
//     },
//     false
//   );
//
//   postMessage({ msgName: INIT_MSG });
// })().catch(error => {
//   const { message, stack } = error;
//   postMessage({
//     msgName: WEB_WORKER_ERROR_MSG,
//     payload: { message, stack }
//   });
// });
