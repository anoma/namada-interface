import {
  ActionButton,
  Alert,
  GapPatterns,
  Input,
  SeedPhraseInstructions,
  Stack,
} from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { PageHeader } from "App/Common";
import routes from "App/routes";
import { useAccountContext } from "context";
import { useVaultContext } from "context/VaultContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ViewMnemonicParamsType = {
  accountId: string;
};

export const ViewMnemonic = (): JSX.Element => {
  const { checkPassword } = useVaultContext();
  const { getById, revealMnemonic } = useAccountContext();
  const { accountId } = useParams<ViewMnemonicParamsType>();

  const [passwordChecked, setPasswordChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [_account, setAccount] = useState<DerivedAccount>();
  const [mnemonic, setMnemonic] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const isValidPassword = await checkPassword(password);

    if (!accountId) {
      throw new Error("Invalid account id");
    }

    setPasswordChecked(isValidPassword);
    if (isValidPassword) {
      setMnemonic((await revealMnemonic(accountId)) || "");
      return;
    }

    setPasswordError("Invalid password");
  };

  useEffect(() => {
    if (!accountId) {
      navigate(routes.viewAccountList());
      return;
    }

    const account = getById(accountId);
    if (!account) {
      navigate(routes.viewAccountList());
      return;
    }

    setAccount(account);
    setPasswordChecked(false);
  }, [accountId]);

  return (
    <Stack full as="form" gap={4} onSubmit={handleSubmit}>
      <PageHeader title="View Seed Phrase" />

      {!passwordChecked && (
        <>
          <Stack className="mt-12" full gap={GapPatterns.FormFields}>
            <Alert type="info">
              Please provide your password in order to view your seed phrase
            </Alert>
            <Input
              autoFocus
              variant="Password"
              label="Password"
              placeholder="Password"
              error={passwordError}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Stack>
          <ActionButton type="submit" size="md" disabled={!password}>
            Proceed
          </ActionButton>
        </>
      )}

      {passwordChecked && (
        <>
          <Stack className="flex-1 justify-center" full gap={1}>
            <div className="text-sm -mt-1.5">
              <SeedPhraseInstructions />
            </div>
            <Input
              variant="Textarea"
              readOnly={true}
              value={mnemonic}
              sensitive
              className="[&_textarea]:rounded-lg [&_textarea]:py-8 [&_textarea]:px-6"
              rows={mnemonic.split(" ").length === 24 ? 5 : 3}
            />
          </Stack>
          <ActionButton size="md" onClick={() => navigate(-1)}>
            Back
          </ActionButton>
        </>
      )}
    </Stack>
  );
};
