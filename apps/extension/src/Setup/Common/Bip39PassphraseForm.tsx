import React from "react";

import { Alert, Input, Stack } from "@namada/components";

type Props = {
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
};

const Bip39PassphraseForm: React.FC<Props> = ({
  passphrase,
  setPassphrase,
}) => {
  return (
    <div className="mb-2 [&_input]:w-[92%]">
      <div className="my-3">
        <Alert
          type={"info"}
          title={"Please note"}
          className="mb-3 [&_strong]:normal-case"
        >
          <Stack gap={6}>
            <p className="text-[13px] leading-[1.25] text-white">
              This import option is only users who have created a Namada account
              using the Namada protocol CLI v.0.17.0 or older, and used a BIP39
              passphrase. Do not input your Namada extension password
            </p>
            <Input
              data-testid="setup-import-keys-passphrase-input"
              label="Enter your passphrase"
              placeholder="Optional passphrase for your seed phrase."
              hideIcon={true}
              onChange={(e) => setPassphrase(e.target.value)}
              value={passphrase}
            />
          </Stack>
        </Alert>
      </div>
    </div>
  );
};

export default Bip39PassphraseForm;
