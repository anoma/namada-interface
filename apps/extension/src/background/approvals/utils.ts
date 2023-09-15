import { KVStore } from "@namada/storage";

import { ApprovedOriginsStore } from "./types";

export const APPROVED_ORIGINS_KEY = "namadaExtensionApprovedOrigins";

export const addApprovedOrigin = async (
  approvedOriginsStore: KVStore<ApprovedOriginsStore>,
  originToAdd: string,
): Promise<void> => {
  const approvedOrigins = await approvedOriginsStore.get(APPROVED_ORIGINS_KEY) || [];
  await approvedOriginsStore.set(
    APPROVED_ORIGINS_KEY,
    [ originToAdd, ...approvedOrigins ]
  );
};

export const removeApprovedOrigin = async (
  approvedOriginsStore: KVStore<ApprovedOriginsStore>,
  originToRemove: string,
): Promise<void> => {
  const approvedOrigins = await approvedOriginsStore.get(APPROVED_ORIGINS_KEY) || [];
  await approvedOriginsStore.set(
    APPROVED_ORIGINS_KEY,
    approvedOrigins.filter(origin => origin !== originToRemove)
  );
};
