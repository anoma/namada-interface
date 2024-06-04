import { ActionButton, Input, Stack } from "@namada/components";
import SettingsRoute from "App/Settings/routes";
import { useAtom } from "jotai";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { rpcUrlAtom } from "slices/settings";

export const Advanced = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRpc, setCurrentRpc] = useAtom(rpcUrlAtom);
  const [rpc, setRpc] = useState(currentRpc);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setCurrentRpc(rpc);
    navigate(SettingsRoute.index(), { replace: true, state: location.state });
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
          className="[&_input]:border-neutral-300"
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
