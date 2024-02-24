import { ActionButton, Alert, Loading, Stack } from "@namada/components";
import { AccountAlias, Password } from "Setup/Common";
import routes from "Setup/routes";
import { AddLedgerAccountMsg } from "background/keyring";
import { CreatePasswordMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Ports } from "router";

type LedgerImportLocationState = {
  address: string;
  publicKey: string;
};

type LedgerProps = {
  passwordRequired: boolean;
};

export const LedgerImport = ({
  passwordRequired,
}: LedgerProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const requester = useRequester();
  const locationState = location.state as LedgerImportLocationState;

  const [password, setPassword] = useState<string | undefined>();
  const [keysName, setKeysName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationState || !locationState.address || !locationState.publicKey) {
      navigate(routes.ledgerConnect());
    }
  }, [locationState]);

  const onSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      try {
        e.preventDefault();
        setLoading(true);

        if (passwordRequired && !password) {
          throw new Error("Password is required and it was not provided");
        }

        if (passwordRequired) {
          await requester.sendMessage<CreatePasswordMsg>(
            Ports.Background,
            new CreatePasswordMsg(password || "")
          );
        }

        const account = await requester.sendMessage(
          Ports.Background,
          new AddLedgerAccountMsg(
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
        navigate(routes.ledgerComplete(), {
          state: { account: { ...account } },
        });
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
      <Loading
        imageUrl="/assets/images/loading.gif"
        status="Importing Keys..."
        variant="full"
        visible={loading}
      />
      <Stack as="form" onSubmit={onSubmit} gap={5} className="h-[440px]">
        <Stack className="flex-1 justify-center" gap={6}>
          <AccountAlias value={keysName} onChange={setKeysName} />
          {passwordRequired && <Password onValidPassword={setPassword} />}
          {error && <Alert type="error">{error}</Alert>}
        </Stack>
        <ActionButton
          size="lg"
          disabled={(passwordRequired && !password) || !keysName}
        >
          Next
        </ActionButton>
      </Stack>
    </>
  );
};
