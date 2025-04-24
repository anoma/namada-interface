import { ActionButton, Alert, Loading, Stack } from "@namada/components";
import { Bip44Path, Zip32Path } from "@namada/types";
import { AccountAlias, Password } from "Setup/Common";
import { AccountManager } from "Setup/query";
import routes from "Setup/routes";
import { useRequester } from "hooks/useRequester";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type LedgerImportLocationState = {
  address: string;
  publicKey: string;
  extendedViewingKey: string;
  pseudoExtendedKey: string;
  paymentAddress: string;
  diversifierIndex: number;
};

type LedgerProps = {
  passwordRequired: boolean;
  bip44Path: Bip44Path;
  zip32Path: Zip32Path;
};

export const LedgerImport = ({
  bip44Path,
  zip32Path,
  passwordRequired,
}: LedgerProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const requester = useRequester();
  const locationState = location.state as LedgerImportLocationState;

  const [password, setPassword] = useState<string | undefined>();
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationState || !locationState.address || !locationState.publicKey) {
      navigate(routes.ledgerConnect());
    }
  }, [locationState]);

  const onSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      const accountManager = new AccountManager(requester);
      try {
        e.preventDefault();
        setLoading(true);

        if (passwordRequired && !password) {
          throw new Error("Password is required and it was not provided");
        }

        if (passwordRequired) {
          if (!password) {
            throw new Error("Password is required!");
          }
          await accountManager.savePassword(password);
        }

        const {
          address,
          publicKey,
          extendedViewingKey,
          paymentAddress,
          pseudoExtendedKey,
          diversifierIndex,
        } = locationState;
        const account = await accountManager.saveLedgerAccount({
          alias,
          address,
          publicKey,
          bip44Path,
          zip32Path,
          paymentAddress,
          extendedViewingKey,
          pseudoExtendedKey,
          diversifierIndex,
        });

        navigate(routes.ledgerComplete(), {
          state: { account: { ...account, paymentAddress } },
        });
      } catch (e) {
        console.warn(e);
        setError(`${e}`);
      } finally {
        setLoading(false);
      }
    },
    [alias, password, locationState]
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
          <AccountAlias value={alias} onChange={setAlias} />
          {passwordRequired && <Password onValidPassword={setPassword} />}
          {error && <Alert type="error">{error}</Alert>}
        </Stack>
        <ActionButton
          size="lg"
          disabled={(passwordRequired && !password) || !alias}
        >
          Next
        </ActionButton>
      </Stack>
    </>
  );
};
