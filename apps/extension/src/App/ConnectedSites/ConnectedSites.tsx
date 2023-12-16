import { ExtensionKVStore } from "@namada/storage";
import { useCallback, useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { Alert, Heading, Stack } from "@namada/components";
import {
  APPROVED_ORIGINS_KEY,
  ApprovedOriginsStore,
  RevokeConnectionMsg,
} from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { KVPrefix, Ports } from "router";
import {
  ConnectedSiteDetails,
  ConnectedSiteListItemContainer,
  ConnectedSiteSideButton,
  ConnectedSitesList,
} from "./ConnectedSites.components";

const approvedOriginsStore = new ExtensionKVStore<ApprovedOriginsStore>(
  KVPrefix.LocalStorage,
  {
    get: browser.storage.local.get,
    set: browser.storage.local.set,
  }
);

const ConnectedSites: React.FC = ({}) => {
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
      <Heading className="text-2xl uppercase">Connected Sites</Heading>
      {connectedSites && connectedSites.length === 0 && (
        <Alert type="info">No connected sites found.</Alert>
      )}

      <ConnectedSitesList>
        {connectedSites &&
          connectedSites.map((site, i) => (
            <ConnectedSiteListItemContainer key={i}>
              <ConnectedSiteDetails>{site}</ConnectedSiteDetails>
              <ConnectedSiteSideButton
                onClick={() => handleRevokeConnection(site)}
              />
            </ConnectedSiteListItemContainer>
          ))}
      </ConnectedSitesList>
    </Stack>
  );
};

export default ConnectedSites;
