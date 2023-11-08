import {
  ActionButton,
  Heading,
  Input,
  InputVariants,
  Stack,
  Text,
} from "@namada/components";
import { CheckPasswordMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { useState } from "react";
import { Ports } from "router";

type LockKeyParams = {
  children: React.ReactNode;
  onUnlock: () => void;
  unlocked: boolean;
  accountId: string;
};

export const LockKey = ({
  accountId,
  children,
  unlocked,
  onUnlock,
}: LockKeyParams): JSX.Element => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const requester = useRequester();

  if (unlocked) return <>{children}</>;

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!password) {
      setError("Required field");
      return;
    }

    setVerifying(true);
    const isValid = await requester.sendMessage<CheckPasswordMsg>(
      Ports.Background,
      new CheckPasswordMsg(password, accountId)
    );

    if (isValid) {
      onUnlock();
    } else {
      setError("Invalid password");
    }

    setVerifying(false);
    e.preventDefault();
  };

  return (
    <Stack as="form" gap={4} onSubmit={onSubmit}>
      <Heading>Verify Password</Heading>
      <Text>Please provide the key password to continue</Text>
      <Input
        variant={InputVariants.Password}
        value={password}
        error={error}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <ActionButton disabled={verifying || unlocked}>Unlock</ActionButton>
    </Stack>
  );
};
