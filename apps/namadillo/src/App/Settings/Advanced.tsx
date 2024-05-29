import { ActionButton, Input, Stack } from "@namada/components";
import { useAtom } from "jotai";
import { useState } from "react";
import { rpcUrlAtom } from "slices/settings";

export const Advanced = (): JSX.Element => {
  const [currentRpc, setCurrentRpc] = useAtom(rpcUrlAtom);
  const [rpc, setRpc] = useState(currentRpc);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setCurrentRpc(rpc);
    window.history.back();
  };

  return (
    <form
      className="flex flex-col flex-1 justify-between text-base"
      onSubmit={onSubmit}
    >
      <Stack gap={6}>
        <Input
          type="text"
          value={rpc}
          label="RPC Url"
          onChange={(e) => setRpc(e.currentTarget.value)}
          required
        />
      </Stack>
      <ActionButton size="lg" borderRadius="sm">
        Confirm
      </ActionButton>
    </form>
  );
};
