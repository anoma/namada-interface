import React, { useState } from "react";

import { Button, ButtonVariant, Input, InputVariants } from "@anoma/components";

import { Ledger as LedgerApp } from "background/ledger";
import { LedgerViewContainer, LedgerError } from "./Ledger.components";
import { ExtensionRequester } from "extension";

type Props = {
  requester: ExtensionRequester;
};

const Ledger: React.FC<Props> = ({ requester: _ }) => {
  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string>();

  const handleConnectLedger = async (): Promise<void> => {
    try {
      await LedgerApp.init();
    } catch (e) {
      setError(`Failed to connect to Ledger: ${e}`);
    }
  };

  return (
    <LedgerViewContainer>
      <h1>Connect Ledger</h1>
      {error && <LedgerError>{error}</LedgerError>}
      <Input
        label={"Alias"}
        value={alias}
        onChangeCallback={(e) => setAlias(e.target.value)}
        variant={InputVariants.Text}
      />

      <Button
        onClick={() => handleConnectLedger()}
        variant={ButtonVariant.Contained}
        disabled={alias === ""}
      >
        Connect to Ledger
      </Button>
    </LedgerViewContainer>
  );
};

export default Ledger;
