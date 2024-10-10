import init, { initMulticore } from "@heliaxdev/namada-sdk/inline-init";

import { getSdk } from "@heliaxdev/namada-sdk/web";

export type ShiededSyncPayload = {
  vks: string[];
  rpcUrl: string;
  maspIndexerUrl?: string;
};

export type ShieldedSyncMulticore = {
  type: "shielded-sync-multicore";
  payload: ShiededSyncPayload;
};

export type ShieldedSyncSinglecore = {
  type: "shielded-sync-singlecore";
  payload: ShiededSyncPayload;
};

export type ShieldedSyncMessageType =
  | ShieldedSyncMulticore
  | ShieldedSyncSinglecore;

self.onmessage = async (e: MessageEvent<ShieldedSyncMessageType>) => {
  const { type, payload } = e.data;

  switch (type) {
    case "shielded-sync-singlecore": {
      const { cryptoMemory } = await init();
      //eslint-disable-next-line
      console.log("Syncing with single core");
      await shieldedSync(cryptoMemory, payload);
      break;
    }

    case "shielded-sync-multicore": {
      const { cryptoMemory } = await initMulticore();
      //eslint-disable-next-line
      console.log("Syncing with multicore");
      await shieldedSync(cryptoMemory, payload);
      break;
    }

    default:
      throw new Error(`Unknown message type: ${type}`);
  }
};

async function shieldedSync(
  cryptoMemory: WebAssembly.Memory,
  payload: ShiededSyncPayload
): Promise<void> {
  const { rpcUrl, maspIndexerUrl } = payload;

  const sdk = getSdk(
    cryptoMemory,
    rpcUrl,
    maspIndexerUrl || "",
    "",
    // Not really used, but required by the SDK, as long as it's valid address it's fine
    "tnam1qxfj3sf6a0meahdu9t6znp05g8zx4dkjtgyn9gfu"
  );
  await sdk.rpc.shieldedSync(payload.vks);
}
