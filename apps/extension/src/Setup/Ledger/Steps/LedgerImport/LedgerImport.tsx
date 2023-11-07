import {
  ActionButton,
  Alert,
  Heading,
  Loading,
  Stack,
} from "@namada/components";
import { formatRouterPath } from "@namada/utils";
import { Password } from "Setup/Common";
import { LedgerConnectRoute, TopLevelRoute } from "Setup/types";
import { AddLedgerParentAccountMsg } from "background/ledger";
import { useRequester } from "hooks/useRequester";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Ports } from "router";

type LedgerImportLocationState = {
  address: string;
  publicKey: string;
};

export const LedgerImport = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const requester = useRequester();
  const locationState = location.state as LedgerImportLocationState;

  const [password, setPassword] = useState<string | null>("");
  const [keysName, setKeysName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationState || !locationState.address || !locationState.publicKey) {
      navigate(
        formatRouterPath([TopLevelRoute.Ledger, LedgerConnectRoute.Connect])
      );
    }
  }, [locationState]);

  const onSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      try {
        e.preventDefault();
        setLoading(true);
        const account = await requester.sendMessage(
          Ports.Background,
          new AddLedgerParentAccountMsg(
            keysName,
            locationState.address,
            locationState.publicKey,
            {
              account: 0,
              change: 0,
              index: 0,
            }
          )
        );
        navigate(
          formatRouterPath([
            TopLevelRoute.Ledger,
            LedgerConnectRoute.Completion,
          ]),
          { state: { account: { ...account } } }
        );
      } catch (e) {
        console.warn(e);
        setError(`${e}`);
      } finally {
        setLoading(false);
      }
    },
    [keysName, password, locationState]
  );

  return (
    <>
      <Loading status="Importing Keys..." variant="full" visible={loading} />
      <Stack gap={12}>
        <Heading level="h1" size="3xl">
          Import your Keys from Ledger HW
        </Heading>
        {error && <Alert type="error">{error}</Alert>}
        <Stack as="form" gap={6} onSubmit={onSubmit}>
          <Password
            onChangeKeysName={setKeysName}
            onValidPassword={setPassword}
            keysName={keysName}
          />
          <ActionButton disabled={!password || !keysName}>Next</ActionButton>
        </Stack>
      </Stack>
    </>
  );
};
