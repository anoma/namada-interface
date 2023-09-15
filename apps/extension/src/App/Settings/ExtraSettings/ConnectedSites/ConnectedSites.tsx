import { useState, useEffect, useCallback } from "react";
import { ExtensionKVStore } from "@namada/storage";

import {
  ConnectedSitesList,
  ConnectedSiteListItemContainer,
  ConnectedSiteDetails,
  ConnectedSiteSideButton,
} from "./ConnectedSites.components";
import { ExtensionRequester } from "extension";
import { Ports, KVPrefix } from "router";
import {
  ApprovedOriginsStore,
  APPROVED_ORIGINS_KEY,
  RevokeConnectionMsg
} from "background/approvals";
import { useRequester } from "hooks/useRequester";

const approvedOriginsStore = new ExtensionKVStore<ApprovedOriginsStore>(
  KVPrefix.LocalStorage,
  {
    get: browser.storage.local.get,
    set: browser.storage.local.set,
  }
);

const ConnectedSites: React.FC = ({
}) => {
  const [connectedSites, setConnectedSites] = useState<ApprovedOriginsStore>([]);
  const requester = useRequester();

  const fetchConnectedSites = useCallback(() => {
    approvedOriginsStore.get(APPROVED_ORIGINS_KEY).then(origins =>
      setConnectedSites(origins as ApprovedOriginsStore || [])
    );
  }, [setConnectedSites]);

  useEffect(fetchConnectedSites);

  const handleRevokeConnection = async (site: string) => {
    await requester.sendMessage(
      Ports.Background,
      new RevokeConnectionMsg(site)
    );
    fetchConnectedSites();
  };

  return (
    <ConnectedSitesList>
      {connectedSites.map((site, i) => (
        <ConnectedSiteListItemContainer key={i}>
          <ConnectedSiteDetails>
            {site}
          </ConnectedSiteDetails>
          <ConnectedSiteSideButton
            onClick={() => handleRevokeConnection(site)}
          />
        </ConnectedSiteListItemContainer>
      ))}
    </ConnectedSitesList>
  );
};

export default ConnectedSites;
