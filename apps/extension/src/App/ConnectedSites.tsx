import { ExtensionKVStore } from "@namada/storage";
import { useCallback, useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { Alert, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import {
  APPROVED_ORIGINS_KEY,
  ApprovedOriginsStore,
  RevokeConnectionMsg,
} from "background/approvals";
import clsx from "clsx";
import { useRequester } from "hooks/useRequester";
import { KVPrefix, Ports } from "router";

const approvedOriginsStore = new ExtensionKVStore<ApprovedOriginsStore>(
  KVPrefix.LocalStorage,
  {
    get: browser.storage.local.get,
    set: browser.storage.local.set,
  }
);

export const ConnectedSites: React.FC = ({}) => {
  const [connectedSites, setConnectedSites] = useState<ApprovedOriginsStore>();
  const requester = useRequester();

  const fetchConnectedSites = useCallback(() => {
    approvedOriginsStore
      .get(APPROVED_ORIGINS_KEY)
      .then((origins) =>
        setConnectedSites((origins as ApprovedOriginsStore) || [])
      );
  }, [setConnectedSites]);

  useEffect(fetchConnectedSites);

  const handleRevokeConnection = async (site: string): Promise<void> => {
    await requester.sendMessage(
      Ports.Background,
      new RevokeConnectionMsg(site)
    );
    fetchConnectedSites();
  };

  return (
    <Stack gap={6}>
      <PageHeader title="Connected Sites" />
      {connectedSites && connectedSites.length === 0 && (
        <Alert type="info">No connected sites found.</Alert>
      )}

      <ul className="mb-2">
        {connectedSites &&
          connectedSites.map((site, i) => (
            <li key={i} className="my-1 flex">
              <div
                className={clsx(
                  "flex w-[90%] bg-black text-xs text-neutral-200 border border-black",
                  "rounded-sm p-2"
                )}
              >
                {site}
              </div>
              <div
                className={clsx(
                  "flex w-[10%] bg-black text-xs text-neutral-200 border border-black",
                  'rounded-sm p-2 cursor-pointer text-center before:content("x")',
                  "before:translate-x-1/2 before:translate-y-1/2",
                  "hover:text-black hover:bg-white"
                )}
                onClick={() => handleRevokeConnection(site)}
              />
            </li>
          ))}
      </ul>
    </Stack>
  );
};
