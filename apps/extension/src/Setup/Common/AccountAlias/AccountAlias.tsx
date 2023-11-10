import { Input } from "@namada/components";
import { useState } from "react";

type AccountAliasProps = {
  value: string;
  onChange: (value: string) => void;
};

export const AccountAlias = ({
  value,
  onChange,
}: AccountAliasProps): JSX.Element => {
  const [keysNameError, setKeysNameError] = useState("");

  const verifyKeysName = (): void => {
    if (value === "") {
      setKeysNameError("Required field");
      return;
    }
    setKeysNameError("");
  };

  return (
    <Input
      label="Account Name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => verifyKeysName()}
      placeholder="e.g Namada Shielded Wallet"
      error={keysNameError}
    />
  );
};
