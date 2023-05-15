import React, { useEffect } from "react";
import { NamadaApp } from "@zondax/ledger-namada";
import TransportUSB from "@ledgerhq/hw-transport-webusb";
import TransportHID from "@ledgerhq/hw-transport-webhid";

import { defaultChainId, chains } from "@anoma/chains";

import { LedgerViewContainer } from "./Ledger.components";
import { ExtensionRequester } from "extension";

type Props = {
  requester: ExtensionRequester;
};

const Ledger: React.FC<Props> = ({ requester }) => {
  console.log({ requester });
  const namadaChain = chains[defaultChainId];

  /* TEST */
  useEffect(() => {
    (async () => {
      // Instantiate NamadaApp
      const transportUSB = await TransportUSB.create();
      const namadaApp = new NamadaApp(transportUSB);
      console.log({ TransportUSB, TransportHID });

      const info = await namadaApp.getAppInfo();
      console.log({ info });
      const path = `m/44'/${namadaChain.bip44.coinType}'/0'/0/0`;
      console.log({ namadaApp, path });
      const pk = await namadaApp.getAddressAndPubKey(path);
      console.log({ pk });
    })();
  }, []);

  return (
    <LedgerViewContainer>
      <h1>Connect Ledger</h1>
      <p>
        <i>TODO</i>
      </p>
    </LedgerViewContainer>
  );
};

export default Ledger;
