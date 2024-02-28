import { ActionButton, GapPatterns, Input, Stack } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { PageHeader } from "App/Common";
import routes from "App/routes";
import { useAccountContext } from "context";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type RenameAccountParamsType = {
  accountId: string;
};

export const RenameAccount = (): JSX.Element => {
  const { accountId } = useParams<RenameAccountParamsType>();
  const { getById, rename } = useAccountContext();
  const [account, setAccount] = useState<DerivedAccount | undefined>();
  const [error, setError] = useState("");
  const [alias, setAlias] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      if (!accountId) {
        throw new Error("Invalid account id");
      }
      await rename(accountId, alias);
    } catch (err) {
      setError(`${err}`);
    }
  };

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

  return (
    <Stack
      as="form"
      gap={GapPatterns.TitleContent}
      onSubmit={handleSubmit}
      full
    >
      <PageHeader title="Rename Key" />
      {account && (
        <Stack
          className="flex-1 justify-center"
          full
          gap={GapPatterns.FormFields}
        >
          <Input readOnly label="Current name" value={account.alias} />
          <Input
            autoFocus
            label="New name"
            placeholder="Ex: Special Account"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            error={error}
          />
        </Stack>
      )}
      {account && <ActionButton size="md">Rename</ActionButton>}
    </Stack>
  );
};
