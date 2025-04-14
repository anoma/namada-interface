import { ActionButton, GapPatterns, Stack, ViewKeys } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { PageHeader } from "App/Common";
import routes from "App/routes";
import { useAccountContext } from "context";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type RenameAccountParamsType = {
  accountId: string;
};

export const ViewDisposableAccount = (): JSX.Element => {
  const { accountId } = useParams<RenameAccountParamsType>();
  const { getById, revealPrivateKey } = useAccountContext();

  const [account, setAccount] = useState<DerivedAccount | undefined>();
  const [privateKey, setPrivateKey] = useState<string | undefined>();

  const navigate = useNavigate();

  useEffect(() => {
    if (!accountId) {
      navigate(routes.viewAccountList());
      return;
    }

    const account = getById(accountId);
    if (!account) {
      throw new Error("Invalid account provided");
    }

    setAccount(account);
  }, [accountId]);

  useEffect(() => {
    void (async (): Promise<void> => {
      if (!accountId) {
        return;
      }
      const privateKey = await revealPrivateKey(accountId);

      setPrivateKey(privateKey);
    })();
  }, []);

  return (
    <>
      <PageHeader title="Disposable refund keys" />
      <Stack gap={GapPatterns.FormFields} full>
        <ViewKeys
          privateKey={privateKey || ""}
          privateKeyLoading={!privateKey}
          transparentAccountAddress={account?.address}
          trimCharacters={21}
        />
        <Stack className="flex-1 justify-start" gap={4} full>
          <p className="text-white leading-5 text-sm px-2 font-medium">
            Use the keys above to send refunds back to one of your main accounts
            using a Namada interface.
          </p>
          <p className="text-white leading-5 text-sm px-2 font-medium">
            Once funds have been sent please delete this account as they are
            only one time use.
          </p>
        </Stack>
        <ActionButton
          size="md"
          onClick={() => navigate(routes.deleteDisposableAccount(accountId))}
        >
          Delete Account
        </ActionButton>
      </Stack>
    </>
  );
};
