import { ActionButton, Input, Stack } from "@namada/components";
import SettingsRoute from "App/Settings/routes";
import { indexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { useAtom } from "jotai";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const Advanced = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRpc, setCurrentRpc] = useAtom(rpcUrlAtom);
  const [currentIndexer, setCurrentIndexer] = useAtom(indexerUrlAtom);
  const [rpc, setRpc] = useState(currentRpc);
  const [indexer, setIndexer] = useState(currentIndexer);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setCurrentIndexer(indexer);
    setCurrentRpc(rpc);
    navigate(SettingsRoute.index(), { replace: true, state: location.state });
  };

  return (
    <form
      className="flex flex-col flex-1 justify-between text-base gap-6"
      onSubmit={onSubmit}
    >
      <Stack gap={6}>
        <Input
          type="text"
          value={indexer}
          label="Indexer URL"
          className="[&_input]:border-neutral-300"
          onChange={(e) => setIndexer(e.currentTarget.value)}
          required
        />
        <Input
          type="text"
          value={rpc}
          label="RPC Url"
          className="[&_input]:border-neutral-300"
          onChange={(e) => setRpc(e.currentTarget.value)}
          required
        />
      </Stack>
      <ActionButton borderRadius="sm" className="shrink-0">
        Confirm
      </ActionButton>
    </form>
  );
};
