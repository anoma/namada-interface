import { ActionButton, Input, Stack } from "@namada/components";
import SettingsRoute from "App/Settings/routes";
import { indexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { useValidateApiUrl } from "hooks/useValidateApiUrl";
import { useAtom } from "jotai";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const Advanced = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const validateApiUrl = useValidateApiUrl();
  const [currentRpc, setCurrentRpc] = useAtom(rpcUrlAtom);
  const [currentIndexer, setCurrentIndexer] = useAtom(indexerUrlAtom);
  const [rpc, setRpc] = useState(currentRpc);
  const [rpcError, setRpcError] = useState("");
  const [indexer, setIndexer] = useState(currentIndexer);
  const [indexerError, setIndexerError] = useState("");
  const [validatingUrl, setValidatingUrl] = useState(false);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setValidatingUrl(true);
    const [rpcResult, indexerResult] = await Promise.allSettled([
      validateApiUrl(rpc),
      validateApiUrl(indexer),
    ]);
    if (rpcResult.status === "rejected") {
      setRpcError(String(rpcResult.reason));
    }
    if (indexerResult.status === "rejected") {
      setIndexerError(String(indexerResult.reason));
    }
    if (
      rpcResult.status === "fulfilled" &&
      indexerResult.status == "fulfilled"
    ) {
      setCurrentRpc(rpcResult.value);
      setCurrentIndexer(indexerResult.value);
      navigate(SettingsRoute.index(), { replace: true, state: location.state });
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
          error={rpcError}
          label="RPC Url"
          className="[&_input]:border-neutral-300"
          onChange={(e) => {
            setRpc(e.currentTarget.value);
            setRpcError("");
          }}
          required
        />
      </Stack>
      <ActionButton
        size="lg"
        borderRadius="sm"
        className="shrink-0"
        disabled={validatingUrl || !!indexerError || !!rpcError}
      >
        {validatingUrl ? "Verifying..." : "Confirm"}
      </ActionButton>
    </form>
  );
};
