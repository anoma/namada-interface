import {
  Input,
  GapPatterns,
  Heading,
  Stack,
  ActionButton,
} from "@namada/components";
import routes from "App/routes";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DerivedAccount } from "@namada/types";
import { useAccountContext } from "context";

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
      <Heading size="2xl" uppercase>
        Rename Key
      </Heading>

      {account && (
        <Stack full gap={GapPatterns.FormFields}>
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

      {account && <ActionButton>Rename</ActionButton>}
    </Stack>
  );
};
