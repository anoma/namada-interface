import { ActionButton, Input, Stack } from "@namada/components";
import SettingsRoute from "App/Settings/routes";
import { indexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { useUpdateIndexerUrl } from "hooks/useUpdateIndexerUrl";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const Advanced = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const updateIndexerUrl = useUpdateIndexerUrl();
  const [currentRpc, setCurrentRpc] = useAtom(rpcUrlAtom);
  const currentIndexer = useAtomValue(indexerUrlAtom);

  const [rpc, setRpc] = useState(currentRpc);
  const [indexer, setIndexer] = useState(currentIndexer);
  const [indexerError, setIndexerError] = useState("");
  const [validatingUrl, setValidatingUrl] = useState(false);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setValidatingUrl(true);
    try {
      await updateIndexerUrl(indexer);
      setCurrentRpc(rpc);
      navigate(SettingsRoute.index(), { replace: true, state: location.state });
    } catch (error) {
      setIndexerError(String(error));
    }
    setValidatingUrl(false);
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
          error={indexerError}
          label="Indexer URL"
          className="[&_input]:border-neutral-300"
          onChange={(e) => {
            setIndexer(e.currentTarget.value);
            setIndexerError("");
          }}
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
      <ActionButton
        size="lg"
        borderRadius="sm"
        className="shrink-0"
        disabled={validatingUrl || !!indexerError}
      >
        {validatingUrl ? "Verifying..." : "Confirm"}
      </ActionButton>
    </form>
  );
};
