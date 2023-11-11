import {
  ActionButton,
  Alert,
  GapPatterns,
  Heading,
  Input,
  InputVariants,
  LinkButton,
  SeedPhraseInstructions,
  Stack,
  Textarea,
} from "@namada/components";
import { DerivedAccount } from "@namada/types";
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
    <Stack gap={GapPatterns.TitleContent}>
      <Heading>View Recovery Phrase</Heading>

      {!passwordChecked && (
        <Stack as="form" gap={GapPatterns.FormFields} onSubmit={handleSubmit}>
          <Alert type="info">
            Please provide your password in order to view your recovery phrase
          </Alert>
          <Input
            variant={InputVariants.Password}
            label="Password"
            placeholder="Password"
            error={passwordError}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ActionButton disabled={!password}>Proceed</ActionButton>
        </Stack>
      )}

      {passwordChecked && (
        <Stack gap={GapPatterns.FormFields}>
          <SeedPhraseInstructions />
          <Textarea
            theme="secondary"
            readOnly={true}
            value={mnemonic}
            sensitive
          />
          <LinkButton onClick={() => navigate(-1)}>Back</LinkButton>
        </Stack>
      )}
    </Stack>
  );
};
