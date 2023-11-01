import React, { useCallback, useState } from "react";

import { Alert, Button, ButtonVariant, Heading } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { shortenAddress } from "@namada/utils";

import { BodyText, HeaderContainer } from "Setup/Setup.components";
import { AddLedgerParentAccountMsg } from "background/ledger";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

const LedgerConfirmation: React.FC = () => {
  const requester = useRequester();
  const { alias = "", address = "", publicKey = "" } = useSanitizedParams();
  const [error, setError] = useState<string>();

  const handleSubmitClick = useCallback(async (): Promise<void> => {
    try {
      await requester.sendMessage(
        Ports.Background,
        new AddLedgerParentAccountMsg(alias, address, publicKey, {
          account: 0,
          change: 0,
          index: 0,
        })
      );
      closeCurrentTab();
    } catch (e) {
      console.warn(e);
      setError(`${e}`);
    }
  }, []);

  return (
    <>
      <HeaderContainer>
        <Heading level="h1" size="3xl">
          Confirm Ledger Connection
        </Heading>
      </HeaderContainer>
      {error && <Alert type="error">{error}</Alert>}
      <BodyText>
        Connection successful for <b>&quot;{alias}&quot;</b>!
      </BodyText>
      <BodyText>Address: {address && shortenAddress(address)}</BodyText>
      <BodyText>Add this address to your wallet?</BodyText>
      <Button variant={ButtonVariant.Contained} onClick={handleSubmitClick}>
        Add to wallet and close
      </Button>
    </>
  );
};

export default LedgerConfirmation;
