import { ExtensionKVStore } from "@namada/storage";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { Alert, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import {
  ApprovedOriginsStore,
  RevokeConnectionMsg,
} from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { GoX } from "react-icons/go";
import { KVPrefix, Ports } from "router";
import { LocalStorage } from "storage";

const localStorage = new LocalStorage(
  new ExtensionKVStore<ApprovedOriginsStore>(KVPrefix.LocalStorage, {
    get: browser.storage.local.get,
    set: browser.storage.local.set,
  })
);

export const ConnectedSites: React.FC = ({}) => {
  const [connectedSites, setConnectedSites] = useState<ApprovedOriginsStore>();
  const requester = useRequester();

  const fetchConnectedSites = useCallback(() => {
    localStorage
      .getApprovedOrigins()
      .then((origins) =>
        setConnectedSites((origins as ApprovedOriginsStore) || [])
      )
      .catch(console.error);
  }, [setConnectedSites]);

  useEffect(fetchConnectedSites);

  const handleRevokeConnection = async (site: string): Promise<void> => {
    await requester.sendMessage(
      Ports.Background,
      new RevokeConnectionMsg(site)
    );
    fetchConnectedSites();
  };

  const hasConnectedSites = connectedSites && connectedSites.length > 0;
  return (
    <Stack gap={6}>
      <PageHeader title="Connected Sites" />
      {!hasConnectedSites && (
        <Alert type="info">No connected sites found.</Alert>
      )}

      {hasConnectedSites && (
        <Stack gap={4}>
          {connectedSites.map((site, i) => (
            <li
              key={`connected-site-${i}`}
              className={clsx(
                "bg-black rounded-md flex justify-between items-center text-white",
                "items-center text-base py-4 px-6"
              )}
            >
              <span>{site}</span>
              <span
                className="p-2 cursor-pointer hover:text-yellow -mr-2"
                onClick={() => handleRevokeConnection(site)}
              >
                <GoX />
              </span>
            </li>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
