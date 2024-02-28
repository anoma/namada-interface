import { ActionButton, Alert, Input, Stack } from "@namada/components";
import routes from "Setup/routes";
import { AccountSecret } from "background/keyring";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  onConfirm: (accountSecret: AccountSecret) => void;
  accountSecret?: AccountSecret;
};

const ImportPassphrase = (props: Props): JSX.Element => {
  const [passphrase, setPassphrase] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!props.accountSecret) {
      navigate(routes.accountImportSeed());
      return;
    }
  }, []);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!props.accountSecret || props.accountSecret.t !== "Mnemonic") {
      return;
    }

    props.onConfirm({ ...props.accountSecret, t: "Mnemonic", passphrase });
  };

  return (
    <Stack className="mt-2" as="form" gap={8} onSubmit={onSubmit}>
      <Input
        label="Enter your Passphrase"
        value={passphrase}
        variant="PasswordOnBlur"
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="e.g jdehrfu3rfhwjderr4"
      />
      <Alert type={"warning"}>
        <Stack className="leading-5" gap={3}>
          <div className="text-sm text-white">
            <strong className="text-yellow block">Please Note</strong>
            Your passphrase is different to your account password that encrypts
            and unlocks the extension
          </div>
          <div className="text-sm text-white">
            <strong className="block text-yellow">
              Back up the passphrase safely
            </strong>
            Your passphrase is different to your account password that encrypts
            and unlocks the extension. Please ensure you know the difference
          </div>
        </Stack>
      </Alert>
      <ActionButton size="lg" disabled={passphrase.length === 0}>
        Next
      </ActionButton>
    </Stack>
  );
};

export default ImportPassphrase;
