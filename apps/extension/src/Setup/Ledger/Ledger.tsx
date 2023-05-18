import React, { useState } from "react";

import { Button, ButtonVariant, Input, InputVariants } from "@anoma/components";

import { initLedgerHIDTransport, Ledger as LedgerApp } from "background/ledger";
import { LedgerViewContainer, LedgerError } from "./Ledger.components";
import { ExtensionRequester } from "extension";
import { shortenAddress } from "@anoma/utils";

type Props = {
  requester: ExtensionRequester;
};

const Ledger: React.FC<Props> = ({ requester: _ }) => {
  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string>();
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string>();
  const [appInfo, setAppInfo] = useState<{ name: string; version: string }>();

  const queryLedger = async (ledger: LedgerApp): Promise<void> => {
    const pk = await ledger.getPublicKey();
    const { appName, appVersion } = ledger.status();

    setAppInfo({ name: appName, version: appVersion });
    setPublicKey(pk);
    setIsConnected(true);
  };

  /**
   * Connect using default USB transport
   */
  const handleConnectUSB = async (): Promise<void> => {
    try {
      queryLedger(await LedgerApp.init());
    } catch (e) {
      setError(`Failed to connect to Ledger: ${e}`);
    }
  };

  /**
   * Connect using HID transport
   */
  const handleConnectHID = async (): Promise<void> => {
    try {
      const transport = await initLedgerHIDTransport();

      queryLedger(await LedgerApp.init(transport));
    } catch (e) {
      setError(`Failed to connect to Ledger: ${e}`);
    }
  };

  return (
    <LedgerViewContainer>
      <h1>Connect Ledger</h1>
      {error && <LedgerError>{error}</LedgerError>}
      {/* TODO: Navigate to next step for adding this account to background service. The following is temporary: */}
      {isConnected && (
        <div>
          <p>
            Connection successful for <b>&quot;{alias}&quot;</b>!
          </p>
          <p>Public key: {publicKey && shortenAddress(publicKey)}</p>
          {appInfo && (
            <>
              <p>Name: {appInfo.name}</p>
              <p>Version: {appInfo.version}</p>
            </>
          )}
        </div>
      )}
      {!isConnected && (
        <>
          <Input
            label={"Alias"}
            value={alias}
            onChangeCallback={(e) => setAlias(e.target.value)}
            variant={InputVariants.Text}
          />

          <Button
            onClick={() => handleConnectUSB()}
            variant={ButtonVariant.Contained}
            disabled={alias === ""}
          >
            Connect USB
          </Button>
          <Button
            onClick={() => handleConnectHID()}
            variant={ButtonVariant.Contained}
            disabled={alias === ""}
          >
            Connect HID
          </Button>
        </>
      )}
    </LedgerViewContainer>
  );
};

export default Ledger;
